import React, { FC, useEffect } from 'react';
import { KTIcon } from 'src/_metronic/helpers';
import { Button, DatePicker, Form, Input, InputNumber } from 'antd';
// import {ShelveSelect} from 'src/app/components/Dropdown'
import { rules } from 'src/app/components/Validation/Form.validate';
import { useLang } from 'src/app/hooks/useLang';

const GoodsReceiveNoteItemAddMoreItem: FC<any> = (props) => {
  const {
    addMoreItemIndex,
    addMoreItem,
    handleAddMoreItemEdit,
    handleAddMoreItemDelete,
  } = props;
  const { t } = useLang();

  useEffect(() => {
    if (addMoreItem.field) {
      handleOnChangeConditionField(addMoreItem.field, addMoreItemIndex);
    }
  }, [addMoreItem.field]);

  const handleOnChangeConditionField = (value: any, index: any) => {
    handleAddMoreItemEdit('field', value, addMoreItemIndex);
  };

  return (
    <tr>
      <td>{addMoreItemIndex + 1}</td>
      <td>{addMoreItem.name}</td>
      {/* <td>
        <Form.Item label={''} name='shelve_id'>
          <ShelveSelect
            shelveId={addMoreItem.shelve_id}
            placeholder={'Select Shelve'}
            style={{width: '100%'}}
            onSelect={(value, option) => {
              handleAddMoreItemEdit('shelve_id', value, addMoreItemIndex)
            }}
            onLoad={(value) => {
              handleAddMoreItemEdit('shelve_id', value, addMoreItemIndex)
            }}
          />
        </Form.Item>
      </td> */}
      <td>
        <Form.Item className="mb-0">
          <InputNumber
            min={0}
            value={addMoreItem.quantity}
            onChange={(value) =>
              handleAddMoreItemEdit('quantity', value, addMoreItemIndex)
            }
            style={{ width: '100%' }}
          />
        </Form.Item>
      </td>
      <td>
        <Form.Item className="mb-0">
          <DatePicker
            placeholder={t('Select Date')}
            value={addMoreItem.expire_date}
            onChange={(value) =>
              handleAddMoreItemEdit('expire_date', value, addMoreItemIndex)
            }
          />
        </Form.Item>
      </td>
      <td>
        <Form.Item className="mb-0">
          <Input
            value={addMoreItem.remarks}
            onChange={(e) =>
              handleAddMoreItemEdit('remarks', e.target.value, addMoreItemIndex)
            }
          />
        </Form.Item>
      </td>
      <td>
        <Button
          className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mt-1"
          onClick={() => handleAddMoreItemDelete(addMoreItemIndex)}
        >
          <KTIcon iconName="trash" className="fs-3" />
        </Button>
      </td>
    </tr>
  );
};

export default React.memo(GoodsReceiveNoteItemAddMoreItem);
