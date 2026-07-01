import {useLang} from 'src/app/hooks/useLang'
import {EyeOutlined} from '@ant-design/icons'
import {Button, Modal} from 'antd'
import {FC, Fragment, useState} from 'react'

interface IProps {
  component: any
  btnText?: any
  modalBtnText?: any
  modalTitle?: any
  [key: string]: any
}

/**
 * <OpenModal
 *      btnText={"Print Preview"}
 *      modalBtnText={"Print"}
 *      modalTitle={"Print Preview"}
 *      component={<PreviewContent componentProps={componentProps} />}
 * />
 */
const OpenModal: FC<IProps> = (props) => {
  const {t} = useLang()

  const [visible, setVisible] = useState(false)

  const handleVisibleChange = () => {
    setVisible(!visible)
  }

  const showModal = () => {
    setVisible(true)
  }

  return (
    <Fragment>
      <Modal
        width={1020}
        className='view-modal-content'
        title={<strong>{props.modalTitle || t('Modal Content')}</strong>}
        // centered // Bad for smaller viewports. Don't use it.
        maskClosable={true}
        open={visible}
        onCancel={(event) => handleVisibleChange()}
        footer={false}
      >
        <div id='modal-content-container'>{props.component}</div>
      </Modal>
      <Button
        type={props.btnType ?? 'primary'}
        className={props.btnClass}
        size={props.btnSize ?? 'large'}
        onClick={() => showModal()}
      >
        <EyeOutlined /> {props.btnText || t('Show Modal')}
      </Button>
    </Fragment>
  )
}

export default OpenModal
