import React, { FC, Fragment } from 'react'
import { Modal, Spin, Button } from 'antd';
// import CustomScrollbar from "../Scrollbar/CustomScrollbar";

interface IProps {
    formRef: any,
    modalTitle: any,
    loading: any,
    isShowForm: any,
    handleCallbackFunc: any,
    [key: string]: any,
}

const AntModal: FC<IProps> = props => {
    const { formRef, modalTitle, loading, isShowForm, handleCallbackFunc, ...restProps } = props;
    const onSubmit = () => {
        formRef.submit();
    }
    return (
        <Fragment>
            <Modal
                width={720}
                className="form-page-modal form-page-modal-fellowship-type"
                title={<b>{modalTitle}&nbsp;&nbsp;{loading && <Spin size="small" />}</b>}
                maskClosable={false}
                centered
                open={isShowForm}
                onCancel={(event) => handleCallbackFunc(null, "hideForm")}
                footer={[
                    <Button key="cancel" onClick={(event) => handleCallbackFunc(null, "hideForm")}>{"Cancel"}
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={onSubmit}>{"Submit"}
                    </Button>,
                ]}
            >
                {/* <CustomScrollbar className="form-page-modal-scrollbar">

                </CustomScrollbar> */}
            </Modal>
        </Fragment>
    );
}
export default React.memo(AntModal);