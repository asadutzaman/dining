import { useState, useEffect } from "react";
import { OrganizationApi } from "../../api";

export const useOrganizationList = () => {
    // USED STATES
    const [organizationList, setOrganizationList] = useState<any>([]);
    const [loadingOrganizationList, setLoadingOrganizationList] = useState<boolean>(false);

    useEffect(() => {
        loadOrganizationList();
    }, []);

    const loadOrganizationList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingOrganizationList(true);
            const payload = {
                $select: "id,name_en,status",
                $orderby: "sort_order asc",
            };
            OrganizationApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setOrganizationList(list);
                    }
                    setLoadingOrganizationList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingOrganizationList(false);
                    reject(err);
                });
        });
    };

    const getOrganizationById = (id: any) => {
        if (!organizationList) {
            return;
        }
        return organizationList.find((item: any) => item.id === Number(id));
    };

    const setOrganizationFormFieldValue = (formRef: any, key: any, value: any) => {
        if (organizationList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        loadingOrganizationList,
        organizationList,
        setOrganizationFormFieldValue,
        getOrganizationById
    };
};
