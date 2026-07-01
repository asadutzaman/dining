import React, {FC} from 'react'
import {PlusOutlined} from "@ant-design/icons";
import {Button} from "antd";
import HeaderParameterAddMoreItem from "./HeaderParameter.addMore.item";

const initialState  = {
    addMoreItem: { "id": null,  "field_key": null, "field_value": null },
    isNewRecord: true,
    loading: false,
}

const HeaderParameterAddMore: FC<any> = props => {
    const { automationSetupData, addMoreItemList, setAddMoreItemList } = props;

    const handleAddMoreItemInsert = () => {
        setAddMoreItemList(
            prevState => {
                const addMoreItem =  {...initialState.addMoreItem};
                return [...prevState, addMoreItem]
            }
        );
    }

    const handleAddMoreItemEdit = (name: string, value: any, index: any) => {
        setAddMoreItemList(addMoreItemList => {
            addMoreItemList[index][name] = value;
            return [...addMoreItemList];
        })
    }

    const handleAddMoreItemDelete = (itemIndex: any) => {
        const filterAddMoreItemList = addMoreItemList.filter((item, index) => index !== itemIndex)
        setAddMoreItemList(filterAddMoreItemList);
    }

    return (
        <div className="trigger-condition-wrapper">
            <table className="table" cellPadding={5}>
                { addMoreItemList.length > 0 && (
                   <>
                       <thead>
                           <tr>
                               <th>Key</th>
                               <th>Value</th>
                               <th>&nbsp;</th>
                           </tr>
                       </thead>
                       <tbody>
                           {addMoreItemList.map((item, index) => <HeaderParameterAddMoreItem
                               key={`add-more-header-parameter-item-${index}`}
                               addMoreItemIndex={index}
                               addMoreItem={item}
                               automationSetupData={automationSetupData}
                               handleAddMoreItemEdit={handleAddMoreItemEdit}
                               handleAddMoreItemDelete={handleAddMoreItemDelete}
                           />)}
                       </tbody>
                   </>
                )}
                <tfoot>
                    <tr>
                        <td colSpan={5}>
                            <div className="submit-btn">
                                <Button type="primary" className="btn btn-add-new" onClick={() => handleAddMoreItemInsert()}><PlusOutlined />Add</Button>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

export default React.memo(HeaderParameterAddMore);