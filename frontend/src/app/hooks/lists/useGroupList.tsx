import { useState, useEffect } from "react";
import { GroupApi } from "../../api";

export const useGroupList = () => {
    // USED STATES
    const [groupList, setGroupList] = useState<any>([]);
    const [loadingGroupList, setLoadingGroupList] = useState<boolean>(false);

    useEffect(() => {
        loadGroupList();
    }, []);

    const loadGroupList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingGroupList(true);
            const payload = {
                $select: "id,name,code,status",
                $orderby: "name asc",
            };
            GroupApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setGroupList(list);
                    }
                    setLoadingGroupList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingGroupList(false);
                    reject(err);
                });
        });
    };

    const getGroupById = (id: any) => {
        if (!groupList) {
            return;
        }
        return groupList.find((item: any) => item.id === Number(id));
    };

    const setGroupFormFieldValue = (formRef: any, key: any, value: any) => {
        if (groupList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        loadingGroupList,
        groupList,
        setGroupFormFieldValue,
        getGroupById
    };
};
