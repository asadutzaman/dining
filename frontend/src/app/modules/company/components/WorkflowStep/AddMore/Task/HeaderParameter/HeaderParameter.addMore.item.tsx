import React, {FC} from 'react'
import {Input, Button} from 'antd';
import {CloseOutlined} from "@ant-design/icons";

const HeaderParameterAddMoreItem: FC<any> = props => {
    const { addMoreItemIndex, addMoreItem, handleAddMoreItemEdit, handleAddMoreItemDelete } = props;
    return (
        <tr>
            <td className="td-key">
              <Input value={addMoreItem.field_key} onChange={(event) => handleAddMoreItemEdit('field_key', event.target.value, addMoreItemIndex)} />
            </td>
            <td className="td-value">
              <Input value={addMoreItem.field_value} onChange={(event) => handleAddMoreItemEdit('field_value', event.target.value, addMoreItemIndex)} />
            </td>
            <td className="td-actions">
                <Button danger className="btn btn-delete" onClick={() => handleAddMoreItemDelete(addMoreItemIndex)}><CloseOutlined />Delete</Button>
            </td>
        </tr>
    );
}

export default React.memo(HeaderParameterAddMoreItem);
