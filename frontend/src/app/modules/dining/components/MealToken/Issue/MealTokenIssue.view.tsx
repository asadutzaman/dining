import React, {FC} from 'react'
import {Input, Select, Row, Col, Spin, Tag, Button} from 'antd'
import {CONSTANT_CONFIG} from 'src/app/constants'

const MealTokenIssueView: FC<any> = (props) => {
  const {Option} = Select
  const {
    cardNumber,
    memberInfo,
    memberLoading,
    mealType,
    mealInfo,
    activeMeal,
    lastToken,
    cardInputRef,
    handleCardNumberChange,
    handleCardScan,
    handleMealTypeChange,
    handleReset,
  } = props

  const MEAL_LABEL: any = {BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner'}
  const windowsConfigured = !!mealInfo?.windows_configured
  const scanDisabled = !activeMeal

  const photoUrl = memberInfo?.photo_id ? `${CONSTANT_CONFIG.MEDIA_SOURCE}${memberInfo.photo_id}` : ''
  const initials = (memberInfo?.name || '?')
    .split(' ')
    .map((p: string) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className='card'>
      <div className='p-6'>
        <h3 className='mb-6'>Issue Meal Token</h3>

        {/* Current meal: auto-detected by time window, or a manual picker if no windows are set */}
        {windowsConfigured ? (
          <div className='mb-4'>
            {activeMeal ? (
              <Tag color='green' style={{fontSize: 16, padding: '6px 14px'}}>
                Now serving: {MEAL_LABEL[activeMeal] || activeMeal}
              </Tag>
            ) : (
              <Tag color='red' style={{fontSize: 16, padding: '6px 14px'}}>
                No meal is being served right now
              </Tag>
            )}
          </div>
        ) : (
          <Row gutter={[16, 16]} className='mb-2'>
            <Col md={8} xs={24}>
              <label className='fw-bold mb-2 d-block'>Current Meal</label>
              <Select style={{width: '100%'}} size='large' value={mealType} onChange={handleMealTypeChange}>
                <Option value='BREAKFAST'>Breakfast</Option>
                <Option value='LUNCH'>Lunch</Option>
                <Option value='DINNER'>Dinner</Option>
              </Select>
            </Col>
          </Row>
        )}

        <Row gutter={[16, 16]} align='bottom'>
          <Col md={18} xs={24}>
            <label className='fw-bold mb-2 d-block'>Scan / Enter RFID Card</label>
            <Input
              ref={cardInputRef}
              autoFocus
              size='large'
              disabled={scanDisabled}
              placeholder={
                scanDisabled
                  ? 'Scanning disabled — no meal is being served now'
                  : 'Scan card — token issues & prints automatically'
              }
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              onPressEnter={handleCardScan}
              suffix={memberLoading ? <Spin size='small' /> : null}
            />
          </Col>
          <Col md={6} xs={24}>
            <Button size='large' onClick={handleReset} block>
              Clear
            </Button>
          </Col>
        </Row>

        {memberInfo && (
          <div className='mt-8 p-6' style={{background: '#f5f5f5', borderRadius: 8}}>
            <Row gutter={[24, 16]} align='middle'>
              <Col flex='120px'>
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={memberInfo.name}
                    style={{
                      width: 110,
                      height: 110,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '2px solid #fff',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 110,
                      height: 110,
                      borderRadius: 8,
                      background: '#d9d9d9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 40,
                      fontWeight: 700,
                      color: '#555',
                    }}
                  >
                    {initials}
                  </div>
                )}
              </Col>
              <Col flex='auto'>
                <div className='fs-2 fw-bold'>{memberInfo.name}</div>
                <div className='fs-5 text-muted'>{memberInfo.member_code}</div>
                <Tag color='blue' className='mt-2'>
                  {memberInfo.member_type}
                </Tag>
              </Col>

              {lastToken && lastToken.member_id === memberInfo.id && (
                <Col flex='260px'>
                  <div
                    className='text-center p-4'
                    style={{border: '2px dashed #999', borderRadius: 8, background: '#fff'}}
                  >
                    <div className='text-muted fs-7'>Last Token Issued</div>
                    <div style={{fontSize: 32, fontWeight: 700, lineHeight: 1.1}}>
                      {lastToken.token_number}
                    </div>
                    <Tag color='geekblue'>{lastToken.meal_type}</Tag>
                    <div className='fs-4 fw-bold mt-2'>{lastToken.amount}</div>
                    <Tag color='red'>DUE</Tag>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}

        {!memberInfo && (
          <div className='mt-10 text-center text-muted'>
            <div className='fs-4'>Set the current meal, then scan a card to issue a token.</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(MealTokenIssueView)
