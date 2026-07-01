import React, { FC, useEffect } from 'react';
import dayjs from 'dayjs';
import { GovtHolidayApi } from 'src/app/api';
import DrawerForm from 'src/app/components/Drawer/DrawerForm';
import GovtHolidayAddOrEditForm from './GovtHolidayForm.form';
import { useCrudFormService } from 'src/app/hooks/crud/useCrudFormService';

const initialState = {
  modalTitle: 'Create Weekend and Holiday',
  itemData: {},
  fields: {
    date: null,
    holiday_type: null,
  },
  isNewRecord: true,
  loading: false,
  message: {
    network_error: 'A network error occurred. Please try again later.',
    create_success: 'The operation performed successfully.',
    update_success: 'The operation performed successfully.',
  },
};

const GovtHolidayFormController: FC<any> = (props) => {
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
  } = useCrudFormService(GovtHolidayApi, initialState, props);

  useEffect(() => {
    if (entityId && isShowForm) {
      setIsNewRecord(false);
      setModalTitle('Edit Weekend and Holiday');
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
        date: res.data?.date ? dayjs(res.data.date) : null,
        holiday_type: res.data.holiday_type,
      };
      handleChange(initFormDta);
      formRef.setFieldsValue(initFormDta);
    });
  };

  const handleSubmit = async (values: any): Promise<void> => {
    try {
      if (entityId) {
        await handleUpdate(values);
      } else {
        await handleCreate(values);
      }
    } catch (error: any) {
      // console.error('Form submission error:', error)
      handleSubmitFailed(error);
    }
  };

  const handleCreate = (values: any): Promise<any> => {
    const payload = {
      ...values,
      date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : null,
    };
    return BaseCrudFormService.handleCreate(payload);
  };

  const handleUpdate = (values: any): Promise<any> => {
    const payload = {
      ...values,
      date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : null,
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
        component={GovtHolidayAddOrEditForm}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
      />
    </div>
  );
};

export default React.memo(GovtHolidayFormController);
