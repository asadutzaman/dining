import { Spin, Tabs } from "antd";
import React, { FC, useEffect, useState } from "react";
import { usePermissionContext } from "../../hooks/context/usePermissionContext";

interface IProps {
    activeTabIndex: string,
    viewTabListData: any,
    onChangeHandler?: any,
}

const ViewTabList: FC<IProps> = props => {
    const { activeTabIndex, viewTabListData, onChangeHandler } = props;

    const [filterTabList, setFilterTabList] = useState<any>([]);
    const { isPermissionLoaded, hasPermission } = usePermissionContext();

    useEffect(() => {
        if (isPermissionLoaded) {
            const list = viewTabListData.filter((item: any) => {
                return hasPermission(item?.permission)
            })
            setFilterTabList(list);
        }
    }, [isPermissionLoaded]);

    return (
        <Tabs
            onChange={onChangeHandler}
            defaultActiveKey={activeTabIndex}
            type="card"
            items={filterTabList.length && filterTabList.map((viewTab: any, index: any) => {
                return {
                    label: viewTab.label,
                    key: viewTab.tabIndex,
                    children: viewTab.component,
                };
            })}
        />
    )
}

export default ViewTabList;