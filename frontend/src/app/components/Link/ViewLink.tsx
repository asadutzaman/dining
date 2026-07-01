import React, { FC } from 'react'
import { Link } from 'react-router-dom';
import { usePermissionContext } from "../../hooks/context/usePermissionContext";

interface IProps {
    entityId: any,
    children?: any,
    actionItem?: any,
    defaultViewText?: any,
    [key: string]: any,
}

const ViewLink: FC<IProps> = props => {
    const { children, entityId, actionItem, defaultViewText } = props;
    const { isPermissionLoaded, hasPermission } = usePermissionContext();

    if (isPermissionLoaded && hasPermission(actionItem.permission)) {
        const viewUrl = actionItem.link.to + '/' + entityId;
        return (
            <>
                {children ? (
                    <Link to={`${viewUrl}`}>{children}</Link>
                ) : (
                    <Link to={`${viewUrl}`}> {actionItem.title}</Link>
                )}
            </>
        );
    }
    else if (defaultViewText) {
        return defaultViewText
    }
    else {
        return <></>
    }
}

export default ViewLink;