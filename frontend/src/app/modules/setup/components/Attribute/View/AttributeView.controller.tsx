import React, { FC, useEffect } from 'react'
import AttributeView from './AttributeView.view';
import { useCrudViewService } from 'src/app/hooks/crud/useCrudViewService';
import { AttributeApi } from 'src/app/api';
import DrawerView from 'src/app/components/Drawer/DrawerView';

const initialState = {
    modalTitle: 'Attribute Info',
    itemData: {},
    loading: false,
    fields: {},
    message: {
        network_error: 'A network error occurred. Please try again later.'
    }
}

const AttributeViewController: FC<any> = props => {
    const { BaseCrudViewService, modalTitle, itemData, setItemData, loading, entityId, reloadView,
        isShowView, handleCallbackFunc } = useCrudViewService(AttributeApi, initialState, props);

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
            component={AttributeView}
            handleCallbackFunc={handleCallbackFunc}
        />
    );
}

export default React.memo(AttributeViewController);
