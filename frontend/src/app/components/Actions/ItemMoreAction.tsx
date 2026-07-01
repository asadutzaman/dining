import React, { FC } from 'react'
import { Button } from "antd";
import { usePermissionContext } from "../../hooks/context/usePermissionContext";
import { KTIcon } from '../../../_metronic/helpers';

interface IProps {
    entityIndex: any,
    actionItem?: any,
    component?: any,
    handleCallbackFunc?: (event: any, action: string, recordId?: any, data?: any) => void,
}

const ItemMoreAction: FC<IProps> = props => {
    const { entityIndex, actionItem, component: Component, handleCallbackFunc } = props;
    const { isPermissionLoaded, hasPermission } = usePermissionContext();

    if (isPermissionLoaded && hasPermission(actionItem.permission)) {
        return (
            <Component entityIndex={entityIndex} actionItem={actionItem} handleCallbackFunc={handleCallbackFunc}>
                <Button className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mt-1'> <KTIcon iconName={actionItem.icon} className='fs-3' /> </Button>
            </Component>
        );
    }

    return <></>

}

export default ItemMoreAction;