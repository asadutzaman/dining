import { Button, Form, Input, InputNumber, Select } from 'antd';
import React, { FC, useEffect } from 'react'
import { KTIcon } from 'src/_metronic/helpers';

const StockTransferItemAddMoreItem: FC<any> = (props) => {
    const { Option } = Select;
    const { addMoreItemIndex, addMoreItem, handleAddMoreItemEdit, handleAddMoreItemDelete } = props;

    useEffect(() => {
        if (addMoreItem.field) {
            handleOnChangeConditionField(addMoreItem.field, addMoreItemIndex);
        }
    }, [addMoreItem.field]);

    const handleOnChangeConditionField = (value: any, index: any) => {
        handleAddMoreItemEdit('field', value, addMoreItemIndex);
    }

    return (
        <tr>
            <td>{addMoreItemIndex + 1}</td>
            <td>{addMoreItem.name}</td>
            <td>
                <Form.Item className='mb-0'>
                    <InputNumber min={0} value={addMoreItem.quantity} onChange={(value) => handleAddMoreItemEdit('quantity', value, addMoreItemIndex)} style={{ width: '100%' }} />
                </Form.Item>                
            </td>
            <td>
                <Form.Item className='mb-0'>
                    <Input value={addMoreItem.remarks} onChange={(e) => handleAddMoreItemEdit('remarks', e.target.value, addMoreItemIndex)} style={{ width: '100%' }} />
                </Form.Item>                
            </td>
            <td>
                <Button
                    className='btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mt-1'
                    onClick={() => handleAddMoreItemDelete(addMoreItemIndex)}
                >
                    <KTIcon iconName='trash' className='fs-3' />
                </Button>
            </td>
        </tr>
    )
}

export default React.memo(StockTransferItemAddMoreItem);