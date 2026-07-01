import React, { useEffect } from "react";
import { Empty, Select, Spin } from "antd";
import { SelectProps } from "antd/lib/select";
import { useItemCategoryList } from "../../hooks/lists/useItemCategoryList";

interface Props extends SelectProps {
    itemCategoryId: any;
    placeholder?: string;
    selectType?: string;

    onLoad?: (value: any) => void;
    onChange?: (value: any, option: any) => void;
    onSelect?: (value: any, option: any) => void;
}

const ItemCategorySelect: React.FC<Props> = (props) => {
    const { Option } = Select;
    const { itemCategoryId } = props;

    const { itemCategoryList, loadingItemCategoryList } = useItemCategoryList();

    useEffect(() => {
        if (itemCategoryId && itemCategoryList.length) {
            if (props.onLoad) {
                props.onLoad(itemCategoryId);
            }
        }
    }, [itemCategoryId, itemCategoryList, props]);

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
            allowClear={true}
            showSearch
            placeholder={props.placeholder || "-- Select --"}
            value={itemCategoryId}
            notFoundContent={loadingItemCategoryList ? <Spin size="small" /> : <Empty />}
            onChange={(value, option) => handleOnChanged(value, option)}
            onSelect={(value, option) => handleOnSelect(value, option)}
            loading={loadingItemCategoryList}
            optionFilterProp="children"
            filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
        >
            {itemCategoryList && itemCategoryList.map((item: any, index: any) => {
                return (
                    <Option key={`itemCategory-${index}`} value={item.id}>
                        {item.name}
                    </Option>
                );
            })}
        </Select>
    );
};

export default ItemCategorySelect;
