import React, {FC, useRef, useState} from 'react'
import {MemberApi, MealSettingApi, MealTokenApi} from 'src/app/api'
import {Message} from 'src/app/utils'
import MealTokenIssueView from './MealTokenIssue.view'

const initialFormState = {
  cardNumber: '',
  memberInfo: null as any,
  memberLoading: false,
  mealType: 'BREAKFAST',
  costInfo: null as any,
  costLoading: false,
  paymentStatus: 'PAID',
  submitting: false,
  issuedToken: null as any,
}

const MealTokenIssueController: FC = () => {
  const [state, setState] = useState<any>(initialFormState)
  const cardInputRef = useRef<any>(null)

  const setPartial = (partial: any) => setState((prev: any) => ({...prev, ...partial}))

  const lookupMember = (cardNumber: string) => {
    if (!cardNumber) {
      return
    }
    setPartial({memberLoading: true, memberInfo: null})
    MemberApi.findByCard(cardNumber)
      .then((res: any) => {
        setPartial({memberInfo: res.data, memberLoading: false})
        loadCost(state.mealType)
      })
      .catch((err: any) => {
        setPartial({memberLoading: false, memberInfo: null})
        Message.error('No member found for this card number.')
      })
  }

  const loadCost = (mealType: string) => {
    setPartial({costLoading: true, costInfo: null})
    MealSettingApi.currentCost(mealType)
      .then((res: any) => {
        setPartial({costInfo: res.data, costLoading: false})
      })
      .catch(() => {
        setPartial({costLoading: false, costInfo: null})
        Message.error('No active cost setting found for this meal.')
      })
  }

  const handleCardNumberChange = (value: string) => {
    setPartial({cardNumber: value})
  }

  const handleCardScan = () => {
    lookupMember(state.cardNumber.trim())
  }

  const handleMealTypeChange = (value: string) => {
    setPartial({mealType: value})
    loadCost(value)
  }

  const handlePaymentStatusChange = (value: string) => {
    setPartial({paymentStatus: value})
  }

  const handleIssueToken = () => {
    if (!state.memberInfo) {
      Message.error('Please scan a valid card first.')
      return
    }
    if (!state.costInfo) {
      Message.error('No active cost setting found for this meal.')
      return
    }

    setPartial({submitting: true})
    MealTokenApi.create({
      member_id: state.memberInfo.id,
      meal_type: state.mealType,
      payment_status: state.paymentStatus,
    })
      .then((res: any) => {
        Message.success('Token issued successfully.')
        setPartial({
          submitting: false,
          issuedToken: res.data,
        })
      })
      .catch((err: any) => {
        setPartial({submitting: false})
        const errMessage =
          err?.status === 422 && typeof err.data === 'string' ? err.data : 'A network error occurred. Please try again later.'
        Message.error(errMessage)
      })
  }

  const handleIssueAnother = () => {
    setState(initialFormState)
    setTimeout(() => {
      cardInputRef.current?.focus()
    }, 100)
  }

  return (
    <MealTokenIssueView
      {...state}
      cardInputRef={cardInputRef}
      handleCardNumberChange={handleCardNumberChange}
      handleCardScan={handleCardScan}
      handleMealTypeChange={handleMealTypeChange}
      handlePaymentStatusChange={handlePaymentStatusChange}
      handleIssueToken={handleIssueToken}
      handleIssueAnother={handleIssueAnother}
    />
  )
}

export default MealTokenIssueController
