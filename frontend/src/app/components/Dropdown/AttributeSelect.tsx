import React, {useEffect} from 'react'
import {Empty, Select, Spin} from 'antd'
import {SelectProps} from 'antd/lib/select'
import {useAttributeList} from 'src/app/hooks/lists/useAttributeList'

interface Props extends SelectProps {
  attributeId: any
  placeholder?: string
  selectType?: string

  onLoad?: (value: any) => void
  onChange?: (value: any, option: any) => void
  onSelect?: (value: any, option: any) => void
}

const AttributeSelect: React.FC<Props> = (props) => {
  const {Option} = Select
  const {attributeId} = props

  const {attributeList, loadingAttributeList} = useAttributeList()

  useEffect(() => {
    if (attributeId && attributeList.length) {
      if (props.onLoad) {
        props.onLoad(attributeId)
      }
    }
  }, [attributeId, attributeList, props])

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
      value={attributeId}
      notFoundContent={loadingAttributeList ? <Spin size='small' /> : <Empty />}
      onChange={(value, option) => handleOnChanged(value, option)}
      onSelect={(value, option) => handleOnSelect(value, option)}
      loading={loadingAttributeList}
      optionFilterProp='children'
      filterOption={(input, option: any) =>
        option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0
      }
    >
      {attributeList &&
        attributeList.map((item: any, index: any) => {
          return (
            <Option key={`attribute-${index}`} value={item.id}>
              {item.name}
            </Option>
          )
        })}
    </Select>
  )
}

export default AttributeSelect
