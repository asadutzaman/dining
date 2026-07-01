import React, {FC, useState} from 'react'
import {Button, Modal, Form} from 'antd'
import {useForm} from '../../hooks/useForm'
import {ResetIcon} from 'src/_metronic/assets/images/icon/svg'
import useResponsive from 'src/app/hooks/useResponsive'

interface IProps {
  filters: any
  setFilters: any
  component?: any
  initialFilterValue?: any
  handleOnChanged?: any
  handleCallbackFunc?: any
  [key: string]: any
}

const AdvancedSearchModal: FC<IProps> = (props) => {
  const {isMobile} = useResponsive()

  const {
    filters,
    setFilters,
    initialFilterValue,
    component: Component,
    modalWidth,
    ...restProps
  } = props

  const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false)
  const [isAdvLoading, setIsAdvLoading] = useState(false)

  const {formRef, formValues, handleChange, setFormFieldsValue} = useForm({})

  const showAdvancedSearch = () => {
    setIsAdvSearchOpen(true)
  }

  const handleAdvSearchCancel = () => {
    setIsAdvSearchOpen(false)
  }

  const handleOk = () => {
    setFilters(formValues)
    setIsAdvSearchOpen(false)
  }

  const resetForm = () => {
    formRef.resetFields()
    setFilters({})
    setFormFieldsValue(initialFilterValue)
  }

  return (
    <>
      <Button type='primary' onClick={showAdvancedSearch}>
        {'Advanced Search'}
      </Button>
      <Modal
        width={isMobile ? '100%' : modalWidth ? modalWidth : '60%'}
        className='form-page-modal form-page-modal'
        open={isAdvSearchOpen}
        title={'Advanced Search'}
        centered
        onOk={handleOk}
        onCancel={handleAdvSearchCancel}
        footer={[
          <Button key='cancel' onClick={handleAdvSearchCancel}>
            {'Cancel'}{' '}
          </Button>,
          <Button type='default' icon={<ResetIcon />} onClick={resetForm}>
            {'Reset'}
          </Button>,
          <Button key='submit' type='primary' loading={isAdvLoading} onClick={handleOk}>
            {'Filter'}
          </Button>,
        ]}
      >
        <Form
          form={formRef}
          onValuesChange={handleChange}
          initialValues={initialFilterValue}
          layout='vertical'
        >
          <Component
            formRef={formRef}
            filters={filters}
            setFilters={setFilters}
            initialFilterValue={initialFilterValue}
            {...restProps}
          />
        </Form>
      </Modal>
    </>
  )
}

export default React.memo(AdvancedSearchModal)
