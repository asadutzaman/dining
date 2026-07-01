import React, { FC, useEffect } from 'react'
import { useCrudViewService } from "../../../../../hooks/crud/useCrudViewService";
import { ApproverGroupApi } from "../../../../../api";
import DrawerView from '../../../../../components/Drawer/DrawerView';
import ApproverGroupView from './ApproverGroupView.view';

const initialState = {
    modalTitle: 'Approver Group Info',
    itemData: {},
    loading: false,
    fields: {},
    message: {
        network_error: 'A network error occurred. Please try again later.'
    }
}

const ApproverGroupViewController: FC<any> = props => {
    const { BaseCrudViewService, modalTitle, itemData, setItemData, loading, entityId, reloadView,
        isShowView, handleCallbackFunc } = useCrudViewService(ApproverGroupApi, initialState, props);

    useEffect(() => {
        setItemData(initialState.itemData);
        if (entityId && isShowView) {
            loadData();
        }
    }, [entityId, reloadView])

    const loadData = (): Promise<any> => {
        return BaseCrudViewService.loadData();
    }

    return (
        <DrawerView
            loading={loading}
            reloadView={reloadView}
            isShowView={isShowView}
            modalTitle={modalTitle}
            itemData={itemData}
            component={ApproverGroupView}
            handleCallbackFunc={handleCallbackFunc}
        />
    );
}

export default React.memo(ApproverGroupViewController);
