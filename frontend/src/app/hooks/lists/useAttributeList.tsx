import { useState, useEffect } from "react";
import { AttributeApi } from "src/app/api";

export const useAttributeList = () => {
    // USED STATES
    const [attributeList, setAttributeList] = useState<any>([]);
    const [loadingAttributeList, setLoadingAttributeList] = useState<boolean>(false);

    useEffect(() => {
        loadAttributeList();
    }, []);

    const loadAttributeList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingAttributeList(true);
            const payload = {
                $select: "id,name,status",
                $orderby: "sort_order asc",
            };
            AttributeApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setAttributeList(list);
                    }
                    setLoadingAttributeList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingAttributeList(false);
                    reject(err);
                });
        });
    };

    const getAttributeById = (id: any) => {
        if (!attributeList) {
            return;
        }
        return attributeList.find((item: any) => item.id === Number(id));
    };

    const setAttributeFormFieldValue = (formRef: any, key: any, value: any) => {
        if (attributeList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        loadingAttributeList,
        attributeList,
        setAttributeFormFieldValue,
        getAttributeById
    };
};
