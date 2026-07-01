import React, { useEffect } from "react";
import { Empty, Select, Spin } from "antd";
import { SelectProps } from "antd/lib/select";
import { useAuthorList } from "../../hooks/lists/useAuthorList";

interface Props extends SelectProps {
    authorId: any;
    placeholder?: string;
    selectType?: string;
    allowClear?: boolean;

    onLoad?: (value: any) => void;
    onChange?: (value: any, option: any) => void;
    onSelect?: (value: any, option: any) => void;
}

const AuthorSelect: React.FC<Props> = (props) => {
    const { Option } = Select;
    const { authorId } = props;

    const { authorList, loadingAuthorList } = useAuthorList();

    useEffect(() => {
        if (authorId && authorList.length) {
            if (props.onLoad) {
                props.onLoad(authorId);
            }
        }
    }, [authorId, authorList, props]);

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
            value={authorId}
            notFoundContent={loadingAuthorList ? <Spin size="small" /> : <Empty />}
            onChange={(value, option) => handleOnChanged(value, option)}
            onSelect={(value, option) => handleOnSelect(value, option)}
            loading={loadingAuthorList}
            optionFilterProp="children"
            filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
        >
            {authorList && authorList.map((item: any, index: any) => {
                return (
                    <Option key={`author-${index}`} value={item.id}>
                        {item.name}
                    </Option>
                );
            })}
        </Select>
    );
};

export default AuthorSelect;
