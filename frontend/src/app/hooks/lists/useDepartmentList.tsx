import { useState, useEffect } from "react";
import { DepartmentApi } from "../../api";

export const useDepartmentList = () => {
    // USED STATES
    const [departmentList, setDepartmentList] = useState<any>([]);
    const [activeDepartmentList, setActiveDepartmentList] = useState<any>([]);
    const [loadingDepartmentList, setLoadingDepartmentList] = useState<boolean>(false);

    useEffect(() => {
        loadDepartmentList();
    }, []);

    const loadDepartmentList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingDepartmentList(true);
            const payload = {
                $select: "id,name,status",
                $orderby: "sort_order asc",
            };
            DepartmentApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setDepartmentList(list);
                        const activeDepartments = list.filter((item: any) => item.status === 1);
                        setActiveDepartmentList(activeDepartments);
                    }
                    setLoadingDepartmentList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingDepartmentList(false);
                    reject(err);
                });
        });
    };

    const getDepartmentById = (id: any) => {
        if (!departmentList) {
            return;
        }
        return departmentList.find((item: any) => item.id === Number(id));
    };

    const setDepartmentFormFieldValue = (formRef: any, key: any, value: any) => {
        if (departmentList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        loadingDepartmentList,
        departmentList,
        activeDepartmentList,
        setDepartmentFormFieldValue,
        getDepartmentById
    };
};
