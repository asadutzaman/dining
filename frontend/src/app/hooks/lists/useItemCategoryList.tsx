import { useState, useEffect } from "react";
import { ItemCategoryApi } from "../../api";

export const useItemCategoryList = () => {
    // USED STATES
    const [itemCategoryList, setItemCategoryList] = useState<any>([]);
    const [activeItemCategoryList, setActiveItemCategoryList] = useState<any>([]);
    const [loadingItemCategoryList, setLoadingItemCategoryList] = useState<boolean>(false);

    useEffect(() => {
        loadItemCategoryList();
    }, []);

    const loadItemCategoryList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingItemCategoryList(true);
            const payload = {
                $select: "id,name,status",
                $orderby: "sort_order asc",
            };
            ItemCategoryApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setItemCategoryList(list);
                        const activeItemCategorys = list.filter((item: any) => item.status === 1);
                        setActiveItemCategoryList(activeItemCategorys);
                    }
                    setLoadingItemCategoryList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingItemCategoryList(false);
                    reject(err);
                });
        });
    };

    const getItemCategoryById = (id: any) => {
        if (!itemCategoryList) {
            return;
        }
        return itemCategoryList.find((item: any) => item.id === Number(id));
    };

    const setItemCategoryFormFieldValue = (formRef: any, key: any, value: any) => {
        if (itemCategoryList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        loadingItemCategoryList,
        itemCategoryList,
        activeItemCategoryList,
        setItemCategoryFormFieldValue,
        getItemCategoryById
    };
};
