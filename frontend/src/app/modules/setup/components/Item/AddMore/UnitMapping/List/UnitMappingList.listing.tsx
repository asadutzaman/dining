import React, { FC } from 'react';
import { Table } from 'antd';
import { UnitMappingAction } from '../Actions/UnitMapping.actions';
import ListMoreItemAction from 'src/app/components/Actions/ListMoreItemAction';
import { useLang } from 'src/app/hooks/useLang';

const UnitMappingList: FC<any> = (props) => {
  const { loadingAddMoreItem, moreItemListData, handleCallbackFunc } = props;
  const { t } = useLang();

  const columns = [
    {
      dataIndex: 'sn',
      key: 'sn',
      title: t('SN'),
      width: '5%',
      render: (text: string, record: any, index: number) => {
        return index + 1;
      },
    },
    {
      dataIndex: 'unit_name',
      key: 'unit_name',
      title: t('Unit Name'),
      width: '25%',
    },
    {
      dataIndex: 'conversion_to_base',
      key: 'conversion_to_base',
      title: t('Conversion to Base Unit'),
      width: '50%',
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: t('Action'),
      width: '10%',
      render: (text: string, record: any, index: number) => (
        <ListMoreItemAction
          entityIndex={index}
          actionList={UnitMappingAction.LIST_ITEM_ACTION}
          handleCallbackFunc={handleCallbackFunc}
        />
      ),
    },
  ];

  return (
    <Table
      className="table-layout"
      // rowKey={(record, index) => index === undefined ? Math.random().toString() : index.toString()}
      rowClassName={(record, index) => (index % 2 === 0 ? 'odd' : 'even')}
      dataSource={moreItemListData}
      columns={columns}
      pagination={false}
      loading={loadingAddMoreItem}
      bordered={false}
    />
  );
};

export default UnitMappingList;
