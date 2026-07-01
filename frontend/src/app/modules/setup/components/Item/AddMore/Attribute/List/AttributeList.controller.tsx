import React, { FC, useState } from 'react';
import { Col, Row } from 'antd';
import { AntModal } from 'src/app/utils';
import { KTIcon } from 'src/_metronic/helpers';
import AttributeList from './AttributeList.listing';
import AttributeFormController from '../Form/AttributeForm.controller';
import { useLang } from 'src/app/hooks/useLang';

interface IProps {
  itemData: any;
  moreItemListData: any;
  setMoreItemListData: any;
  [key: string]: any;
}

const initialState = {
  entity: {},
  entityIndex: null,
};

const AttributeListController: FC<IProps> = (props) => {
  const { loading, itemData, moreItemListData, setMoreItemListData } = props;
  const [entity, setEntity] = useState(initialState.entity);
  const [entityIndex, setEntityIndex] = useState(initialState.entityIndex);
  const [isShowForm, setIsShowForm] = useState(false);
  const [reloadForm, setReloadForm] = useState<number>(Date.now());
  const [loadingAddMoreItem, setLoadingAddMoreItem] = useState(false);
  const { t } = useLang();

  const handleShowForm = () => {
    setIsShowForm(true);
    handleReloadForm();
  };

  const handleHideForm = () => {
    setIsShowForm(false);
    setEntityIndex(null);
  };

  const handleReloadForm = () => {
    setReloadForm(Date.now());
  };

  const handleDeleteConfirm = (itemIndex: number, action: any) => {
    if (action === 'ok') {
      const filteredItems = moreItemListData.filter(
        (item: any, index: any) => index !== itemIndex
      );
      setMoreItemListData(filteredItems);
    }
  };

  const handleActions = (action: string, entityIndex?: any) => {
    const record = moreItemListData[entityIndex];
    setEntity(record);
    if (action === 'add') {
      setEntityIndex(null);
      setIsShowForm(true);
      handleReloadForm();
    } else if (action === 'edit') {
      setEntityIndex(entityIndex);
      setIsShowForm(true);
      handleReloadForm();
    } else if (action === 'delete') {
      AntModal.confirm(
        'Delete Attribute',
        'Are you sure you want to delete this Attribute?',
        entityIndex,
        handleDeleteConfirm,
        'Delete'
      );
    }
  };

  const handleCallbackFunc = (
    event: any,
    action: string,
    recordId?: any,
    data?: any
  ) => {
    if (event === null || event === undefined || event === '') {
      event = event ? event : 'singleAction';
    }
    if (event === 'singleAction' && action === 'add') {
      handleActions('add');
    } else if (event === 'singleAction' && action === 'edit') {
      handleActions('edit', recordId);
    } else if (event === 'singleAction' && action === 'delete') {
      handleActions('delete', recordId);
    } else if (event === 'singleAction' && action === 'hideForm') {
      handleHideForm();
    } else if (event === 'singleAction' && action === 'reloadForm') {
      handleReloadForm();
    }
  };

  return (
    <div className="card">
      <Row>
        <Col span={24}>
          <AttributeList
            loadingAddMoreItem={loadingAddMoreItem}
            moreItemListData={moreItemListData}
            setMoreItemListData={setMoreItemListData}
            handleCallbackFunc={handleCallbackFunc}
          />

          <div className="delivery-schedule-action">
            <AttributeFormController
              entity={entity}
              entityIndex={entityIndex}
              reloadForm={reloadForm}
              isShowForm={isShowForm}
              moreItemListData={moreItemListData}
              setMoreItemListData={setMoreItemListData}
              handleCallbackFunc={handleCallbackFunc}
            />

            <button
              type="button"
              className="btn btn-sm btn-primary me-3 mb-2 mt-2"
              onClick={() => handleShowForm()}
            >
              <KTIcon iconName="plus" className="fs-2" />{' '}
              {t('Add Item Attribute')}
            </button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AttributeListController;
