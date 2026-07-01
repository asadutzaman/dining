import React, { FC } from 'react';
import ViewTabList from '../../../../../components/Tab/ViewTabList';
import SmsSettingsViewTab from '../Tabs/SmsSettingsView.tab';
import TimeSlotSettingsViewTab from '../Tabs/TimeSlotSettingsView.tab';
import { useLang } from 'src/app/hooks/useLang';

const ApplicationSettingsView: FC<any> = (props) => {
  const { itemData, handleCallbackFunc, loading, ...restProps } = props;
  const { t } = useLang();

  const viewTabListData: any = [
    {
      tabIndex: 1,
      label: t('SMS Settings'),
      permission: '',
      component: (
        <SmsSettingsViewTab
          itemData={itemData}
          loading={loading}
          {...restProps}
        />
      ),
    },
    {
      tabIndex: 2,
      label: t('Time Slot Settings'),
      permission: '',
      component: (
        <TimeSlotSettingsViewTab
          itemData={itemData}
          loading={loading}
          {...restProps}
        />
      ),
    },
  ];

  return (
    <div className="card">
      <div className="card card-header p-6">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-10">
            {t('Application Settings')}
          </span>
        </h3>
        <span className="card-label fw-bold fs-3 mb-1">
          {loading === false && (
            <ViewTabList
              activeTabIndex={'1'}
              viewTabListData={viewTabListData}
            />
          )}
        </span>
      </div>
    </div>
  );
};
export default React.memo(ApplicationSettingsView);
