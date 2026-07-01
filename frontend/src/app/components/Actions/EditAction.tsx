import React, {FC, useState} from 'react'
import {Button} from 'antd'
import {usePermissionContext} from '../../hooks/context/usePermissionContext'
import {useLang} from 'src/app/hooks/useLang'

interface IProps {
  entityId: any
  children?: any
  component?: any
  actionItem?: any
  manageUrl?: boolean
  handleCallbackFunc?: (event: any, action: string, recordId?: any, data?: any) => void
  [key: string]: any
}

const EditAction: FC<IProps> = (props) => {
  const {t} = useLang()

  const {
    entityId,
    btnText,
    children,
    component: Component,
    actionItem,
    manageUrl = true,
    handleCallbackFunc,
    ...restProps
  } = props
  const {isPermissionLoaded, hasPermission} = usePermissionContext()
  const [isShowForm, setIsShowForm] = useState(false)
  const [reloadForm, setReloadForm] = useState<number>(Date.now())

  const showFormModal = (): void => {
    if (manageUrl && handleCallbackFunc) {
      handleCallbackFunc(null, 'edit', entityId)
    } else {
      setIsShowForm(true)
      handleReloadForm()
    }
  }

  const hideFormModal = () => {
    setIsShowForm(false)
  }

  const handleReloadForm = () => {
    setReloadForm(Date.now())
  }

  const handleCallback = (event: any, action: string, recordId?: any, data?: any) => {
    if (!manageUrl && action == 'hideForm') {
      hideFormModal()
    } else if (handleCallbackFunc) {
      handleCallbackFunc(event, action, recordId, data)
    }
  }

  if (isPermissionLoaded && hasPermission(actionItem.permission)) {
    return (
      <>
        {children ? (
          <span onClick={() => showFormModal()}>{children}</span>
        ) : (
          <Button
            className='btn btn-edit btn-sm btn-light-primary me-3'
            onClick={() => showFormModal()}
          >
            {t(btnText) || t(actionItem.title)}
          </Button>
        )}
        {!manageUrl && (
          <Component
            entityId={entityId}
            reloadForm={reloadForm}
            isShowForm={isShowForm}
            handleCallbackFunc={handleCallback}
            {...restProps}
          />
        )}
      </>
    )
  }

  return <></>
}

export default EditAction
