import React, { useEffect } from "react";
import { Empty, Select, Spin } from "antd";
import { SelectProps } from "antd/lib/select";
import { useMemberList } from "../../hooks/lists/useMemberList";

interface Props extends SelectProps {
    memberId: any;
    placeholder?: string;
    selectType?: string;

    onLoad?: (value: any) => void;
    onChange?: (value: any, option: any) => void;
    onSelect?: (value: any, option: any) => void;
}

const MemberSelect: React.FC<Props> = (props) => {
    const { Option } = Select;
    const { memberId } = props;

    const { memberList, loadingMemberList } = useMemberList();

    useEffect(() => {
        if (memberId && memberList.length) {
            if (props.onLoad) {
                props.onLoad(memberId);
            }
        }
    }, [memberId, memberList, props]);

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
            value={memberId}
            notFoundContent={loadingMemberList ? <Spin size="small" /> : <Empty />}
            onChange={(value, option) => handleOnChanged(value, option)}
            onSelect={(value, option) => handleOnSelect(value, option)}
            loading={loadingMemberList}
            optionFilterProp="children"
            filterOption={(input, option: any) => option?.children?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0}
        >
            {memberList && memberList.map((item: any, index: any) => {
                return (
                    <Option key={`member-${index}`} value={item.id}>
                        {item.member_code} - {item.name}
                    </Option>
                );
            })}
        </Select>
    );
};

export default MemberSelect;
