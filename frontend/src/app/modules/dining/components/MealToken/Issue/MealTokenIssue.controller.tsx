import React, {FC, useEffect, useRef, useState} from 'react'
import {MemberApi, MealTokenApi, MealSettingApi} from 'src/app/api'
import {Message, ReceiptAgentUtils, StorageUtils, ThermalPrintUtils} from 'src/app/utils'
import MealTokenIssueView from './MealTokenIssue.view'

// Applies to the browser-printing fallback only. When the local ESC/POS agent is running,
// Chrome's print pipeline is never touched and the page never reloads. On the fallback path the
// reload keeps a wedged pipeline from accumulating across scans; raise this if the reload cost
// hurts throughput, anything below the ~5-6 mark where printing historically died still works.
const RELOAD_AFTER_N_PRINTS = 1

// Hand-off across that reload: the operator should still see who was just served.
const HANDOFF_KEY = 'dining.mealToken.lastScan'
const HANDOFF_TTL_MS = 120000

const initialState = {
  cardNumber: '',
  memberInfo: null as any,
  memberLoading: false,
  mealType: 'BREAKFAST', // manual fallback meal (used only when no time windows are configured)
  // Auto-detected serving info: {meal_type, cost, windows_configured}
  mealInfo: null as any,
  // Until the first currentMeal() call settles we cannot know which meal is being served, and
  // resolveActiveMeal() would fall back to the 'BREAKFAST' default -- so a card scanned in that
  // window would silently issue a BREAKFAST token at dinner. Scanning stays closed until this
  // is true. It matters because the page reloads after every scan.
  mealLoaded: false,
  lastToken: null as any,

  // Enrollment at the counter. NCMS lists ~1000 staff/students but only ~170-200 actually eat
  // here, and nobody has a list of which. So the roster is staged in `candidates` and people
  // become dining members the first time they punch in -- handled by the two states below.

  // Card is on the NCMS roster but its owner is not a dining member yet: awaiting the
  // operator's confirmation before we enroll them.
  enrollCandidate: null as any,
  // Card matched nothing at all. Usually a dining member whose NCMS record has no RFID:
  // the operator finds them on the roster and we bind this physical card to them.
  unknownCard: '',
  enrolling: false,

  assignOpen: false,
  assignSearch: '',
  assignResults: [] as any[],
  assignLoading: false,

  // Print jobs are completing without the printer ever reporting back. Tokens are still being
  // recorded, so without a visible warning the operator would keep issuing unprinted tokens.
  printStalled: false,

  // null while probing. false means the local print agent is not running, so receipts go through
  // the slower browser path -- which is also the only path that reloads the page after a scan.
  agentReady: null as boolean | null,
}

