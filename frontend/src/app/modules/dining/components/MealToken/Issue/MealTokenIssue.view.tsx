import React, {FC} from 'react'
import {Card, Input, Select, Radio, Button, Row, Col, Spin, Tag, Statistic} from 'antd'

const MealTokenIssueView: FC<any> = (props) => {
  const {Option} = Select
  const {
    cardNumber,
    memberInfo,
    memberLoading,
    mealType,
    costInfo,
    costLoading,
    paymentStatus,
    submitting,
    issuedToken,
    cardInputRef,
    handleCardNumberChange,
    handleCardScan,
    handleMealTypeChange,
    handlePaymentStatusChange,
    handleIssueToken,
    handleIssueAnother,
  } = props

  if (issuedToken) {
    return (
      <div className='card'>
        <div className='p-10 text-center'>
          <h3 className='mb-6'>Token Issued</h3>
          <div
            className='d-inline-block p-10 mb-6'
            style={{border: '2px dashed #999', borderRadius: 8, minWidth: 320}}
          >
            <h1 style={{fontSize: 48, marginBottom: 8}}>{issuedToken.token_number}</h1>
            <div className='fs-4 mb-2'>{issuedToken.member_name}</div>
            <div className='fs-6 text-muted mb-2'>{issuedToken.member_code}</div>
            <Tag color='blue' style={{fontSize: 14, padding: '4px 10px'}}>
              {issuedToken.meal_type}
            </Tag>
            <div className='fs-3 fw-bold mt-3'>{issuedToken.amount}</div>
            <Tag color={issuedToken.payment_status === 'PAID' ? 'green' : 'red'} style={{marginTop: 8}}>
              {issuedToken.payment_status === 'PAID' ? 'PAID' : 'DUE'}
            </Tag>
          </div>
          <div>
            <Button type='primary' size='large' onClick={handleIssueAnother}>
              Issue Next Token
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='card'>
      <div className='p-6'>
        <h3 className='mb-6'>Issue Meal Token</h3>

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

        {memberInfo && (
          <Row gutter={[16, 16]} className='mt-6'>
            <Col md={6} xs={12}>
              <label className='fw-bold mb-2 d-block'>Meal Type</label>
              <Select style={{width: '100%'}} value={mealType} onChange={handleMealTypeChange}>
                <Option value='BREAKFAST'>Breakfast</Option>
                <Option value='LUNCH'>Lunch</Option>
                <Option value='DINNER'>Dinner</Option>
              </Select>
            </Col>

            <Col md={6} xs={12}>
              <label className='fw-bold mb-2 d-block'>Cost</label>
              {costLoading ? (
                <Spin size='small' />
              ) : (
                <div className='fs-3 fw-bold'>{costInfo ? costInfo.cost : 'N/A'}</div>
              )}
            </Col>

            <Col md={12} xs={24}>
              <label className='fw-bold mb-2 d-block'>Payment</label>
              <Radio.Group value={paymentStatus} onChange={(e) => handlePaymentStatusChange(e.target.value)}>
                <Radio.Button value='PAID'>Pay Now (Cash)</Radio.Button>
                <Radio.Button value='DUE'>Add to Due</Radio.Button>
              </Radio.Group>
            </Col>
          </Row>
        )}

        {memberInfo && (
          <Row className='mt-8'>
            <Col span={24}>
              <Button
                type='primary'
                size='large'
                loading={submitting}
                disabled={!costInfo}
                onClick={handleIssueToken}
              >
                Issue Token
              </Button>
            </Col>
          </Row>
        )}
      </div>
    </div>
  )
}

export default React.memo(MealTokenIssueView)
