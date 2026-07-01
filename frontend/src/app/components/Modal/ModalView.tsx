import React, { FC } from 'react'
import { Modal, Spin, Button } from 'antd';
// import CustomScrollbar from "../Scrollbar/CustomScrollbar";

interface IProps {
    loading: any,
    modalTitle: any,
    isShowModal: boolean,
    drawerWidth?: any,
    children?: any,
    component?: any,
    handleHideModal: any,
    [key: string]: any,
}

const ModalView: FC<IProps> = props => {
    const { loading, modalTitle, isShowModal, component: Component, handleHideModal, ...restProps } = props;
    return (
        <Modal
            width={720}
            className="form-page-modal form-page-modal-fellowship-type"
            title={<b>{modalTitle}&nbsp;&nbsp;{loading && <Spin size="small" />}</b>}
            maskClosable={false}
            centered
            open={isShowModal}
            onCancel={(event) => handleHideModal()}
            footer={[
                <Button key='close' onClick={(event) => handleHideModal()}>{'Close'}</Button>,
            ]}
        >
            {/* <CustomScrollbar
                autoHeight={true}
                autoHeightMin={200}
                className="view-page-drawer-scrollbar"
            > */}
            <Component
                loading={loading}
                {...restProps}
            />
            {/* </CustomScrollbar> */}
        </Modal>
    );
}
export default React.memo(ModalView);