const MEAL_LABEL: any = {BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner'}

const MealTokenIssueController: FC = () => {
  const [state, setState] = useState<any>(initialState)
  const cardInputRef = useRef<any>(null)
  const stateRef = useRef<any>(state)
  stateRef.current = state
  const printsSinceReload = useRef<number>(0)

  const setPartial = (partial: any) => setState((prev: any) => ({...prev, ...partial}))

  const refocus = () => setTimeout(() => cardInputRef.current?.focus(), 50)

  const handleCardNumberChange = (value: string) => setPartial({cardNumber: value})

  const handleMealTypeChange = (value: string) => setPartial({mealType: value})

  // Auto-detect which meal is being served now (re-checked on mount + every minute).
  const loadCurrentMeal = () => {
    MealSettingApi.currentMeal()
      .then((res: any) => setPartial({mealInfo: res.data, mealLoaded: true}))
      // A failure is not fatal: it just means no time windows are known, which is the
      // legitimate fallback to the manual meal picker. Either way the answer has settled.
      .catch(() => setPartial({mealInfo: null, mealLoaded: true}))
  }

  useEffect(() => {
    loadCurrentMeal()
    const timer = setInterval(loadCurrentMeal, 60000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    ThermalPrintUtils.setStallHandler(() => setPartial({printStalled: true}))
    return () => ThermalPrintUtils.setStallHandler(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Find out up front whether the local print agent is available, so the view can tell the
  // operator which path is in use -- browser printing is noticeably slower and reloads the page.
  useEffect(() => {
    ReceiptAgentUtils.probe().then((ok: boolean) => setPartial({agentReady: ok}))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pick up the scan that was on screen before the post-print reload. takeFresh() also clears
  // the key, so a later manual reload cannot resurrect a stale student.
  useEffect(() => {
    const handoff: any = StorageUtils.takeFresh(HANDOFF_KEY, HANDOFF_TTL_MS)
    if (!handoff) {
      return
    }
    setPartial({
      memberInfo: handoff.memberInfo || null,
      lastToken: handoff.lastToken || null,
      // The printer was stalled before the reload and nothing since has proved otherwise.
      printStalled: !!handoff.printStalled,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The meal a token will be issued for: time-detected when windows are set, else the manual pick.
  const resolveActiveMeal = () => {
    const s = stateRef.current
    if (s.mealInfo?.windows_configured) {
      return s.mealInfo.meal_type || null
    }
    return s.mealType
  }

  // Scan -> resolve the card -> issue a DUE token + print.
  //
  // A punched card lands in exactly one of three states:
  //   1. an enrolled dining member          -> issue the token (the common case)
  //   2. on the NCMS roster, not a member    -> offer to enroll them, then issue
  //   3. matched nothing                     -> offer to find the person and bind this card
  const handleCardScan = () => {
    const card = state.cardNumber.trim()
    if (!card) {
      return
    }
    // Refuse the scan rather than guess the meal -- see `mealLoaded`.
    if (!state.mealLoaded) {
      Message.warning('Still loading the current meal. Please scan again in a moment.')
      setPartial({cardNumber: ''})
      refocus()
      return
    }
    if (!resolveActiveMeal()) {
      Message.error('No meal is being served right now. Check the meal time windows.')
      setPartial({cardNumber: ''})
      refocus()
      return
    }
    // Drop the carried-over previous student as soon as a new card is in play.
    setPartial({
      memberLoading: true,
      enrollCandidate: null,
      unknownCard: '',
      memberInfo: null,
      lastToken: null,
    })
    MemberApi.findByCard(card)
      .then((res: any) => issueToken(res.data))
      .catch(() => resolveUnknownCard(card))
  }

  // The card is not a dining member's. Ask the NCMS roster who it belongs to.
  const resolveUnknownCard = (card: string) => {
    MemberApi.candidateFindByCard(card)
      .then((res: any) => {
        setPartial({
          enrollCandidate: res.data,
          unknownCard: '',
          memberInfo: null,
          memberLoading: false,
          cardNumber: '',
        })
        refocus()
      })
      .catch(() => {
        setPartial({
          enrollCandidate: null,
          unknownCard: card,
          memberInfo: null,
          memberLoading: false,
          cardNumber: '',
        })
        refocus()
      })
  }

  // Operator confirmed the person on the roster eats here. Enroll them, then issue the token.
  // Deliberately a confirmed click, never automatic: a stray punch from any of the ~800
  // non-members would otherwise enroll them permanently.
  const handleEnrollConfirm = () => {
    const candidate = stateRef.current.enrollCandidate
    if (!candidate?.rfid) {
      return
    }
    setPartial({enrolling: true})
    MemberApi.enrollByCard(candidate.rfid)
      .then((res: any) => {
        setPartial({enrolling: false, enrollCandidate: null})
        Message.success(`${res.data.name} enrolled as a dining member.`)
        issueToken(res.data)
      })
      .catch((err: any) => {
        setPartial({enrolling: false})
        Message.error(readError(err, 'Enrollment failed. Please try again.'))
        refocus()
      })
  }

  const handleEnrollCancel = () => {
    setPartial({enrollCandidate: null, unknownCard: ''})
    refocus()
  }

  // --- Unrecognized card: find the person on the roster and bind this card to them ---

  const handleAssignOpen = () => {
    setPartial({assignOpen: true, assignSearch: '', assignResults: []})
  }

  const handleAssignClose = () => {
    setPartial({assignOpen: false, assignSearch: '', assignResults: []})
    refocus()
  }

  const handleAssignSearch = (value: string) => {
    setPartial({assignSearch: value})
    if (!value || value.trim().length < 2) {
      setPartial({assignResults: []})
      return
    }
    setPartial({assignLoading: true})
    MemberApi.candidateList({$search: value.trim(), $top: 20, $skip: 0})
      .then((res: any) => setPartial({assignResults: res.data?.results || [], assignLoading: false}))
      .catch(() => setPartial({assignResults: [], assignLoading: false}))
  }

  const handleAssignSelect = (candidate: any) => {
    const card = stateRef.current.unknownCard
    if (!card) {
      return
    }
    setPartial({enrolling: true})
    MemberApi.enrollAndBindCard(candidate.id, card)
      .then((res: any) => {
        setPartial({
          enrolling: false,
          assignOpen: false,
          assignSearch: '',
          assignResults: [],
          unknownCard: '',
        })
        Message.success(`Card ${card} assigned to ${res.data.name}.`)
        issueToken(res.data)
      })
      .catch((err: any) => {
        setPartial({enrolling: false})
        Message.error(readError(err, 'Could not assign this card. Please try again.'))
      })
  }

  const readError = (err: any, fallback: string) =>
    err?.status === 422 && typeof err.data === 'string' ? err.data : fallback

  const issueToken = (member: any) => {
    const activeMeal = resolveActiveMeal()
    MealTokenApi.create({
      member_id: member.id,
      meal_type: activeMeal,
      payment_status: 'DUE',
    })
      .then((res: any) => {
        const token = res.data
        setPartial({
          memberInfo: member,
          lastToken: token,
          memberLoading: false,
          cardNumber: '',
          enrollCandidate: null,
          unknownCard: '',
        })
        printsSinceReload.current += 1
        printReceipt(token, member)
        Message.success('Token issued.')
        refocus()
      })
      .catch((err: any) => {
        // Show who was scanned even when issuance fails (e.g. already issued for this meal today)
        setPartial({
          memberInfo: member,
          memberLoading: false,
          cardNumber: '',
          enrollCandidate: null,
          unknownCard: '',
        })
        Message.error(readError(err, 'A network error occurred. Please try again later.'))
        refocus()
      })
  }

  // Preferred path: hand the receipt to the local ESC/POS agent, which talks to the printer
  // directly. Chrome's print pipeline -- the thing that wedges after a handful of kiosk jobs --
  // is never involved, so no page reload is needed either.
  const printReceipt = (token: any, member: any) => {
    ReceiptAgentUtils.print({
      token_number: token.token_number,
      meal_type: token.meal_type,
      meal_date: token.meal_date,
      amount: token.amount,
      created_at: token.created_at,
      member_name: member.name ?? token.member_name ?? '',
      member_code: member.member_code ?? token.member_code ?? '',
    })
      .then((res: any) => {
        if (!res?.ok) {
          // The printer itself is the problem (no paper, cover open). Falling back to browser
          // printing would not help, so tell the operator instead of silently issuing nothing.
          setPartial({printStalled: true})
          Message.error(`Not printed — ${res?.blocking || res?.error || 'printer unavailable'}.`)
          return
        }
        if (res.advisory) {
          Message.warning(`Printer: ${res.advisory}`)
        }
        setPartial({printStalled: false})
      })
      .catch(() => {
        // The agent is not running or not reachable. Degrade to browser printing rather than
        // leaving the counter unable to print at all.
        printViaBrowser(token, member)
      })
  }

  // Fallback only. This is the old path, and the one that needs the post-print page reload.
  const printViaBrowser = (token: any, member: any) => {
    const meal = MEAL_LABEL[token.meal_type] || token.meal_type
    const html = `
      <html>
        <head>
          <title>${token.token_number}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            * { box-sizing: border-box; }
            body { width: 80mm; margin: 0; padding: 6mm 4mm; font-family: 'Courier New', monospace; color: #000; }
            .center { text-align: center; }
            .head { font-size: 13px; font-weight: bold; letter-spacing: 1px; }
            .sub { font-size: 10px; margin-bottom: 6px; }
            .hr { border-top: 1px dashed #000; margin: 6px 0; }
            .token { font-size: 40px; font-weight: bold; line-height: 1.1; margin: 4px 0; }
            .row { display: flex; justify-content: space-between; font-size: 12px; margin: 2px 0; }
            .meal { font-size: 18px; font-weight: bold; margin: 4px 0; }
            .due { font-size: 14px; font-weight: bold; border: 2px solid #000; display: inline-block; padding: 2px 10px; margin-top: 4px; }
            .foot { font-size: 10px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="center head">COLLEGE DINING</div>
          <div class="center sub">Meal Token</div>
          <div class="hr"></div>
          <div class="center meal">${meal}</div>
          <div class="center token">${token.token_number}</div>
          <div class="hr"></div>
          <div class="row"><span>Name</span><span>${member.name ?? token.member_name ?? ''}</span></div>
          <div class="row"><span>Member</span><span>${member.member_code ?? token.member_code ?? ''}</span></div>
          <div class="row"><span>Date</span><span>${token.meal_date ?? ''}</span></div>
          <div class="row"><span>Amount</span><span>${token.amount ?? ''}</span></div>
          <div class="center"><span class="due">DUE</span></div>
          <div class="hr"></div>
          <div class="center foot">Issued: ${token.created_at ?? ''}</div>
          <div class="center foot">Show this token to collect your meal</div>
        </body>
      </html>`
    // Queued rather than printed inline: overlapping print jobs wedge Chrome's per-tab print
    // path, and printing must stay off the scan critical path so the card field is ready for
    // the next card immediately. See ThermalPrintUtils.
    //
    // The reload runs from onDone, never earlier: tearing the page down while the job is still
    // spooling is precisely what wedges the print pipeline we are working around.
    ThermalPrintUtils.print(html, reloadIfSafe)
  }

  // Reload the tab so Chrome's print state starts clean for the next scan. Skipped whenever the
  // operator is mid-task -- a reload there would throw away work they can't easily redo.
  const reloadIfSafe = () => {
    if (printsSinceReload.current < RELOAD_AFTER_N_PRINTS) {
      return
    }
    if (!ThermalPrintUtils.isIdle()) {
      return // more receipts still queued; the last one will reload instead
    }
    const s = stateRef.current
    if (s.enrollCandidate || s.unknownCard || s.assignOpen || s.enrolling) {
      return
    }
    if (s.cardNumber) {
      return // a scan is part-typed; reloading now would swallow it
    }
    StorageUtils.set(HANDOFF_KEY, {
      memberInfo: s.memberInfo,
      lastToken: s.lastToken,
      printStalled: s.printStalled,
      savedAt: Date.now(),
    })
    window.location.reload()
  }

  const handleReset = () => {
    // printStalled survives Clear: the printer is still stalled, and hiding the warning here
    // would leave the operator issuing unprinted tokens again. mealLoaded survives too --
    // resetting it would re-close the scan field even though the meal is already known.
    setState({
      ...initialState,
      mealType: state.mealType,
      mealInfo: state.mealInfo,
      mealLoaded: state.mealLoaded,
      printStalled: state.printStalled,
      agentReady: state.agentReady,
    })
    refocus()
  }

  return (
    <MealTokenIssueView
      {...state}
      activeMeal={resolveActiveMeal()}
      cardInputRef={cardInputRef}
      handleCardNumberChange={handleCardNumberChange}
      handleCardScan={handleCardScan}
      handleMealTypeChange={handleMealTypeChange}
      handleReset={handleReset}
      handleEnrollConfirm={handleEnrollConfirm}
      handleEnrollCancel={handleEnrollCancel}
      handleAssignOpen={handleAssignOpen}
      handleAssignClose={handleAssignClose}
      handleAssignSearch={handleAssignSearch}
      handleAssignSelect={handleAssignSelect}
    />
  )
}

export default MealTokenIssueController
