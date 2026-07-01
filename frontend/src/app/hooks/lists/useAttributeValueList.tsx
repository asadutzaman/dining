import { useState, useEffect } from "react";
import { AttributeValueApi } from "src/app/api";

export const useAttributeValueList = () => {
    // USED STATES
    const [attributeValueList, setAttributeValueList] = useState<any>([]);
    const [loadingAttributeValueList, setLoadingAttributeValueList] = useState<boolean>(false);
    const [filteredAttributeValueList, setFilteredAttributeValueList] = useState<any>([]);
    const [disabledAttributeValueList, setDisabledAttributeValueList] = useState<boolean>(true);

    useEffect(() => {
        loadAttributeValueList();
    }, []);

    const loadAttributeValueList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingAttributeValueList(true);
            const payload = {
                $select: "id,value,attribute_id,status",
                $orderby: "sort_order asc",
            };
            AttributeValueApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setAttributeValueList(list);
                    }
                    setLoadingAttributeValueList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingAttributeValueList(false);
                    reject(err);
                });
        });
    };

    const getAttributeValueById = (id: any) => {
        if (!attributeValueList) {
            return;
        }
        return attributeValueList.find((item: any) => item.id === Number(id));
    };

    const loadAttributeValueListByAttributeId = (attributeId: any) => {
        if (attributeValueList.length == 0) {
            loadAttributeValueList().then((res) => {
                if (attributeId) {
                    const filteredList = res.results.filter((item: any) => item.attribute_id === attributeId);
                    setFilteredAttributeValueList(filteredList);
                    setDisabledAttributeValueList(false);
                }
            })
        } else {
            if (attributeId) {
                const filteredList = attributeValueList.filter((item: any) => item.attribute_id === attributeId);
                setFilteredAttributeValueList(filteredList);
                setDisabledAttributeValueList(false);
            }
        }
    };

    const setAttributeValueFormFieldValue = (formRef: any, key: any, value: any) => {
        if (attributeValueList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        attributeValueList,
        loadingAttributeValueList,
        filteredAttributeValueList,
        loadAttributeValueListByAttributeId,
        setAttributeValueFormFieldValue,
        getAttributeValueById,
        disabledAttributeValueList,
        setDisabledAttributeValueList
    };
};
