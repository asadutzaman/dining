import { useState, useEffect } from "react";
import { UserApi } from "../../api";

export const useUserList = () => {
    // USED STATES
    const [userList, setUserList] = useState<any>([]);
    const [activeUserList, setActiveUserList] = useState<any>([]);
    const [loadingUserList, setLoadingUserList] = useState<boolean>(false);

    useEffect(() => {
        loadUserList();
    }, []);

    const loadUserList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingUserList(true);
            const payload = {
                $select: "id,name,designation_id,department_id,status",
                $filter: "id!=1",
                $orderby: "id asc",
            };
            UserApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setUserList(list);
                        const activeUsers = list.filter((item: any) => item.status === 1);
                        setActiveUserList(activeUsers);
                    }
                    setLoadingUserList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingUserList(false);
                    reject(err);
                });
        });
    };

    const getUserById = (id: any) => {
        if (!userList) {
            return;
        }
        return userList.find((item: any) => item.id === Number(id));
    };

    const setUserFormFieldValue = (formRef: any, key: any, value: any) => {
        if (userList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        loadingUserList,
        userList,
        activeUserList,
        setUserFormFieldValue,
        getUserById
    };
};
