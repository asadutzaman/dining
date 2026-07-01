import {Button, Modal, Spin} from 'antd'
import React, {FC, Fragment} from 'react'
import useResponsive from '../../hooks/useResponsive'

interface IProps {
  formRef: any
  modalTitle: any
  loading: any
  modalFormObject: any // { modalFormType: enum, whichModal: modalName}
  isShowModalForm: any
  handleCallbackFunc: any
  [key: string]: any
}

const ModalUpdateForm: FC<IProps> = (props) => {
  const {isMobile} = useResponsive()
  const {
    formRef,
    modalTitle,
    loading,
    modalFormObject,
    isShowModalForm,
    children,
    component: Component,
    handleCallbackFunc,
    modalWidth,
    ...restProps
  } = props
  const onSubmit = () => {
    formRef.submit()
  }
  return (
    <Fragment>
      <Modal
        // width={720}
        width={isMobile ? '100%' : modalWidth ? modalWidth : '60%'}
        className='form-page-modal form-page-modal'
        title={
          <b>
            {modalTitle}&nbsp;&nbsp;{loading && <Spin size='small' />}
          </b>
        }
        maskClosable={false}
        centered
        open={isShowModalForm}
        onCancel={(event) => handleCallbackFunc(null, 'hideModalUpdateForm', '', {modalFormType: modalFormObject})}
        footer={[
          <Button
            key='cancel'
            onClick={(event) =>
              handleCallbackFunc(null, 'hideModalUpdateForm', '', {modalFormType: modalFormObject})
            }
          >
            {'Cancel'}
          </Button>,
          <Button key='submit' type='primary' loading={loading} onClick={onSubmit}>
            {'Submit'}
          </Button>,
        ]}
      >
        <Component
          loading={loading}
          formRef={formRef}
          handleCallbackFunc={handleCallbackFunc}
          {...restProps}
        />
      </Modal>
    </Fragment>
  )
}
export default React.memo(ModalUpdateForm)
