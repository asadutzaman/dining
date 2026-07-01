import React, {FC, useState} from 'react'
import {Button, Drawer} from "antd";
import CustomScrollbar from "../Scrollbar/CustomScrollbar";

interface IProps {
    modalTitle?: any,
    width?: any,
    children?: any,
    component?: any,
    [key: string]: any,
}

const LoadDrawerView: FC<IProps> = props => {
    const { modalTitle, width, children, component: Component, ...restProps } = props;
    const [isShowView, setIsShowView] = useState(false);
    const [reloadView, setReloadView] = useState<number>(Date.now());

    const showViewModal = (): void => {
        setIsShowView(true);
        handleReloadView();
    }

    const hideViewModal = () => {
        setIsShowView(false);
    }

    const handleReloadView = () => {
        setReloadView(Date.now());
    };

    return (
        <>
            { <span onClick={() => showViewModal()}>{children}</span> }

            { isShowView && (
                <Drawer
                    width={width ? width : '70%'}
                    zIndex={500}
                    className="view-page-drawer view-page-drawer-sample"
                    title={<b>{modalTitle}</b>}
                    mask={false}
                    visible={isShowView}
                    onClose={(event) => hideViewModal()}
                    footer={[
                        <Button key='close' onClick={(event) => hideViewModal()}>Close</Button>,
                    ]}
                >
                    <CustomScrollbar className="view-page-drawer-scrollbar">
                        { <Component reloadView={reloadView} isShowView={isShowView} hideViewModal={hideViewModal} {...restProps}  /> }
                    </CustomScrollbar>
                </Drawer>
            )}
        </>
    );
}

export default LoadDrawerView;
