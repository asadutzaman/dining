import React, { useEffect } from "react";
import { Empty, Select, Spin } from "antd";
import { SelectProps } from "antd/lib/select";
import { useUnitList } from "../../hooks/lists/useUnitList";

interface Props extends SelectProps {
    unitId: any;
    placeholder?: string;
    selectType?: string;
    allowClear?: boolean;

    onLoad?: (value: any) => void;
    onChange?: (value: any, option: any) => void;
    onSelect?: (value: any, option: any) => void;
}

const UnitSelect: React.FC<Props> = (props) => {
    const { Option } = Select;
    const { unitId } = props;

    const { unitList, loadingUnitList } = useUnitList();

    useEffect(() => {
        if (unitId && unitList.length) {
            if (props.onLoad) {
                props.onLoad(unitId);
            }
        }
    }, [unitId, unitList, props]);

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
            value={unitId}
            notFoundContent={loadingUnitList ? <Spin size="small" /> : <Empty />}
            onChange={(value, option) => handleOnChanged(value, option)}
            onSelect={(value, option) => handleOnSelect(value, option)}
            loading={loadingUnitList}
            optionFilterProp="children"
            filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
        >
            {unitList && unitList.map((item: any, index: any) => {
                return (
                    <Option key={`unit-${index}`} value={item.id}>
                        {item.name}
                    </Option>
                );
            })}
        </Select>
    );
};

export default UnitSelect;