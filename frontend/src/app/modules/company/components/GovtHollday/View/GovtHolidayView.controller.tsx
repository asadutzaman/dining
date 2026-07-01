import React, { FC, useEffect } from 'react';
import { useCrudViewService } from 'src/app/hooks/crud/useCrudViewService';
import { GovtHolidayApi } from 'src/app/api';
import DrawerView from 'src/app/components/Drawer/DrawerView';
import GovtHolidayView from './GovtHolidayView.view';

const initialState = {
  modalTitle: 'Weekend and Holiday Info',
  itemData: {},
  loading: false,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
};

const GovtHolidayViewController: FC<any> = (props) => {
  const {
    BaseCrudViewService,
    modalTitle,
    itemData,
    setItemData,
    loading,
    entityId,
    reloadView,
    isShowView,
    handleCallbackFunc,
  } = useCrudViewService(GovtHolidayApi, initialState, props);

  useEffect(() => {
    setItemData(initialState.itemData);
    if (entityId && isShowView) {
      loadData();
    }
  }, [entityId, reloadView]);

  const loadData = (): Promise<any> => {
    return BaseCrudViewService.loadData();
  };

  return (
    <DrawerView
      loading={loading}
      reloadView={reloadView}
      isShowView={isShowView}
      modalTitle={modalTitle}
      itemData={itemData}
      component={GovtHolidayView}
      handleCallbackFunc={handleCallbackFunc}
    />
  );
};

export default React.memo(GovtHolidayViewController);
