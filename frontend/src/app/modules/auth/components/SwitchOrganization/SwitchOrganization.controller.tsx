import React, { FC, useState, useContext, useEffect } from 'react';
import SwitchOrganizationModal from './SwitchOrganization.modal';
import { AuthContext } from '../../../../context/auth/auth.context';
import { useForm } from '../../../../hooks/useForm';
import { Link } from 'react-router-dom';
import { OauthApi } from '../../../../api';
import { Message } from '../../../../utils';
import { LOADED_TOKEN } from '../../../../context/auth/auth.types';
import { useOrganizationList } from '../../../../hooks/lists/useOrganizationList';
import { useOrganogramList } from '../../../../hooks/lists/useOrganogramList';
import { useLang } from '../../../../hooks/useLang';
import { KTIcon } from '../../../../../_metronic/helpers';

const initialState = {
  modalTitle: 'Switch Organization & Organogram',
  fields: {
    organization_id: null,
    organogram_id: null,
  },
  isShowForm: false,
  loading: false,
};

const SwitchOrganizationController: FC = () => {
  const { userId, organizationId, organogramId, dispatchAuth, loadAuthState } =
    useContext(AuthContext);
  const { loadingOrganizationList, organizationList, getOrganizationById } =
    useOrganizationList();
  const { loadingOrganogramList, organogramList, getOrganogramById } =
    useOrganogramList();
  const {
    formRef,
    initialValues,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleSubmitFailed,
  } = useForm(initialState.fields);

  const modalTitle = initialState.modalTitle;
  const [loading, setLoading] = useState(initialState.loading);
  const [isShowForm, setIsShowForm] = useState(initialState.isShowForm);

  useEffect(() => {
    formRef.setFieldsValue({
      organization_id: organizationId,
      organogram_id: organogramId,
    });
  }, [organizationId, organogramId]);

  const handleShowForm = () => {
    setIsShowForm(true);
  };

  const handleHideForm = () => {
    setIsShowForm(false);
  };

  const handleSubmit = (values: any): void => {
    setLoading(true);
    setIsSubmitting(true);

    const organizationInfo = getOrganizationById(values.organization_id);
    const organogramInfo = getOrganogramById(values.organogram_id);
    const payload = {
      user_id: userId,
      organization_id: values.organization_id,
      organogram_id: values.organogram_id,
    };
    OauthApi.switchLoginOrganization(payload)
      .then((res) => {
        dispatchAuth({
          type: LOADED_TOKEN,
          payload: {
            accessToken: res?.data?.access_token,
            refreshToken: res?.data?.refresh_token,
            organogramId: values?.organogram_id,
            organogramIds: values?.organogram_ids,
            organogramNameEn: organogramInfo?.name_en,
            organogramNameBn: organogramInfo?.name_bn,
            organizationId: values?.organization_id,
            organizationIds: values?.organization_ids,
            organizationNameEn: organizationInfo?.name_en,
            organizationNameBn: organizationInfo?.name_bn,
          },
        });
        loadAuthState(res.data.access_token);
        handleHideForm();
        setLoading(false);
        setIsSubmitting(false);
      })
      .catch((err) => {
        Message.error('A network error occurred. Please try again later.');
        handleHideForm();
        setLoading(false);
        setIsSubmitting(false);
      });
  };

  return (
    <div className="switch-organization">
      <SwitchOrganizationModal
        formRef={formRef}
        loading={loading}
        modalTitle={modalTitle}
        isSubmitting={isSubmitting}
        isShowForm={isShowForm}
        initialValues={initialValues}
        loadingOrganizationList={loadingOrganizationList}
        organizationList={organizationList}
        loadingOrganogramList={loadingOrganogramList}
        activeOrganogramList={organogramList}
        handleHideForm={handleHideForm}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
      />
      <Link to={'#'} onClick={() => handleShowForm()}>
        {/* Switch Organization */}
        <i className="ki-duotone ki-arrows-loop fs-1">
          <i className="path1"></i>
          <i className="path2"></i>
        </i>
      </Link>
    </div>
  );
};

export default SwitchOrganizationController;
