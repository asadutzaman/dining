import React, {useEffect} from 'react'
import {Empty, Select, Spin} from 'antd'
import {SelectProps} from 'antd/lib/select'
import {useSupplierList} from 'src/app/hooks/lists/useSupplierList'

interface Props extends SelectProps {
  supplierId: any
  placeholder?: string
  selectType?: string

  onLoad?: (value: any) => void
  onChange?: (value: any, option: any) => void
  onSelect?: (value: any, option: any) => void
}

const SupplierSelect: React.FC<Props> = (props) => {
  const {Option} = Select
  const {supplierId} = props

  const {supplierList, loadingSupplierList} = useSupplierList()

  useEffect(() => {
    if (supplierId && supplierList.length) {
      if (props.onLoad) {
        props.onLoad(supplierId)
      }
    }
  }, [supplierId, supplierList, props])

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
      value={supplierId}
      notFoundContent={loadingSupplierList ? <Spin size='small' /> : <Empty />}
      onChange={(value, option) => handleOnChanged(value, option)}
      onSelect={(value, option) => handleOnSelect(value, option)}
      loading={loadingSupplierList}
      optionFilterProp='children'
      filterOption={(input, option: any) =>
        option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0
      }
    >
      {supplierList &&
        supplierList.map((item: any, index: any) => {
          return (
            <Option key={`supplier-${index}`} value={item.id}>
              {item.supplier_name}
            </Option>
          )
        })}
    </Select>
  )
}

export default SupplierSelect
