import React, {FC} from 'react'
import {Input, Select, Row, Col, Spin, Tag, Button, Modal, List, Empty, Alert} from 'antd'
import {CONSTANT_CONFIG} from 'src/app/constants'

const initialsOf = (name?: string) =>
  (name || '?')
    .split(' ')
    .map((p: string) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()

const Avatar: FC<{src?: string; name?: string; size?: number}> = ({src, name, size = 110}) => {
  const [broken, setBroken] = React.useState(false)

  // The NCMS image host is a different box from its API and is not always reachable from the
  // browser, so a broken photo must degrade to initials rather than a broken-image icon.
  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setBroken(true)}
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius: 12,
          border: '2px solid #fff',
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: '#d9d9d9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 700,
        color: '#555',
      }}
    >
      {initialsOf(name)}
    </div>
  )
}

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
    enrollCandidate,
    unknownCard,
    enrolling,
    assignOpen,
    assignSearch,
    assignResults,
    assignLoading,
    handleEnrollConfirm,
    handleEnrollCancel,
    handleAssignOpen,
    handleAssignClose,
    handleAssignSearch,
    handleAssignSelect,
    printStalled,
    mealLoaded,
    agentReady,
  } = props

  const MEAL_LABEL: any = {BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner'}
  const windowsConfigured = !!mealInfo?.windows_configured
  // Until the meal is known a scan would be issued against the 'BREAKFAST' default, so the
  // field stays closed rather than silently recording the wrong meal.
  const scanDisabled = !mealLoaded || !activeMeal

  const photoUrl = memberInfo?.photo_id ? `${CONSTANT_CONFIG.MEDIA_SOURCE}${memberInfo.photo_id}` : ''

  return (
    <div className='card'>
      <div className='p-6'>
        <h3 className='mb-6'>Issue Meal Token</h3>

        {/* The browser fallback is slower and reloads the page after every scan, so it is worth
            the operator knowing the print agent is not running before a rush starts. */}
        {agentReady === false && (
          <Alert
            className='mb-4'
            type='info'
            showIcon
            message='Print agent not running — using browser printing'
            description='Receipts still print, but more slowly, and the page reloads after each scan. Start the print agent on this PC to speed it up.'
          />
        )}

        {/* Tokens are still recorded when printing fails, so a silent failure would otherwise
            go unnoticed until someone turns up without a token. */}
        {printStalled && (
          <Alert
            className='mb-4'
            type='warning'
            showIcon
            message='Printing has stalled'
            description='Tokens are still being issued and recorded, but the printer has stopped responding. Check the printer, then reload this page before continuing.'
          />
        )}

        {/* Current meal: auto-detected by time window, or a manual picker if no windows are set.
            While it is still loading neither is shown -- the manual picker would otherwise flash
            up defaulted to Breakfast and invite a scan against the wrong meal. */}
        {!mealLoaded ? (
          <div className='mb-4'>
            <Tag color='default' style={{fontSize: 16, padding: '6px 14px'}}>
              <Spin size='small' className='me-2' /> Checking which meal is being served…
            </Tag>
          </div>
        ) : windowsConfigured ? (
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
                !mealLoaded
                  ? 'Please wait — checking which meal is being served…'
                  : scanDisabled
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

        {/* Card is on the NCMS roster but its owner isn't a dining member yet. This is how the
            ~170-200 real dining members get registered: they show up to eat. */}
        {enrollCandidate && (
          <div
            className='mt-8 p-6'
            style={{background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8}}
          >
            <Row gutter={[24, 16]} align='middle'>
              <Col flex='500px'>
                <Avatar src={enrollCandidate.image_url} name={enrollCandidate.name} size={480} />
              </Col>
              <Col flex='auto'>
                <div className='fs-2 fw-bold'>{enrollCandidate.name}</div>
                <div className='fs-5 text-muted'>
                  {enrollCandidate.member_type === 'STAFF'
                    ? `Staff ID: ${enrollCandidate.staff_id ?? '-'}`
                    : `Roll: ${enrollCandidate.roll_no ?? '-'}`}
                </div>
                <div className='fs-6 text-muted mt-2'>Not a dining member yet.</div>
              </Col>
              <Col flex='300px'>
                <Button
                  type='primary'
                  size='large'
                  block
                  loading={enrolling}
                  onClick={handleEnrollConfirm}
                >
                  Enroll &amp; issue token
                </Button>
                <Button size='large' block className='mt-2' onClick={handleEnrollCancel}>
                  Not a dining member
                </Button>
              </Col>
            </Row>
          </div>
        )}

        {/* Nothing matched. Usually a dining member whose NCMS record carries no RFID -- the
            operator finds them on the roster and we bind this physical card to them. */}
        {unknownCard && (
          <div className='mt-8'>
            <Alert
              type='error'
              showIcon
              message={`Unrecognized card: ${unknownCard}`}
              description='This card is not registered to anyone. If it belongs to a dining member, assign it to them now.'
              action={
                <div>
                  <Button type='primary' onClick={handleAssignOpen}>
                    Assign this card
                  </Button>
                  <Button className='mt-2' block onClick={handleEnrollCancel}>
                    Dismiss
                  </Button>
                </div>
              }
            />
          </div>
        )}

        {/* Survives the post-print reload, restored from sessionStorage, and deliberately looks
            identical to a live scan: the operator hands the token over after printing and still
            needs the face at full size to check who they are handing it to. */}
        {memberInfo && (
          <div className='mt-8 p-6' style={{background: '#f5f5f5', borderRadius: 8}}>
            <Row gutter={[24, 16]} align='middle'>
              <Col flex='500px'>
                <Avatar src={photoUrl} name={memberInfo.name} size={480} />
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

        {!memberInfo && !enrollCandidate && !unknownCard && (
          <div className='mt-10 text-center text-muted'>
            <div className='fs-4'>Set the current meal, then scan a card to issue a token.</div>
          </div>
        )}

        <Modal
          title='Assign this card to a person'
          open={assignOpen}
          onCancel={handleAssignClose}
          footer={null}
          destroyOnClose
        >
          <div className='mb-4 text-muted'>
            Card <strong>{unknownCard}</strong> will be bound to whoever you pick, and they will be
            enrolled as a dining member.
          </div>

          <Input.Search
            autoFocus
            allowClear
            size='large'
            placeholder='Search the NCMS roster by name, staff ID or roll'
            value={assignSearch}
            loading={assignLoading}
            onChange={(e) => handleAssignSearch(e.target.value)}
          />

          <div className='mt-4' style={{maxHeight: 340, overflowY: 'auto'}}>
            {assignSearch.trim().length < 2 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description='Type at least 2 characters to search'
              />
            ) : (
              <List
                loading={assignLoading}
                dataSource={assignResults}
                locale={{emptyText: 'Nobody on the roster matches that.'}}
                renderItem={(candidate: any) => (
                  <List.Item
                    actions={[
                      <Button
                        type='primary'
                        loading={enrolling}
                        onClick={() => handleAssignSelect(candidate)}
                      >
                        Assign
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar src={candidate.image_url} name={candidate.name} size={44} />
                      }
                      title={candidate.name}
                      description={
                        <span>
                          <Tag>{candidate.member_type}</Tag>
                          {candidate.member_type === 'STAFF'
                            ? `Staff ID: ${candidate.staff_id ?? '-'}`
                            : `Roll: ${candidate.roll_no ?? '-'}`}
                          {candidate.has_card && (
                            <Tag color='orange' className='ms-2'>
                              Already has card {candidate.rfid}
                            </Tag>
                          )}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default React.memo(MealTokenIssueView)
