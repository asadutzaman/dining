import React, { FC, useEffect } from 'react';
import { WorkflowApi } from 'src/app/api';
import DrawerForm from 'src/app/components/Drawer/DrawerForm';
import WorkflowAddOrEditForm from './WorkflowForm.form';
import { useCrudFormService } from 'src/app/hooks/crud/useCrudFormService';
import { WorkflowList } from '../data/WorkflowList.data';
import { useLang } from 'src/app/hooks/useLang';

const initialState = {
  modalTitle: 'Create Workflow Config',
  itemData: {},
  fields: {
    workflow_code: null,
    workflow_name: null,
    type: null,
    status: 1,
  },
  isNewRecord: true,
  loading: false,
  message: {
    network_error: 'A network error occurred. Please try again later.',
    create_success: 'The operation performed successfully.',
    update_success: 'The operation performed successfully.',
  },
};

const WorkflowFormController: FC<any> = (props) => {
  const {
    BaseCrudFormService,
    entityId,
    modalTitle,
    setModalTitle,
    isNewRecord,
    setIsNewRecord,
    isShowForm,
    reloadForm,
    itemData,
    loading,
    resetForm,
    isSubmitting,
    formRef,
    initialValues,
    handleChange,
    handleSubmitFailed,
    handleCallbackFunc,
  } = useCrudFormService(WorkflowApi, initialState, props);
  const { t } = useLang();

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false);
      setModalTitle(t('Edit Workflow'));
      resetForm();
      loadData();
    } else {
      resetForm();
      setModalTitle(initialState.modalTitle);
      setIsNewRecord(initialState.isNewRecord);
    }
  }, [entityId, reloadForm]);

  const loadData = (): void => {
    BaseCrudFormService.loadData().then((res: any) => {
      const initFormDta = {
        workflow_code: res.data.workflow_code,
        workflow_name: res.data.workflow_name,
        type: res.data.type,
        status: res.data.status,
      };
      handleChange(initFormDta);
      formRef.setFieldsValue(initFormDta);
    });
  };

  const handleSubmit = async (values: any): Promise<void> => {
    const workflowInfo = WorkflowList.find(
      (item) => item.workflow_code === values.workflow_code
    );
    try {
      if (entityId) {
        await handleUpdate(values, workflowInfo);
      } else {
        await handleCreate(values, workflowInfo);
      }
    } catch (error: any) {
      // console.error('Form submission error:', error)
      handleSubmitFailed(error);
    }
  };

  const handleCreate = (values: any, workflowInfo: any): Promise<any> => {
    const payload = {
      ...values,
      workflow_name: workflowInfo.workflow_name,
      type: workflowInfo.workflow_type,
    };
    return BaseCrudFormService.handleCreate(payload);
  };

  const handleUpdate = (values: any, workflowInfo: any): Promise<any> => {
    const payload = {
      ...values,
      workflow_name: workflowInfo.workflow_name,
      type: workflowInfo.workflow_type,
    };
    return BaseCrudFormService.handleUpdate(payload);
  };

  return (
    <div className="form-page-container form-page-container-example">
      <DrawerForm
        loading={loading}
        isNewRecord={isNewRecord}
        itemData={itemData}
        modalTitle={modalTitle}
        isSubmitting={isSubmitting}
        isShowForm={isShowForm}
        formRef={formRef}
        initialValues={initialValues}
        WorkflowList={WorkflowList}
        component={WorkflowAddOrEditForm}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
      />
    </div>
  );
};

export default React.memo(WorkflowFormController);
