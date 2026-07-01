import React, { useEffect } from "react";
import { Empty, Select, Spin } from "antd";
import { SelectProps } from "antd/lib/select";
import { useItemModelList } from "../../hooks/lists/useItemModelList";

interface Props extends SelectProps {
    itemModelId: any;
    placeholder?: string;
    selectType?: string;
    allowClear?: boolean;

    onLoad?: (value: any) => void;
    onChange?: (value: any, option: any) => void;
    onSelect?: (value: any, option: any) => void;
}

const ItemModelSelect: React.FC<Props> = (props) => {
    const { Option } = Select;
    const { itemModelId } = props;

    const { itemModelList, loadingItemModelList } = useItemModelList();

    useEffect(() => {
        if (itemModelId && itemModelList.length) {
            if (props.onLoad) {
                props.onLoad(itemModelId);
            }
        }
    }, [itemModelId, itemModelList, props]);

    const handleOnChanged = (value: any, option: any) => {
        if (props.onChange) {
            props.onChange(value, option);
        }
    };

    const handleOnSelect = (value: any, option: any) => {
        if (props.onSelect) {
            props.onSelect(value, option);
        }
    }

    return (
        <Select
            {...props}
            allowClear={props.allowClear || false}
            showSearch
            placeholder={props.placeholder || "-- Select --"}
            value={itemModelId}
            notFoundContent={loadingItemModelList ? <Spin size="small" /> : <Empty />}
            onChange={(value, option) => handleOnChanged(value, option)}
            onSelect={(value, option) => handleOnSelect(value, option)}
            loading={loadingItemModelList}
            optionFilterProp="children"
            filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
        >
            {itemModelList && itemModelList.map((item: any, index: any) => {
                return (
                    <Option key={`itemModel-${index}`} value={item.id}>
                        {item.name}
                    </Option>
                );
            })}
        </Select>
    );
};

export default ItemModelSelect;
