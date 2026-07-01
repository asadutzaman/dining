import React, { useEffect } from "react";
import { Empty, Select, Spin } from "antd";
import { SelectProps } from "antd/lib/select";
import { useLogisticList } from "../../hooks/lists/useLogisticList";

interface Props extends SelectProps {
    logisticId: any;
    placeholder?: string;
    selectType?: string;
    allowClear?: boolean;

    onLoad?: (value: any) => void;
    onChange?: (value: any, option: any) => void;
    onSelect?: (value: any, option: any) => void;
}

const LogisticSelect: React.FC<Props> = (props) => {
    const { Option } = Select;
    const { logisticId } = props;

    const { logisticList, loadingLogisticList } = useLogisticList();

    useEffect(() => {
        if (logisticId && logisticList.length) {
            if (props.onLoad) {
                props.onLoad(logisticId);
            }
        }
    }, [logisticId, logisticList, props]);

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
            value={logisticId}
            notFoundContent={loadingLogisticList ? <Spin size="small" /> : <Empty />}
            onChange={(value, option) => handleOnChanged(value, option)}
            onSelect={(value, option) => handleOnSelect(value, option)}
            loading={loadingLogisticList}
            optionFilterProp="children"
            filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
        >
            {logisticList && logisticList.map((item: any, index: any) => {
                return (
                    <Option key={`logistic-${index}`} value={item.id}>
                        {item.name}
                    </Option>
                );
            })}
        </Select>
    );
};

export default LogisticSelect;
