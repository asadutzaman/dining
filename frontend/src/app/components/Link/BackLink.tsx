import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom';
import { Button } from "antd";

interface IProps {
    actionItem?: any,
    btnText?: any,
    children?: any,
    [key: string]: any,
}

const BackLink: FC<IProps> = props => {
    const navigate = useNavigate();
    const { btnText, children, actionItem } = props;

    const handleGoBack = () => {
        if (actionItem?.link) {
            navigate(`${actionItem.link.urlPrefix}/${actionItem.link.to}`);
        } else {
            navigate(-1);
        }
    }

    return (
        <>
            {children ? (
                <span onClick={() => handleGoBack()}>{children}</span>
            ) : (
                <Button className="btn btn-edit btn-sm btn-light-info me-3" onClick={() => handleGoBack()}> {btnText}</Button>
            )}
        </>
    );
}

export default BackLink;