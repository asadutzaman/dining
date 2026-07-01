import React, { useEffect } from "react";
import { Empty, Select, Spin } from "antd";
import { SelectProps } from "antd/lib/select";
import { useOrganogramList } from "../../hooks/lists/useOrganogramList";

interface Props extends SelectProps {
    organogramId: any;
    organizationId: any;
    placeholder?: string;

    onLoad?: (value: any) => void;
    onChange?: (value: any, option: any) => void;
    onSelect?: (value: any, option: any) => void;
}

const OrganogramSelect: React.FC<Props> = (props) => {
    const { Option } = Select;
    const { organogramId, organizationId } = props;

    const {
        loadingOrganogramList,
        disabledOrganogramList,
        setDisabledOrganogramList,
        loadOrganogramListByOrganizationId,
        filteredOrganogramList,
    } = useOrganogramList();

    useEffect(() => {
        if (organizationId) {
            setDisabledOrganogramList(false);
            loadOrganogramListByOrganizationId(organizationId);
        }
    }, [organogramId, organizationId]);

    useEffect(() => {
        if (organogramId && filteredOrganogramList.length) {
            if (props.onLoad) {
                props.onLoad(organogramId);
            }
        }
    }, [organogramId, filteredOrganogramList.length, props]);

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
            value={organogramId}
            notFoundContent={loadingOrganogramList ? <Spin size="small" /> : <Empty />}
            onChange={(value, option) => handleOnChanged(value, option)}
            onSelect={(value, option) => handleOnSelect(value, option)}
            loading={loadingOrganogramList}
            disabled={disabledOrganogramList}
            optionFilterProp="children"
            filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
        >
            {filteredOrganogramList && filteredOrganogramList.map((item: any, index: any) => {
                return (
                    <Option key={`organogram-${index}`} value={item.id}>
                        {item.name_en}
                    </Option>
                );
            })}
        </Select>
    );
};

export default OrganogramSelect;
