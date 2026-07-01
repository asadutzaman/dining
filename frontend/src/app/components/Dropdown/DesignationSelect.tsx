import React, { useEffect } from "react";
import { Empty, Select, Spin } from "antd";
import { SelectProps } from "antd/lib/select";
import { useDesignationList } from "../../hooks/lists/useDesignationList";

interface Props extends SelectProps {
    designationId: any;
    placeholder?: string;
    selectType?: string;

    onLoad?: (value: any) => void;
    onChange?: (value: any, option: any) => void;
    onSelect?: (value: any, option: any) => void;
}

const DesignationSelect: React.FC<Props> = (props) => {
    const { Option } = Select;
    const { designationId } = props;

    const { designationList, loadingDesignationList } = useDesignationList();

    useEffect(() => {
        if (designationId && designationList.length) {
            if (props.onLoad) {
                props.onLoad(designationId);
            }
        }
    }, [designationId, designationList, props]);

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
            value={designationId}
            notFoundContent={loadingDesignationList ? <Spin size="small" /> : <Empty />}
            onChange={(value, option) => handleOnChanged(value, option)}
            onSelect={(value, option) => handleOnSelect(value, option)}
            loading={loadingDesignationList}
            optionFilterProp="children"
            filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
        >
            {designationList && designationList.map((item: any, index: any) => {
                return (
                    <Option key={`designation-${index}`} value={item.id}>
                        {item.title}
                    </Option>
                );
            })}
        </Select>
    );
};

export default DesignationSelect;
