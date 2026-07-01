import React, {useEffect} from 'react'
import {Empty, Select, Spin} from 'antd'
import {SelectProps} from 'antd/lib/select'
import {useGroupWiseMemberList} from 'src/app/hooks/lists/useGroupWiseMemberList'

interface Props extends SelectProps {
  approverGroupMemberId: any
  approverGroupId: any
  placeholder?: string

  onLoad?: (value: any) => void
  onChange?: (value: any, option: any) => void
  onSelect?: (value: any, option: any) => void
}

const ApproverGroupMemberSelect: React.FC<Props> = (props) => {
  const {Option} = Select
  const {approverGroupMemberId, approverGroupId} = props

  const {
    approverGroupMemberList,
    loadingApproverGroupMemberList,
    loadApproverGroupMemberListByGroupId,
    disabledApproverGroupMemberList,
    setDisabledApproverGroupMemberList,
  } = useGroupWiseMemberList()

  useEffect(() => {
    if (approverGroupId) {
      setDisabledApproverGroupMemberList(true)
      loadApproverGroupMemberListByGroupId(approverGroupId)
    }
  }, [approverGroupMemberId, approverGroupId])

  useEffect(() => {
    if (approverGroupMemberId && approverGroupMemberList.length) {
      if (props.onLoad) {
        props.onLoad(approverGroupMemberId)
      }
      setDisabledApproverGroupMemberList(false)
    }
  }, [approverGroupMemberId, approverGroupMemberList.length, props])

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
      allowClear={true}
      showSearch
      placeholder={props.placeholder || '-- Select --'}
      value={approverGroupMemberId}
      notFoundContent={loadingApproverGroupMemberList ? <Spin size='small' /> : <Empty />}
      onChange={(value, option) => handleOnChanged(value, option)}
      onSelect={(value, option) => handleOnSelect(value, option)}
      loading={loadingApproverGroupMemberList}
      disabled={disabledApproverGroupMemberList}
      optionFilterProp='children'
      filterOption={(input, option: any) =>
        option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0
      }
    >
      {approverGroupMemberList &&
        approverGroupMemberList.map((item: any, index: any) => {
          return (
            <Option key={`approverGroupMember-${index}`} value={item.id}>
              {item.user_info?.name} [{item.user_info?.designation?.title}]
            </Option>
          )
        })}
    </Select>
  )
}

export default ApproverGroupMemberSelect
