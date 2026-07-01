import React, { useEffect } from "react";
import { Empty, Select, Spin } from "antd";
import { SelectProps } from "antd/lib/select";
import { usePublisherList } from "../../hooks/lists/usePublisherList";

interface Props extends SelectProps {
    publisherId: any;
    placeholder?: string;
    selectType?: string;
    allowClear?: boolean;

    onLoad?: (value: any) => void;
    onChange?: (value: any, option: any) => void;
    onSelect?: (value: any, option: any) => void;
}

const PublisherSelect: React.FC<Props> = (props) => {
    const { Option } = Select;
    const { publisherId } = props;

    const { publisherList, loadingPublisherList } = usePublisherList();

    useEffect(() => {
        if (publisherId && publisherList.length) {
            if (props.onLoad) {
                props.onLoad(publisherId);
            }
        }
    }, [publisherId, publisherList, props]);

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
            value={publisherId}
            notFoundContent={loadingPublisherList ? <Spin size="small" /> : <Empty />}
            onChange={(value, option) => handleOnChanged(value, option)}
            onSelect={(value, option) => handleOnSelect(value, option)}
            loading={loadingPublisherList}
            optionFilterProp="children"
            filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
        >
            {publisherList && publisherList.map((item: any, index: any) => {
                return (
                    <Option key={`publisher-${index}`} value={item.id}>
                        {item.name}
                    </Option>
                );
            })}
        </Select>
    );
};

export default PublisherSelect;
