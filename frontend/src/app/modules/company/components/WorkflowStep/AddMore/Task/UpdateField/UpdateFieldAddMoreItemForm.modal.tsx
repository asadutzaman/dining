import React, {FC, Fragment} from 'react'
import {Modal, Spin, Button} from 'antd'
import {useTranslation} from 'react-i18next'
import AddOrEditForm from './UpdateFieldAddMoreItemForm.form'
import CustomScrollbar from 'src/app/components/Scrollbar/CustomScrollbar'

interface IProps {
  formRef: any
  modalTitle: any
  loading: any
  isShowForm: any
  handleCallbackFunc: any
  [key: string]: any
}

const UpdateFieldAddMoreItemFormModal: FC<IProps> = (props) => {
  const {t} = useTranslation()
  const {formRef, modalTitle, loading, isShowForm, handleCallbackFunc, ...restProps} = props
  const onSubmit = () => {
    formRef.submit()
  }
  return (
    <Fragment>
      <Modal
        width={1024}
        className='form-page-modal form-page-modal-papers-to-be-attached'
        title={
          <b>
            {t(modalTitle)}&nbsp;&nbsp;{loading && <Spin size='small' />}
          </b>
        }
        maskClosable={false}
        centered
        visible={isShowForm}
        onCancel={(event) => handleCallbackFunc(null, 'hideForm')}
        footer={[
          <Button key='cancel' onClick={(event) => handleCallbackFunc(null, 'hideForm')}>
            {t('Cancel')}
          </Button>,
          <Button key='submit' type='primary' loading={loading} onClick={onSubmit}>
            {t('Save')}
          </Button>,
        ]}
      >
        <CustomScrollbar autoHeight autoHeightMax={500} className='form-page-modal-scrollbar'>
          <AddOrEditForm formRef={formRef} {...restProps} />
        </CustomScrollbar>
      </Modal>
    </Fragment>
  )
}
export default React.memo(UpdateFieldAddMoreItemFormModal)
