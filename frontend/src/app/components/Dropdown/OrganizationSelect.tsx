import React, { useEffect } from "react";
import { Empty, Select, Spin } from "antd";
import { SelectProps } from "antd/lib/select";
import { useOrganizationList } from "../../hooks/lists/useOrganizationList";

interface Props extends SelectProps {
    organizationId: any;
    placeholder?: string;
    selectType?: string;

    onLoad?: (value: any) => void;
    onChange?: (value: any, option: any) => void;
    onSelect?: (value: any, option: any) => void;
}

const OrganizationSelect: React.FC<Props> = (props) => {
    const { Option } = Select;
    const { organizationId } = props;

    const { organizationList, loadingOrganizationList } = useOrganizationList();

    useEffect(() => {
        if (organizationId && organizationList.length) {
            if (props.onLoad) {
                props.onLoad(organizationId);
            }
        }
    }, [organizationId, organizationList, props]);

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
            value={organizationId}
            notFoundContent={loadingOrganizationList ? <Spin size="small" /> : <Empty />}
            onChange={(value, option) => handleOnChanged(value, option)}
            onSelect={(value, option) => handleOnSelect(value, option)}
            loading={loadingOrganizationList}
            optionFilterProp="children"
            filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
        >
            {organizationList && organizationList.map((item: any, index: any) => {
                return (
                    <Option key={`organization-${index}`} value={item.id}>
                        {item.name_en}
                    </Option>
                );
            })}
        </Select>
    );
};

export default OrganizationSelect;
