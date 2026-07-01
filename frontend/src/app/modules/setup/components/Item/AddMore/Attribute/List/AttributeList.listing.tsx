import React, { FC } from 'react';
import { Table } from 'antd';
import { AttributeAction } from '../Actions/Attribute.actions';
import ListMoreItemAction from 'src/app/components/Actions/ListMoreItemAction';
import { useLang } from 'src/app/hooks/useLang';

const AttributeList: FC<any> = (props) => {
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
      dataIndex: 'attribute_name',
      key: 'attribute_name',
      title: t('Attribute Name'),
      width: '25%',
    },
    {
      dataIndex: 'attribute_value_name',
      key: 'attribute_value_name',
      title: t('Attribute Value'),
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
          actionList={AttributeAction.LIST_ITEM_ACTION}
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

export default AttributeList;
