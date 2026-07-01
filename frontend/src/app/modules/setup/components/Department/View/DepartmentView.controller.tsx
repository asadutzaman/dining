import React, { FC, useEffect } from 'react';
import { useCrudViewService } from 'src/app/hooks/crud/useCrudViewService';
import { DepartmentApi } from 'src/app/api';
import DrawerView from 'src/app/components/Drawer/DrawerView';
import DepartmentView from './DepartmentView.view';
import { useLang } from 'src/app/hooks/useLang';

const initialState = {
  modalTitle: 'Department Info',
  itemData: {},
  loading: false,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
};

const DepartmentViewController: FC<any> = (props) => {
  const { t } = useLang();
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
  } = useCrudViewService(DepartmentApi, initialState, props);

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
      component={DepartmentView}
      handleCallbackFunc={handleCallbackFunc}
    />
  );
};

export default React.memo(DepartmentViewController);
