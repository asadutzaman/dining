import React, { FC, Fragment } from 'react'
import { Modal, Spin, Button } from 'antd';
import AddOrEditForm from "./SwitchOrganization.form";

interface IProps {
  formRef: any,
  modalTitle: any,
  loading: any,
  isShowForm: any,
  [key: string]: any,
}

const SwitchOrganizationModal: FC<IProps> = props => {
  const { formRef, modalTitle, loading, isShowForm, handleHideForm, ...restProps } = props;
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
        onCancel={(event) => handleHideForm()}
        footer={[
          <Button key="cancel" onClick={(event) => handleHideForm()}>{"Cancel"}</Button>,
          <Button key="submit" type="primary" loading={loading} onClick={onSubmit}>{"Switch"}</Button>,
        ]}
      >
        <AddOrEditForm
          formRef={formRef}
          {...restProps}
        />
      </Modal>
    </Fragment>
  );
}
export default React.memo(SwitchOrganizationModal);