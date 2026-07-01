import React, {useEffect} from 'react'
import {Empty, Select, Spin} from 'antd'
import {SelectProps} from 'antd/lib/select'
import {useApproverGroupList} from '../../hooks/lists/useApproverGroupList'

interface Props extends SelectProps {
  approverGroupId: any
  placeholder?: string
  selectType?: string
  allowClear?: boolean

  onLoad?: (value: any) => void
  onChange?: (value: any, option: any) => void
  onSelect?: (value: any, option: any) => void
}

const ApproverGroupSelect: React.FC<Props> = (props) => {
  const {Option} = Select
  const {approverGroupId} = props

  const {approverGroupList, loadingApproverGroupList} = useApproverGroupList()

  useEffect(() => {
    if (approverGroupId && approverGroupList.length) {
      if (props.onLoad) {
        props.onLoad(approverGroupId)
      }
    }
  }, [approverGroupId, approverGroupList, props])

  const handleOnChanged = (value: any, option: any) => {
    if (props.onChange) {
      props.onChange(value, option)
    }
  }

  const handleOnSelect = (value: any, option: any) => {
    if (props.onSelect) {
      props.onSelect(value, option)
    }
  }

  return (
    <Select
      {...props}
      allowClear={props.allowClear || false}
      showSearch
      placeholder={props.placeholder || '-- Select --'}
      value={approverGroupId}
      notFoundContent={loadingApproverGroupList ? <Spin size='small' /> : <Empty />}
      onChange={(value, option) => handleOnChanged(value, option)}
      onSelect={(value, option) => handleOnSelect(value, option)}
      loading={loadingApproverGroupList}
      optionFilterProp='children'
      filterOption={(input, option: any) =>
        option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0
      }
    >
      {approverGroupList &&
        approverGroupList.map((item: any, index: any) => {
          return (
            <Option key={`approverGroup-${index}`} value={item.id}>
              {item.name}
            </Option>
          )
        })}
    </Select>
  )
}

export default ApproverGroupSelect
