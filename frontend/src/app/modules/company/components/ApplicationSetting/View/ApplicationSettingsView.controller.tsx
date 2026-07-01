import React, { FC, useState, useEffect } from 'react';
import { useCrudViewService } from '../../../../../hooks/crud/useCrudViewService';
import { ApplicationSettingApi } from '../../../../../api';
import ApplicationSettingsView from './ApplicationSettingsView.view';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'src/app/hooks/useForm';
import { Message } from 'src/app/utils';
import dayjs from 'dayjs';

const ApplicationSettingsViewController: FC<any> = (props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    formRef,
    initialValues,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleSubmitFailed,
  } = useForm({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      ApplicationSettingApi.dropdown()
        .then((res: any) => {
          let results = res.data.results;
          let initFormDta = {
            sms_api_key: 0,
            sms_secret_key: 0,
            office_hours: 0,
            office_start_time: dayjs('10:00', 'HH:mm'),
            office_end_time: dayjs('12:00', 'HH:mm'),
            slot_duration: 0,
            slot_capacity: 0,
            // weekends_days: 'friday',
            // weekends_days: [],
            weekends_days: [] as string[],
          };
          results.map((item: any, index: number) => {
            if (item.option === 'sms_api_key') {
              initFormDta.sms_api_key = item.value;
            }
            if (item.option === 'sms_secret_key') {
              initFormDta.sms_secret_key = item.value;
            }
            if (item.option === 'office_start_time') {
              initFormDta.office_start_time = dayjs(item.value, 'HH:mm');
            }
            if (item.option === 'office_end_time') {
              initFormDta.office_end_time = dayjs(item.value, 'HH:mm');
            }
            if (item.option === 'slot_duration') {
              initFormDta.slot_duration = item.value;
            }
            if (item.option === 'slot_capacity') {
              initFormDta.slot_capacity = item.value;
            }
            if (item.option === 'weekends_days') {
              initFormDta.weekends_days = item.value
                ? String(item.value)
                    .split(',')
                    .map((v: string) => v.trim())
                    .filter((v: string) => v.length > 0)
                : [];
            }
            // if (item.option === 'weekends_days') {
            //   initFormDta.weekends_days = item.value;
            // }
          });
          formRef.setFieldsValue(initFormDta);
          setLoading(false);
          resolve(res);
        })
        .catch((err: any) => {
          if (err?.status === 409) {
            setErrors(err.data);
          } else if (err?.status === 412) {
            setErrors(err.data);
          } else if (err?.status === 422) {
            Message.error(err.data);
          } else {
            Message.error('A network error occurred. Please try again later.');
          }
          setLoading(false);
          reject(err);
        });
    });
  };

  const handleSubmit = (values: any): void => {
    setLoading(true);
    setIsSubmitting(true);

    const payload = {
      ...values,
      weekends_days: Array.isArray(values.weekends_days)
        ? values.weekends_days.join(',')
        : values.weekends_days,
    };

    ApplicationSettingApi.updateSetting(payload)
      .then((res) => {
        Message.success('Settings Updated successfully.');
        setLoading(false);
        setIsSubmitting(false);
        navigate('/admin/setting/company/application-settings');
      })
      .catch((err) => {
        if (err?.status === 409) {
          setErrors(err.data);
        } else if (err?.status === 412) {
          setErrors(err.data);
        } else if (err?.status === 422) {
          Message.error(err.data);
        } else {
          Message.error('A network error occurred. Please try again later.');
        }
        setLoading(false);
        setIsSubmitting(false);
      });
  };

  return (
    <ApplicationSettingsView
      formRef={formRef}
      loading={loading}
      initialValues={initialValues}
      isSubmitting={isSubmitting}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      handleSubmitFailed={handleSubmitFailed}
    />
  );
};

export default React.memo(ApplicationSettingsViewController);
