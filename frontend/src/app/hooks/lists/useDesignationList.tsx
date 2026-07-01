import { useState, useEffect } from "react";
import { DesignationApi } from "../../api";

export const useDesignationList = () => {
    // USED STATES
    const [designationList, setDesignationList] = useState<any>([]);
    const [activeDesignationList, setActiveDesignationList] = useState<any>([]);
    const [loadingDesignationList, setLoadingDesignationList] = useState<boolean>(false);

    useEffect(() => {
        loadDesignationList();
    }, []);

    const loadDesignationList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingDesignationList(true);
            const payload = {
                $select: "id,title,grade,status",
                $orderby: "sort_order asc",
            };
            DesignationApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setDesignationList(list);
                        const activeDesignations = list.filter((item: any) => item.status === 1);
                        setActiveDesignationList(activeDesignations);
                    }
                    setLoadingDesignationList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingDesignationList(false);
                    reject(err);
                });
        });
    };

    const getDesignationById = (id: any) => {
        if (!designationList) {
            return;
        }
        return designationList.find((item: any) => item.id === Number(id));
    };

    const setDesignationFormFieldValue = (formRef: any, key: any, value: any) => {
        if (designationList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        loadingDesignationList,
        designationList,
        activeDesignationList,
        setDesignationFormFieldValue,
        getDesignationById
    };
};
