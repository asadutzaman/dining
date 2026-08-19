import React, {FC, useRef, useState} from 'react'
import {MemberApi, PaymentApi} from 'src/app/api'
import {Message} from 'src/app/utils'
import PaymentCollectView from './PaymentCollect.view'

const initialFormState = {
  cardNumber: '',
  memberInfo: null as any,
  memberLoading: false,
  amount: null as any,
  remarks: '',
  submitting: false,
  paidReceipt: null as any,
}

const PaymentCollectController: FC = () => {
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
        setPartial({memberInfo: res.data, memberLoading: false, amount: res.data.due_balance})
      })
      .catch(() => {
        setPartial({memberLoading: false, memberInfo: null})
        Message.error('No member found for this card number.')
      })
  }

  const handleCardNumberChange = (value: string) => {
    setPartial({cardNumber: value})
  }

  const handleCardScan = () => {
    lookupMember(state.cardNumber.trim())
  }

  const handleAmountChange = (value: any) => {
    setPartial({amount: value})
  }

  const handleRemarksChange = (value: string) => {
    setPartial({remarks: value})
  }

  const handleCollectPayment = () => {
    if (!state.memberInfo) {
      Message.error('Please scan a valid card first.')
      return
    }
    if (!state.amount || Number(state.amount) <= 0) {
      Message.error('Please enter a valid amount.')
      return
    }
    if (Number(state.amount) > Number(state.memberInfo.due_balance)) {
      Message.error('Amount cannot exceed the due balance.')
      return
    }

    setPartial({submitting: true})
    PaymentApi.create({
      member_id: state.memberInfo.id,
      amount: state.amount,
      payment_date: new Date().toISOString().slice(0, 10),
      payment_method: 'CASH',
      remarks: state.remarks,
    })
      .then((res: any) => {
        Message.success('Payment collected successfully.')
        setPartial({submitting: false, paidReceipt: res.data})
      })
      .catch((err: any) => {
        setPartial({submitting: false})
        const errMessage =
          err?.status === 422 && typeof err.data === 'string' ? err.data : 'A network error occurred. Please try again later.'
        Message.error(errMessage)
      })
  }

  const handleCollectAnother = () => {
    setState(initialFormState)
    setTimeout(() => {
      cardInputRef.current?.focus()
    }, 100)
  }

  return (
    <PaymentCollectView
      {...state}
      cardInputRef={cardInputRef}
      handleCardNumberChange={handleCardNumberChange}
      handleCardScan={handleCardScan}
      handleAmountChange={handleAmountChange}
      handleRemarksChange={handleRemarksChange}
      handleCollectPayment={handleCollectPayment}
      handleCollectAnother={handleCollectAnother}
    />
  )
}

export default PaymentCollectController
