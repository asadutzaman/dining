import {Button} from 'antd'
import {FC} from 'react'
import {usePermissionContext} from '../../hooks/context/usePermissionContext'

interface IProps {
  entityId: any
  modalNameList: any
  whichModal: any
  className?: any
  actionItem?: any
  btnText?: any
  enablePermission?: boolean
  handleCallbackFunc?: (event: any, action: string, recordId?: any, data?: any) => void
}

const ModalAction: FC<IProps> = (props) => {
  const {
    entityId,
    modalNameList,
    whichModal,
    className = 'btn-primary',
    actionItem,
    btnText,
    enablePermission = false,
    handleCallbackFunc,
  } = props
  const {isPermissionLoaded, hasPermission} = usePermissionContext()

  const showFormModal = (): void => {
    if (handleCallbackFunc) {
      handleCallbackFunc(null, 'modalUpdateForm', entityId, {
        modalFormType: modalNameList,
        whichModal: whichModal,
      })
    }
  }

  if (enablePermission && isPermissionLoaded && hasPermission(actionItem.permission)) {
    return (
      <Button className={`btn btn-sm ${className} me-3 mb-2`} onClick={() => showFormModal()}>
        {btnText || actionItem.title}
      </Button>
    )
  }

  if (enablePermission === false) {
    return (
      <Button className={`btn btn-sm ${className} me-3 mb-2`} onClick={() => showFormModal()}>
        {btnText || actionItem.title}
      </Button>
    )
  }

  return <></>
}

export default ModalAction
