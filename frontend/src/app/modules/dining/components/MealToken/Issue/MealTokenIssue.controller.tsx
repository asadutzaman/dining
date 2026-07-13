import React, {FC, useEffect, useRef, useState} from 'react'
import {MemberApi, MealTokenApi, MealSettingApi} from 'src/app/api'
import {Message} from 'src/app/utils'
import MealTokenIssueView from './MealTokenIssue.view'

const initialState = {
  cardNumber: '',
  memberInfo: null as any,
  memberLoading: false,
  mealType: 'BREAKFAST', // manual fallback meal (used only when no time windows are configured)
  // Auto-detected serving info: {meal_type, cost, windows_configured}
  mealInfo: null as any,
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
}

const MEAL_LABEL: any = {BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner'}

const MealTokenIssueController: FC = () => {
  const [state, setState] = useState<any>(initialState)
  const cardInputRef = useRef<any>(null)
  const stateRef = useRef<any>(state)
  stateRef.current = state

  const setPartial = (partial: any) => setState((prev: any) => ({...prev, ...partial}))

  const refocus = () => setTimeout(() => cardInputRef.current?.focus(), 50)

  const handleCardNumberChange = (value: string) => setPartial({cardNumber: value})

  const handleMealTypeChange = (value: string) => setPartial({mealType: value})

  // Auto-detect which meal is being served now (re-checked on mount + every minute).
  const loadCurrentMeal = () => {
    MealSettingApi.currentMeal()
      .then((res: any) => setPartial({mealInfo: res.data}))
      .catch(() => setPartial({mealInfo: null}))
  }

  useEffect(() => {
    loadCurrentMeal()
    const timer = setInterval(loadCurrentMeal, 60000)
    return () => clearInterval(timer)
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
    if (!resolveActiveMeal()) {
      Message.error('No meal is being served right now. Check the meal time windows.')
      setPartial({cardNumber: ''})
      refocus()
      return
    }
    setPartial({memberLoading: true, enrollCandidate: null, unknownCard: ''})
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

  const printReceipt = (token: any, member: any) => {
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
    try {
      // A hidden iframe (instead of window.open) isn't subject to popup-blocking,
      // which matters here since this runs async after the scan/API calls, not
      // directly inside a user-gesture handler.
      let frame = document.getElementById('token-print-frame') as HTMLIFrameElement | null
      if (!frame) {
        frame = document.createElement('iframe')
        frame.id = 'token-print-frame'
        frame.style.position = 'fixed'
        frame.style.width = '0'
        frame.style.height = '0'
        frame.style.border = '0'
        document.body.appendChild(frame)
      }
      const frameWindow = frame.contentWindow
      const doc = frameWindow?.document
      if (!doc || !frameWindow) {
        return
      }
      doc.open()
      doc.write(html)
      doc.close()
      frameWindow.focus()
      frameWindow.print()
    } catch (e) {
      // ignore print failures; token is still recorded
    }
  }

  const handleReset = () => {
    setState({...initialState, mealType: state.mealType, mealInfo: state.mealInfo})
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
