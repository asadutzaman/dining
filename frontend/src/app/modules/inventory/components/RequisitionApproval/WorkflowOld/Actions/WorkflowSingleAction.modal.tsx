import React, {FC, Fragment} from 'react'
import {Modal, Spin, Button} from 'antd'
import CustomScrollbar from 'src/app/components/Scrollbar/CustomScrollbar'
import useResponsive from 'src/app/hooks/useResponsive'

interface IProps {
  formRef: any
  drawerWidth?: any
  modalTitle: any
  submitBtnText: any
  loading: any
  isShowFormModal: any
  component?: any
  handleCallbackFunc: any
  [key: string]: any
}

const WorkflowSingleActionModal: FC<IProps> = (props) => {
  const {isMobile} = useResponsive()
  const {
    loading,
    formRef,
    drawerWidth,
    modalTitle,
    submitBtnText,
    isShowFormModal,
    component: Component,
    handleCallbackFunc,
    ...restProps
  } = props
  const onSubmit = () => {
    formRef.submit()
  }
  return (
    <Fragment>
      <Modal
        width={isMobile ? '100%' : drawerWidth ? drawerWidth : '60%'}
        className='form-page-modal form-page-modal'
        title={
          <b>
            {modalTitle}&nbsp;&nbsp;{loading && <Spin size='small' />}
          </b>
        }
        maskClosable={false}
        centered
        visible={isShowFormModal}
        onCancel={(event) => handleCallbackFunc(null, 'hideForm')}
        footer={[
          <Button key='cancel' onClick={(event) => handleCallbackFunc(null, 'hideForm')}>
            {'Cancel'}
          </Button>,
          <Button key='submit' type='primary' loading={loading} onClick={onSubmit}>
            {submitBtnText || 'Submit'}
          </Button>,
        ]}
      >
        <CustomScrollbar autoHeight autoHeightMax={480} className='form-page-modal-scrollbar'>
          <Component
            loading={loading}
            formRef={formRef}
            handleCallbackFunc={handleCallbackFunc}
            {...restProps}
          />
        </CustomScrollbar>
      </Modal>
    </Fragment>
  )
}
export default React.memo(WorkflowSingleActionModal)
