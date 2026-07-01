import React, { FC, useEffect, useState } from 'react';
import { Col, Row, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import UserActionAddMoreItemListing from './UserActionAddMoreItemList.listing';
import { AntModal } from 'src/app/utils';
import UserActionAddMoreItemFormController from '../Form/UserActionAddMoreItemForm.controller';
import { useLang } from 'src/app/hooks/useLang';

interface IProps {
  itemData: any;
  addMoreItemList: any;
  setAddMoreItemList: any;
  [key: string]: any;
}

const initialState = {
  entity: {},
  entityIndex: null,
};

const UserActionAddMoreItemListController: FC<IProps> = (props) => {
  const {
    itemData,
    workflowStepSetupData,
    addMoreItemList,
    setAddMoreItemList,
  } = props;
  const [entity, setEntity] = useState(initialState.entity);
  const [entityIndex, setEntityIndex] = useState(initialState.entityIndex);
  const [isShowForm, setIsShowForm] = useState(false);
  const [reloadForm, setReloadForm] = useState<number>(Date.now());
  const [loadingAddMoreItem, setLoadingAddMoreItem] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    loadData();
  }, [itemData]);

  const loadData = (): void => {
    // setLoadingAddMoreItem(true);
  };

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
      const filteredItems = addMoreItemList.filter(
        (item, index) => index !== itemIndex
      );
      setAddMoreItemList(filteredItems);
    }
  };

  const handleActions = (action: string, entityIndex?: any) => {
    const record = addMoreItemList[entityIndex];
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
        'Delete Papers To Be Attached',
        'Are you sure you want to delete this Papers To Be Attached?',
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

  function handleClickAddUserAction() {
    handleCallbackFunc(null, 'add');
    setEntityIndex(null);
    setIsShowForm(true);
    handleReloadForm();
  }

  return (
    <div className="add-more-container add-more-papers-to-be-attached-container">
      <Row>
        <Col span={24}>
          {addMoreItemList?.length > 0 && (
            <UserActionAddMoreItemListing
              loadingAddMoreItem={loadingAddMoreItem}
              addMoreItemList={addMoreItemList}
              workflowStepSetupData={workflowStepSetupData}
              handleCallbackFunc={handleCallbackFunc}
              stepLists={props.stepLists}
            />
          )}
          <div className="add-more-action">
            <UserActionAddMoreItemFormController
              entity={entity}
              entityIndex={entityIndex}
              reloadForm={reloadForm}
              isShowForm={isShowForm}
              workflowStepSetupData={workflowStepSetupData}
              addMoreItemList={addMoreItemList}
              setAddMoreItemList={setAddMoreItemList}
              handleCallbackFunc={handleCallbackFunc}
              stepLists={props.stepLists}
            />

            <Button
              type="default"
              className="mt-2 border-primary"
              onClick={() => handleClickAddUserAction()}
            >
              <PlusOutlined />
              {t('Add Action')}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default UserActionAddMoreItemListController;
