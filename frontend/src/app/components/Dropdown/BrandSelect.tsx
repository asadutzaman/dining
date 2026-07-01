import React, { useEffect } from "react";
import { Empty, Select, Spin } from "antd";
import { SelectProps } from "antd/lib/select";
import { useBrandList } from "src/app/hooks/lists/useBradList";

interface Props extends SelectProps {
    brandId: any;
    placeholder?: string;

    onLoad?: (value: any) => void;
    onChange?: (value: any, option: any) => void;
    onSelect?: (value: any, option: any) => void;
}

const BrandSelect: React.FC<Props> = (props) => {
    const { Option } = Select;
    const { brandId } = props;

    const {
        loadingBrandList,
        brandList,
    } = useBrandList();

    useEffect(() => {
        if (brandId && brandList.length) {
            if (props.onLoad) {
                props.onLoad(brandId);
            }
        }
    }, [brandId, brandList.length, props]);

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
            value={brandId}
            notFoundContent={loadingBrandList ? <Spin size="small" /> : <Empty />}
            onChange={(value, option) => handleOnChanged(value, option)}
            onSelect={(value, option) => handleOnSelect(value, option)}
            loading={loadingBrandList}
            optionFilterProp="children"
            filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
        >
            {brandList && brandList.map((item: any, index: any) => {
                return (
                    <Option key={`brand-${index}`} value={item.id}>
                        {item.name}
                    </Option>
                );
            })}
        </Select>
    );
};

export default BrandSelect;
