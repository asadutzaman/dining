import React, { FC } from 'react'
import { Link } from 'react-router-dom';
import { Button } from "antd";
import { usePermissionContext } from "../../hooks/context/usePermissionContext";

interface IProps {
    entityId: any,
    children?: any,
    actionItem?: any,
    [key: string]: any,
}

const EditLink: FC<IProps> = props => {
    const { entityId, btnText, children, actionItem } = props;
    const { isPermissionLoaded, hasPermission } = usePermissionContext();

    if (isPermissionLoaded && hasPermission(actionItem.permission)) {
        const editUrl = actionItem.link.to + '/' + entityId;
        return (
            <>
                {children ? (
                    <Link to={`/${actionItem.link.urlPrefix}/${editUrl}`}>{children}</Link>
                ) : (
                    <Link to={`/${actionItem.link.urlPrefix}/${editUrl}`}>
                        <Button type="primary" className="btn btn-edit btn-sm btn-light-primary me-3"> {btnText || actionItem.title}</Button>
                    </Link>
                )}
            </>
        );
    }

    return <></>
}

export default EditLink;