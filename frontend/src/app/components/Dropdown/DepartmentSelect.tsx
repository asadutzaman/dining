import React, { useEffect } from "react";
import { Empty, Select, Spin } from "antd";
import { SelectProps } from "antd/lib/select";
import { useDepartmentList } from "../../hooks/lists/useDepartmentList";

interface Props extends SelectProps {
    departmentId: any;
    placeholder?: string;
    selectType?: string;
    allowClear?: boolean;

    onLoad?: (value: any) => void;
    onChange?: (value: any, option: any) => void;
    onSelect?: (value: any, option: any) => void;
}

const DepartmentSelect: React.FC<Props> = (props) => {
    const { Option } = Select;
    const { departmentId } = props;

    const { departmentList, loadingDepartmentList } = useDepartmentList();

    useEffect(() => {
        if (departmentId && departmentList.length) {
            if (props.onLoad) {
                props.onLoad(departmentId);
            }
        }
    }, [departmentId, departmentList, props]);

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
            value={departmentId}
            notFoundContent={loadingDepartmentList ? <Spin size="small" /> : <Empty />}
            onChange={(value, option) => handleOnChanged(value, option)}
            onSelect={(value, option) => handleOnSelect(value, option)}
            loading={loadingDepartmentList}
            optionFilterProp="children"
            filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
        >
            {departmentList && departmentList.map((item: any, index: any) => {
                return (
                    <Option key={`department-${index}`} value={item.id}>
                        {item.name}
                    </Option>
                );
            })}
        </Select>
    );
};

export default DepartmentSelect;
