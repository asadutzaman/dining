import React, {FC, useState} from 'react'
import {Button} from 'antd'
import {usePermissionContext} from '../../hooks/context/usePermissionContext'
import clsx from 'clsx'
import {KTIcon} from '../../../_metronic/helpers'
import {useLang} from 'src/app/hooks/useLang'

interface IProps {
  children?: any
  actionItem?: any
  component?: any
  manageUrl?: boolean
  handleCallbackFunc?: (event: any, action: string, recordId?: any, data?: any) => void
  [key: string]: any
}

const CreateAction: FC<IProps> = (props) => {
  const {t} = useLang()
  const {
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
      handleCallbackFunc(null, 'add')
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
          <button
            type='button'
            className='btn btn-sm btn-primary float-end me-3 mb-2'
            onClick={() => showFormModal()}
          >
            {' '}
            <KTIcon iconName='plus' className='fs-2' /> {t(actionItem.title)}
          </button>
        )}

        {!manageUrl && (
          <Component
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

export default CreateAction
