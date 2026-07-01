import { useState, useEffect } from "react";
import { OrganogramApi } from "../../api";

export const useOrganogramList = () => {
    // USED STATES
    const [organogramList, setOrganogramList] = useState<any>([]);
    const [loadingOrganogramList, setLoadingOrganogramList] = useState<boolean>(false);
    const [filteredOrganogramList, setFilteredOrganogramList] = useState<any>([]);
    const [disabledOrganogramList, setDisabledOrganogramList] = useState<boolean>(true);

    useEffect(() => {
        loadOrganogramList();
    }, []);

    const loadOrganogramList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingOrganogramList(true);
            const payload = {
                $select: "id,name_en,organization_id,parent_id,status",
                $orderby: "sort_order asc",
            };
            OrganogramApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setOrganogramList(list);
                    }
                    setLoadingOrganogramList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingOrganogramList(false);
                    reject(err);
                });
        });
    };

    const getOrganogramById = (id: any) => {
        if (!organogramList) {
            return;
        }
        return organogramList.find((item: any) => item.id === Number(id));
    };

    const loadOrganogramListByOrganizationId = (organizationId: any) => {
        if (organogramList.length == 0) {
            loadOrganogramList().then((res) => {
                if (organizationId) {
                    const filteredList = res.results.filter((item: any) => item.organization_id === organizationId);
                    setFilteredOrganogramList(filteredList);
                    setDisabledOrganogramList(false);
                }
            })
        } else {
            if (organizationId) {
                const filteredList = organogramList.filter((item: any) => item.organization_id === organizationId);
                setFilteredOrganogramList(filteredList);
                setDisabledOrganogramList(false);
            }
        }
    };

    const setOrganogramFormFieldValue = (formRef: any, key: any, value: any) => {
        if (organogramList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        organogramList,
        loadingOrganogramList,
        filteredOrganogramList,
        loadOrganogramListByOrganizationId,
        setOrganogramFormFieldValue,
        getOrganogramById,
        disabledOrganogramList,
        setDisabledOrganogramList
    };
};
