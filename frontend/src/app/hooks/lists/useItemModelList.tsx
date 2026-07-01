import { useState, useEffect } from "react";
import { ItemModelApi } from "../../api";

export const useItemModelList = () => {
    // USED STATES
    const [itemModelList, setItemModelList] = useState<any>([]);
    const [activeItemModelList, setActiveItemModelList] = useState<any>([]);
    const [loadingItemModelList, setLoadingItemModelList] = useState<boolean>(false);

    useEffect(() => {
        loadItemModelList();
    }, []);

    const loadItemModelList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingItemModelList(true);
            const payload = {
                $select: "id,name,status",
                $orderby: "sort_order asc",
            };
            ItemModelApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setItemModelList(list);
                        const activeItemModels = list.filter((item: any) => item.status === 1);
                        setActiveItemModelList(activeItemModels);
                    }
                    setLoadingItemModelList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingItemModelList(false);
                    reject(err);
                });
        });
    };

    const getItemModelById = (id: any) => {
        if (!itemModelList) {
            return;
        }
        return itemModelList.find((item: any) => item.id === Number(id));
    };

    const setItemModelFormFieldValue = (formRef: any, key: any, value: any) => {
        if (itemModelList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        loadingItemModelList,
        itemModelList,
        activeItemModelList,
        setItemModelFormFieldValue,
        getItemModelById
    };
};
