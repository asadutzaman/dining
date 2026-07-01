import React, { useEffect } from "react";
import { Empty, Select, Spin } from "antd";
import { SelectProps } from "antd/lib/select";
import { useShelveList } from "src/app/hooks/lists/useShelveList"; // Import useShelveList

interface Props extends SelectProps {
    shelveId: any; // Changed from brandId to shelveId
    placeholder?: string;

    onLoad?: (value: any) => void;
    onChange?: (value: any, option: any) => void;
    onSelect?: (value: any, option: any) => void;
}

const ShelveSelect: React.FC<Props> = (props) => {
    const { Option } = Select;
    const { shelveId } = props; // Changed from brandId to shelveId

    const {
        loadingShelveList, // Changed from loadingBrandList to loadingShelveList
        shelveList, // Changed from brandList to shelveList
    } = useShelveList(); // Use useShelveList

    useEffect(() => {
        if (shelveId && shelveList.length) { // Changed from brandId to shelveId, brandList to shelveList
            if (props.onLoad) {
                props.onLoad(shelveId); // Changed from brandId to shelveId
            }
        }
    }, [shelveId, shelveList.length, props]); // Changed dependencies

    const handleOnChanged = (value: any, option: any) => {
        if (props.onChange) {
            props.onChange(value, option);
        }
    };

    const handleOnSelect = (value: any, option: any) => {
        if (props.onSelect) {
            props.onSelect(value, option);
        }
    };

    return (
        <Select
            {...props}
            allowClear={true}
            showSearch
            placeholder={props.placeholder || "-- Select --"}
            value={shelveId} // Changed from brandId to shelveId
            notFoundContent={loadingShelveList ? <Spin size="small" /> : <Empty />} // Changed from loadingBrandList to loadingShelveList
            onChange={(value, option) => handleOnChanged(value, option)}
            onSelect={(value, option) => handleOnSelect(value, option)}
            loading={loadingShelveList} // Changed from loadingBrandList to loadingShelveList
            optionFilterProp="children"
            filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
        >
            {shelveList && shelveList.map((item: any, index: any) => { // Changed from brandList to shelveList
                return (
                    <Option key={`shelve-${index}`} value={item.id}>
                        {item.name}
                    </Option>
                );
            })}
        </Select>
    );
};

export default ShelveSelect;
