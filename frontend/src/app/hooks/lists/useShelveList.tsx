import { useState, useEffect } from "react";
import { ShelveApi } from "src/app/api"; // Import ShelveApi

export const useShelveList = () => {
    // USED STATES
    const [shelveList, setShelveList] = useState<any>([]);
    const [loadingShelveList, setLoadingShelveList] = useState<boolean>(false);
    const [disabledShelveList, setDisabledShelveList] = useState<boolean>(true);

    useEffect(() => {
        loadShelveList();
    }, []);

    const loadShelveList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingShelveList(true);
            const payload = {
                $select: "id,name,status",
                $orderby: "sort_order asc",
            };
            ShelveApi.dropdown(payload) // Use ShelveApi
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setShelveList(list);
                    }
                    setLoadingShelveList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingShelveList(false);
                    reject(err);
                });
        });
    };

    const getShelveById = (id: any) => {
        if (!shelveList) {
            return;
        }
        return shelveList.find((item: any) => item.id === Number(id));
    };

    const setShelveFormFieldValue = (formRef: any, key: any, value: any) => {
        if (shelveList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        shelveList,
        loadingShelveList,
        setShelveFormFieldValue,
        getShelveById,
        disabledShelveList,
        setDisabledShelveList
    };
};
