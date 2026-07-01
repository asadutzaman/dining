import React, {useEffect, useState} from 'react'
import {Col, Row, Spin} from 'antd'
import {useLogisticList} from 'src/app/hooks/lists/useLogisticList'

interface Props {
  logisticId?: any

  onLoad?: (value: any) => void
  onClick?: (value: any, option: any) => void
}

const LogisticGridSelect: React.FC<Props> = (props) => {
  const style: React.CSSProperties = {background: '#0092ff'}
  const {logisticId} = props
  const [selectedLogisticId, setSelectedLogisticId] = useState(logisticId)

  const {logisticList, loadingLogisticList} = useLogisticList()

  useEffect(() => {
    if (logisticId && logisticList.length) {
      if (props.onLoad) {
        props.onLoad(logisticId)
      }
    }
  }, [logisticId, logisticList, props])

  const handleOnClick = (value: any, option: any) => {
    setSelectedLogisticId(value)
    if (props.onClick) {
      props.onClick(value, option)
    }
  }

  return (
    <Row gutter={[16, 16]}>
      {loadingLogisticList ? (
        <Spin size='small' />
      ) : (
        <>
          <Col
            key={'all'}
            className='gutter-row'
            span={6}
            onClick={() => handleOnClick('ALL', 'ALL')}
          >
            <div
              className='p-3'
              style={{
                ...style,
                background: selectedLogisticId === 'ALL' ? '#005bb5' : style.background,
                border:
                  selectedLogisticId === 'ALL' ? '2px solid #005bb5' : '1px solid transparent',
                color: '#ffffff',
              }}
            >
              {'All'}
            </div>
          </Col>

          {logisticList &&
          logisticList.map((item: any, index: any) => {
            return (
              <Col
                key={item.id}
                className='gutter-row'
                span={6}
                onClick={() => handleOnClick(item.id, item)}
              >
                <div
                  className='p-3'
                  style={{
                    ...style,
                    background: item.id === selectedLogisticId ? '#005bb5' : style.background,
                    border:
                      item.id === selectedLogisticId ? '2px solid #005bb5' : '1px solid transparent',
                    color: '#ffffff',
                  }}
                >
                  {item.name}
                </div>
              </Col>
            )
          })}
        </>
      )}
    </Row>
  )
}

export default LogisticGridSelect
