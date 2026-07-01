import React, { FC, Fragment } from 'react';
import { Modal, Spin, Button } from 'antd';
import AddOrEditForm from './AttributeForm.form';
import CustomScrollbar from 'src/app/components/Scrollbar/CustomScrollbar';
import useResponsive from 'src/app/hooks/useResponsive';
import { useLang } from 'src/app/hooks/useLang';

interface IProps {
  formRef: any;
  modalTitle: any;
  loading: any;
  isShowForm: any;
  handleCallbackFunc: any;
  [key: string]: any;
}

const LagashoiProzuktiUpazilaFormModal: FC<IProps> = (props) => {
  const { isMobile } = useResponsive();
  const {
    formRef,
    modalTitle,
    loading,
    isShowForm,
    modalWidth,
    handleCallbackFunc,
    ...restProps
  } = props;
  const { t } = useLang();

  const onSubmit = () => {
    formRef.submit();
  };
  return (
    <Fragment>
      <Modal
        width={isMobile ? '100%' : modalWidth ? modalWidth : '60%'}
        className="form-page-modal form-page-modal-educational-qualification"
        title={
          <b>
            {t(modalTitle)}&nbsp;&nbsp;{loading && <Spin size="small" />}
          </b>
        }
        maskClosable={false}
        centered
        open={isShowForm}
        onCancel={(event) => handleCallbackFunc(null, 'hideForm')}
        footer={[
          <Button
            key="cancel"
            onClick={(event) => handleCallbackFunc(null, 'hideForm')}
          >
            {t('Cancel')}
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={onSubmit}
          >
            {t('Save')}
          </Button>,
        ]}
      >
        <CustomScrollbar
          autoHeight
          autoHeightMax={500}
          className="form-page-modal-scrollbar"
        >
          <AddOrEditForm formRef={formRef} {...restProps} />
        </CustomScrollbar>
      </Modal>
    </Fragment>
  );
};
export default React.memo(LagashoiProzuktiUpazilaFormModal);
