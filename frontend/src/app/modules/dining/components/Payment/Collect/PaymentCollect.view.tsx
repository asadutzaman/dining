import React, {FC} from 'react'
import {Input, InputNumber, Button, Row, Col, Spin, Statistic, Tag} from 'antd'

const PaymentCollectView: FC<any> = (props) => {
  const {
    cardNumber,
    memberInfo,
    memberLoading,
    amount,
    remarks,
    submitting,
    paidReceipt,
    cardInputRef,
    handleCardNumberChange,
    handleCardScan,
    handleAmountChange,
    handleRemarksChange,
    handleCollectPayment,
    handleCollectAnother,
  } = props

  if (paidReceipt) {
    return (
      <div className='card'>
        <div className='p-10 text-center'>
          <h3 className='mb-6'>Payment Collected</h3>
          <div
            className='d-inline-block p-10 mb-6'
            style={{border: '2px dashed #999', borderRadius: 8, minWidth: 320}}
          >
            <h1 style={{fontSize: 40, marginBottom: 8}}>{paidReceipt.payment_number}</h1>
            <div className='fs-4 mb-2'>{paidReceipt.member_name}</div>
            <div className='fs-6 text-muted mb-2'>{paidReceipt.member_code}</div>
            <div className='fs-2 fw-bold mt-3'>{paidReceipt.amount}</div>
            <Tag color='green' style={{marginTop: 8}}>
              PAID
            </Tag>
          </div>
          <div>
            <Button type='primary' size='large' onClick={handleCollectAnother}>
              Collect Next Payment
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='card'>
      <div className='p-6'>
        <h3 className='mb-6'>Collect Due Bill</h3>

        <Row gutter={[16, 16]}>
          <Col md={12} xs={24}>
            <label className='fw-bold mb-2 d-block'>Scan / Enter RFID Card</label>
            <Input
              ref={cardInputRef}
              autoFocus
              size='large'
              placeholder='Scan card or type card number and press Enter'
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              onPressEnter={handleCardScan}
              suffix={memberLoading ? <Spin size='small' /> : null}
            />
          </Col>
        </Row>

        {memberInfo && (
          <div className='mt-6 p-4' style={{background: '#f5f5f5', borderRadius: 8}}>
            <Row gutter={[16, 16]}>
              <Col md={6} xs={12}>
                <Statistic title='Member' value={`${memberInfo.member_code} - ${memberInfo.name}`} />
              </Col>
              <Col md={6} xs={12}>
                <Statistic title='Type' value={memberInfo.member_type} />
              </Col>
              <Col md={6} xs={12}>
                <Statistic
                  title='Due Balance'
                  value={memberInfo.due_balance ?? 0}
                  valueStyle={{color: Number(memberInfo.due_balance) > 0 ? '#cf1322' : '#3f8600'}}
                />
              </Col>
            </Row>
          </div>
        )}

        {memberInfo && Number(memberInfo.due_balance) > 0 && (
          <>
            <Row gutter={[16, 16]} className='mt-6'>
              <Col md={6} xs={12}>
                <label className='fw-bold mb-2 d-block'>Amount to Collect</label>
                <InputNumber
                  style={{width: '100%'}}
                  min={0.01}
                  max={Number(memberInfo.due_balance)}
                  step={0.01}
                  precision={2}
                  value={amount}
                  onChange={handleAmountChange}
                />
              </Col>
              <Col md={12} xs={24}>
                <label className='fw-bold mb-2 d-block'>Remarks</label>
                <Input
                  placeholder='Optional remarks'
                  value={remarks}
                  onChange={(e) => handleRemarksChange(e.target.value)}
                />
              </Col>
            </Row>

            <Row className='mt-8'>
              <Col span={24}>
                <Button type='primary' size='large' loading={submitting} onClick={handleCollectPayment}>
                  Collect Payment
                </Button>
              </Col>
            </Row>
          </>
        )}

        {memberInfo && Number(memberInfo.due_balance) <= 0 && (
          <div className='mt-6'>
            <Tag color='green' style={{fontSize: 14, padding: '6px 12px'}}>
              This member has no outstanding due balance.
            </Tag>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(PaymentCollectView)
