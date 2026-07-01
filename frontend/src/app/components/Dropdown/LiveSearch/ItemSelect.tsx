import React, { useEffect } from "react";
import { Empty, Select, Spin } from "antd";
import { SelectProps } from "antd";
import { useItemList } from "../../../hooks/liveSearchData/useItemList";

interface Props extends SelectProps {
    itemNameCode: any;
    logisticId?: number;
    placeholder?: string;

    onLoad?: (value: any) => void;
    onChange?: (value: any, option: any) => void;
    onSelect?: (value: any, option: any) => void;
}

const ItemSelect: React.FC<Props> = (props) => {
    const { Option } = Select;
    const { itemNameCode, logisticId } = props;

    const { loadingItemList, setLoadingItemList, itemList, setItemList, searchItem } = useItemList();

    useEffect(() => {
        if (itemNameCode) {
            if (props.onLoad) {
                props.onLoad(itemNameCode);
            }
        }
    }, [itemNameCode, logisticId, props]);

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


    const handleSearch = (searchValue: string, logisticId?: number) => {

        if (searchValue.length >= 3) { //8
            setLoadingItemList(true);
            setItemList([]);
            searchItem(searchValue, logisticId);

        }
    };

    return (
        <Select
            {...props}
            allowClear={true}
            showSearch
            placeholder={props.placeholder || "-- Search --"}
            value={itemNameCode}
            onSearch={(value) => handleSearch(value, logisticId)}
            style={props.style}
            defaultActiveFirstOption={false}
            suffixIcon={null}
            filterOption={false}
            // onSearch={handleSearch}
            onChange={(value, option) => handleOnChanged(value, option)}
            onSelect={(value, option) => handleOnSelect(value, option)}
            loading={loadingItemList}
            notFoundContent={loadingItemList ? <Spin size="small" /> : <Empty />}
            options={(itemList || []).map((item) => ({
                value: item.value,
                label: item.text,
                itemData: item.itemData,
            }))}
        />
    );
};

export default ItemSelect;
