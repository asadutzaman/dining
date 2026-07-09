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

  // Scan -> look up member -> immediately issue a DUE token + print.
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
    setPartial({memberLoading: true})
    MemberApi.findByCard(card)
      .then((res: any) => issueToken(res.data))
      .catch(() => {
        setPartial({memberLoading: false, cardNumber: ''})
        Message.error('No member found for this card number.')
        refocus()
      })
  }

  const issueToken = (member: any) => {
    const activeMeal = resolveActiveMeal()
    MealTokenApi.create({
      member_id: member.id,
      meal_type: activeMeal,
      payment_status: 'DUE',
    })
      .then((res: any) => {
        const token = res.data
        setPartial({memberInfo: member, lastToken: token, memberLoading: false, cardNumber: ''})
        printReceipt(token, member)
        Message.success('Token issued.')
        refocus()
      })
      .catch((err: any) => {
        // Show who was scanned even when issuance fails (e.g. already issued for this meal today)
        setPartial({memberInfo: member, memberLoading: false, cardNumber: ''})
        const msg =
          err?.status === 422 && typeof err.data === 'string'
            ? err.data
            : 'A network error occurred. Please try again later.'
        Message.error(msg)
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
    />
  )
}

export default MealTokenIssueController
