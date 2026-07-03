import React, {FC, useRef, useState} from 'react'
import {MemberApi, MealTokenApi} from 'src/app/api'
import {Message} from 'src/app/utils'
import MealTokenIssueView from './MealTokenIssue.view'

const initialState = {
  cardNumber: '',
  memberInfo: null as any,
  memberLoading: false,
  mealType: 'BREAKFAST', // persistent across scans (operator sets the current meal)
  lastToken: null as any,
}

const MEAL_LABEL: any = {BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner'}

const MealTokenIssueController: FC = () => {
  const [state, setState] = useState<any>(initialState)
  const cardInputRef = useRef<any>(null)

  const setPartial = (partial: any) => setState((prev: any) => ({...prev, ...partial}))

  const refocus = () => setTimeout(() => cardInputRef.current?.focus(), 50)

  const handleCardNumberChange = (value: string) => setPartial({cardNumber: value})

  const handleMealTypeChange = (value: string) => setPartial({mealType: value})

  // Scan -> look up member -> immediately issue a DUE token + print.
  const handleCardScan = () => {
    const card = state.cardNumber.trim()
    if (!card) {
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
    MealTokenApi.create({
      member_id: member.id,
      meal_type: state.mealType,
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
    const win = window.open('', 'PRINT', 'width=360,height=640')
    if (!win) {
      return
    }
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
      win.document.write(html)
      win.document.close()
      win.focus()
      win.print()
      win.close()
    } catch (e) {
      // ignore print failures; token is still recorded
    }
  }

  const handleReset = () => {
    setState({...initialState, mealType: state.mealType})
    refocus()
  }

  return (
    <MealTokenIssueView
      {...state}
      cardInputRef={cardInputRef}
      handleCardNumberChange={handleCardNumberChange}
      handleCardScan={handleCardScan}
      handleMealTypeChange={handleMealTypeChange}
      handleReset={handleReset}
    />
  )
}

export default MealTokenIssueController
