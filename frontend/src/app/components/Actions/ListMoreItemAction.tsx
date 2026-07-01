import React, { FC } from 'react'
import ItemMoreAction from "./ItemMoreAction";

interface IProps {
    entityIndex: any,
    actionList: any,
    handleCallbackFunc?: (event: any, action: string, recordId?: any, data?: any) => void,
}

const ListMoreItemAction: FC<IProps> = props => {
    const { entityIndex, actionList, handleCallbackFunc } = props;

    const gridColumnActionDropDownList = (
        actionList.map((item: any, index: any) => {
            return (
                <ItemMoreAction key={`more-item-${index}`} entityIndex={entityIndex} actionItem={item} component={item.component} handleCallbackFunc={handleCallbackFunc} />
            );
        })
    );

    return (
        <div className='d-flex justify-content-start flex-shrink-0'>
            {gridColumnActionDropDownList}
        </div>
    );
}

export default ListMoreItemAction;