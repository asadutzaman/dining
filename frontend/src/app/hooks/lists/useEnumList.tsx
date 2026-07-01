import { useState, useEffect } from "react";
import { EnumApi } from "../../api";

export const useEnumList = () => {
    // USED STATES
    const [enumList, setEnumList] = useState<any>([]);
    const [loadingEnumList, setLoadingEnumList] = useState<boolean>(false);

    useEffect(() => {
        loadEnumList();
    }, []);

    const loadEnumList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingEnumList(true);
            const payload = {
                $select: "id,type,key,value,status",
                $orderby: "type asc",
            };
            EnumApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setEnumList(list);
                    }
                    setLoadingEnumList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingEnumList(false);
                    reject(err);
                });
        });
    };

    const getEnumById = (id: any) => {
        if (!enumList) {
            return;
        }
        return enumList.find((item: any) => item.id === Number(id));
    };

    const setEnumFormFieldValue = (formRef: any, key: any, value: any) => {
        if (enumList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        loadingEnumList,
        enumList,
        setEnumFormFieldValue,
        getEnumById
    };
};
