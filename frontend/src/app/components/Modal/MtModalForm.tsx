import React, { FC, Fragment } from 'react'
import { Modal } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import { KTIcon } from '../../../_metronic/helpers';
// import CustomScrollbar from "../Scrollbar/CustomScrollbar";

interface IProps {
    formRef: any,
    modalTitle: any,
    loading: any,
    isShowForm: any,
    handleCallbackFunc: any,
    [key: string]: any,

}
const modalsRoot = document.getElementById('root-modals') || document.body

const ModalForm: FC<IProps> = props => {
    const { formRef, modalTitle, loading, isShowForm, children, component: Component, handleCallbackFunc, drawerWidth, ...restProps } = props;
    const onSubmit = () => {
        formRef.submit();
    }
    return createPortal(
        <Modal
            id='kt_modal_create_app'
            // tabIndex={-1}
            aria-hidden='true'
            dialogClassName='modal-dialog modal-dialog-centered mw-900px'
            show={isShowForm}
            onHide={() => handleCallbackFunc(null, "hideForm")}
            // onEntered={loadStepper}
            backdrop={true}
        >
            <div className='modal-header'>
                <h2>{modalTitle}</h2>
                <div className='btn btn-sm btn-icon btn-active-color-primary' onClick={() => handleCallbackFunc(null, "hideForm")}>
                    <KTIcon className='fs-1' iconName='cross' />
                </div>
            </div>
            <div className='modal-body py-lg-10 px-lg-10'>
                <Component
                    loading={loading}
                    formRef={formRef}
                    handleCallbackFunc={handleCallbackFunc}
                    {...restProps}
                />
            </div>

        </Modal>,
        modalsRoot
    );
}
export default React.memo(ModalForm);
