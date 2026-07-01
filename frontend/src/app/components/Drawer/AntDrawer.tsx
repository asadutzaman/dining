import React, { FC, Fragment } from 'react'
import { Drawer, Spin, Button } from 'antd';
// import CustomScrollbar from "../Scrollbar/CustomScrollbar";
import useResponsive from "../../hooks/useResponsive";

interface IProps {
    drawerWidth?: any,
    modalTitle: any,
    loading: any,
    isShowView: any,
    itemData: any,
    children?: any,
    component?: any,
    handleCallbackFunc: any,
    [key: string]: any,
}

const AntDrawer: FC<IProps> = props => {
    const { isMobile } = useResponsive();
    const { modalTitle, loading, drawerWidth, isShowView, itemData, children, component: Component, handleCallbackFunc, ...restProps } = props;
    return (
        <Fragment>
            <Drawer
                width={isMobile ? "100%" : drawerWidth ? drawerWidth : "60%"}
                zIndex={500}
                className="view-page-drawer view-page-drawer-example"
                title={<b>{modalTitle}&nbsp;&nbsp;{loading && <Spin size="small" />}</b>}
                mask={false}
                open={isShowView}
                onClose={(event) => handleCallbackFunc(null, 'hideView')}
                footer={[
                    <Button key='close' onClick={(event) => handleCallbackFunc(null, 'hideView')}>{'Close'}</Button>,
                ]}
            >
                {/* <CustomScrollbar className="view-page-drawer-scrollbar"> */}
                <Component
                    loading={loading}
                    itemData={itemData}
                    handleCallbackFunc={handleCallbackFunc}
                    {...restProps}
                />
                {/* </CustomScrollbar> */}
            </Drawer>
        </Fragment>
    );
}
export default React.memo(AntDrawer);