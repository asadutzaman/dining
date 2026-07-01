import React, {FC} from 'react'
import {Button, Dropdown, Menu} from 'antd'
import {CloudDownloadOutlined} from '@ant-design/icons'
import {usePermissionContext} from '../../hooks/context/usePermissionContext'

interface IProps {
  bulkAction: any
  handleExportFunc: (action: string) => void
}

const ExportOption: FC<IProps> = (props) => {
  const {bulkAction, handleExportFunc, ...restProps} = props
  const {isPermissionLoaded, hasPermission} = usePermissionContext()
  const bulkActionDropDownList = (
    <Menu>
      {bulkAction.action_list.map((item: any, index: any) => {
        if (isPermissionLoaded && hasPermission(item.permission)) {
          return (
            <Menu.Item key={`${index}`} onClick={() => handleExportFunc(item.action)}>
              {/* {item.type == 'item' && ( */}
              <span>{item.title}</span>
              {/* )} */}
              {/* {item.type == 'load_drawer_view' && (
                                <Button type="text">{item.component}</Button>
                            )}
                            {item.type == 'component' && (
                                <item.component handleCallbackFunc={handleCallbackFunc} {...restProps} />
                            )} */}
            </Menu.Item>
          )
        }
      })}
    </Menu>
  )

  if (isPermissionLoaded && hasPermission(bulkAction.permission)) {
    return (
      <div className='filter-box-right button-box bulk-action-button-box'>
        <Dropdown overlay={bulkActionDropDownList} trigger={['click']} placement='bottomRight'>
          <button type='button' className='btn btn-sm btn-light-primary me-3'>
            <CloudDownloadOutlined />
          </button>
        </Dropdown>
      </div>
    )
  }

  return <></>
}

export default ExportOption
