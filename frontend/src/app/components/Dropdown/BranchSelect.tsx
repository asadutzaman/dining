import React, {useEffect} from 'react'
import {Empty, Select, Spin} from 'antd'
import {SelectProps} from 'antd/lib/select'
import {useBranchList} from '../../hooks/lists/useBranchList'

interface Props extends SelectProps {
  branchId?: any
  placeholder?: string
  branchType?: string
  isMultiple?: boolean

  onLoad?: (value: any) => void
  onChange?: (value: any, option: any) => void
  onSelect?: (value: any, option: any) => void
}

const BranchSelect: React.FC<Props> = (props) => {
  const {Option} = Select
  const {branchId, branchType = 'All', isMultiple = false} = props

  const {loadingBranchList, branchList, warehouseList, thanaList} = useBranchList()

  useEffect(() => {
    if (branchId && branchList.length) {
      if (props.onLoad) {
        props.onLoad(branchId)
      }
    }
  }, [branchId, branchList.length, props])

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

  // FOR MULTIPLE
  if (isMultiple) {
    return (
      <Select
        {...props}
        allowClear={true}
        showSearch
        placeholder={props.placeholder || '-- Select --'}
        notFoundContent={loadingBranchList ? <Spin size='small' /> : <Empty />}
        onChange={(value, option) => handleOnChanged(value, option)}
        onSelect={(value, option) => handleOnSelect(value, option)}
        loading={loadingBranchList}
        optionFilterProp='children'
        filterOption={(input, option: any) =>
          option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0
        }
        mode='multiple'
      >
        {branchType === 'Warehouse' &&
          warehouseList &&
          warehouseList.map((item: any, index: any) => {
            return (
              <Option key={`warehouse-${index}`} value={item.id}>
                {item.name}
              </Option>
            )
          })}

        {branchType === 'Branch' &&
          thanaList &&
          thanaList.map((item: any, index: any) => {
            return (
              <Option key={`thana-${index}`} value={item.id}>
                {item.name}
              </Option>
            )
          })}

        {branchType === 'All' &&
          branchList &&
          branchList.map((item: any, index: any) => {
            return (
              <Option key={`thana-${index}`} value={item.id}>
                {`${item.name} (${item.type})`}
              </Option>
            )
          })}
      </Select>
    )
  } else {
    return (
      <Select
        {...props}
        allowClear={true}
        showSearch
        placeholder={props.placeholder || '-- Select --'}
        value={branchId}
        notFoundContent={loadingBranchList ? <Spin size='small' /> : <Empty />}
        onChange={(value, option) => handleOnChanged(value, option)}
        onSelect={(value, option) => handleOnSelect(value, option)}
        loading={loadingBranchList}
        optionFilterProp='children'
        filterOption={(input, option: any) =>
          option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0
        }
      >
        {branchType === 'Warehouse' &&
          warehouseList &&
          warehouseList.map((item: any, index: any) => {
            return (
              <Option key={`warehouse-${index}`} value={item.id}>
                {item.name}
              </Option>
            )
          })}

        {branchType === 'Branch' &&
          thanaList &&
          thanaList.map((item: any, index: any) => {
            return (
              <Option key={`thana-${index}`} value={item.id}>
                {item.name}
              </Option>
            )
          })}

        {branchType === 'All' &&
          branchList &&
          branchList.map((item: any, index: any) => {
            return (
              <Option key={`thana-${index}`} value={item.id}>
                {`${item.name} (${item.type})`}
              </Option>
            )
          })}
      </Select>
    )
  }
}

export default BranchSelect
