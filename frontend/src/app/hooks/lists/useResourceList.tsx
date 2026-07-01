import { useState, useEffect } from "react";
import { ResourceApi } from "../../api";

export const useResourceList = () => {
    // USED STATES
    const [resourceList, setResourceList] = useState<any>([]);
    const [loadingResourceList, setLoadingResourceList] = useState<boolean>(false);

    useEffect(() => {
        loadResourceList();
    }, []);

    const loadResourceList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingResourceList(true);
            const payload = {
                $select: "id,display_name,name,status",
                $orderby: "sort_order asc",
            };
            ResourceApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setResourceList(list);
                    }
                    setLoadingResourceList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingResourceList(false);
                    reject(err);
                });
        });
    };

    const getResourceById = (id: any) => {
        if (!resourceList) {
            return;
        }
        return resourceList.find((item: any) => item.id === Number(id));
    };

    const setResourceFormFieldValue = (formRef: any, key: any, value: any) => {
        if (resourceList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        loadingResourceList,
        resourceList,
        setResourceFormFieldValue,
        getResourceById
    };
};
