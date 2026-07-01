import React, { useEffect } from "react";
import { Empty, Select, Spin } from "antd";
import { SelectProps } from "antd/lib/select";
import { useUserList } from "../../hooks/lists/useUserList";

interface Props extends SelectProps {
    userId: any;
    placeholder?: string;
    selectType?: string;
    allowClear?: boolean;

    onLoad?: (value: any) => void;
    onChange?: (value: any, option: any) => void;
    onSelect?: (value: any, option: any) => void;
}

const UserSelect: React.FC<Props> = (props) => {
    const { Option } = Select;
    const { userId } = props;

    const { userList, loadingUserList } = useUserList();

    useEffect(() => {
        if (userId && userList.length) {
            if (props.onLoad) {
                props.onLoad(userId);
            }
        }
    }, [userId, userList, props]);

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
            value={userId}
            notFoundContent={loadingUserList ? <Spin size="small" /> : <Empty />}
            onChange={(value, option) => handleOnChanged(value, option)}
            onSelect={(value, option) => handleOnSelect(value, option)}
            loading={loadingUserList}
            optionFilterProp="children"
            filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
        >
            {userList && userList.map((item: any, index: any) => {
                return (
                    <Option key={`user-${index}`} value={item.id}>
                        {item.name}
                    </Option>
                );
            })}
        </Select>
    );
};

export default UserSelect;
