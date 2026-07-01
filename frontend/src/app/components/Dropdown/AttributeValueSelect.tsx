import React, {useEffect} from 'react'
import {Empty, Select, Spin} from 'antd'
import {SelectProps} from 'antd/lib/select'
import {useAttributeValueList} from 'src/app/hooks/lists/useAttributeValueList'

interface Props extends SelectProps {
  attributeValueId: any
  attributeId: any
  placeholder?: string

  onLoad?: (value: any) => void
  onChange?: (value: any, option: any) => void
  onSelect?: (value: any, option: any) => void
}

const AttributeValueSelect: React.FC<Props> = (props) => {
  const {Option} = Select
  const {attributeValueId, attributeId} = props

  const {
    loadingAttributeValueList,
    disabledAttributeValueList,
    setDisabledAttributeValueList,
    loadAttributeValueListByAttributeId,
    filteredAttributeValueList,
  } = useAttributeValueList()

  useEffect(() => {
    if (attributeId) {
      setDisabledAttributeValueList(false)
      loadAttributeValueListByAttributeId(attributeId)
    }
  }, [attributeValueId, attributeId])

  useEffect(() => {
    if (attributeValueId && filteredAttributeValueList.length) {
      if (props.onLoad) {
        props.onLoad(attributeValueId)
      }
    }
  }, [attributeValueId, filteredAttributeValueList.length, props])

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
      value={attributeValueId}
      notFoundContent={loadingAttributeValueList ? <Spin size='small' /> : <Empty />}
      onChange={(value, option) => handleOnChanged(value, option)}
      onSelect={(value, option) => handleOnSelect(value, option)}
      loading={loadingAttributeValueList}
      disabled={disabledAttributeValueList}
      optionFilterProp='children'
      filterOption={(input, option: any) =>
        option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0
      }
    >
      {filteredAttributeValueList &&
        filteredAttributeValueList.map((item: any, index: any) => {
          return (
            <Option key={`attributeValue-${index}`} value={item.id}>
              {item.value}
            </Option>
          )
        })}
    </Select>
  )
}

export default AttributeValueSelect
