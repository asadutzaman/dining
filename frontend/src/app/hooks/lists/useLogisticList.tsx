import { useState, useEffect } from "react";
import { LogisticApi } from "../../api";

export const useLogisticList = () => {
    // USED STATES
    const [logisticList, setLogisticList] = useState<any>([]);
    const [activeLogisticList, setActiveLogisticList] = useState<any>([]);
    const [loadingLogisticList, setLoadingLogisticList] = useState<boolean>(false);

    useEffect(() => {
        loadLogisticList();
    }, []);

    const loadLogisticList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingLogisticList(true);
            const payload = {
                $select: "id,name,status",
                $orderby: "sort_order asc",
            };
            LogisticApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setLogisticList(list);
                        const activeLogistics = list.filter((item: any) => item.status === 1);
                        setActiveLogisticList(activeLogistics);
                    }
                    setLoadingLogisticList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingLogisticList(false);
                    reject(err);
                });
        });
    };

    const getLogisticById = (id: any) => {
        if (!logisticList) {
            return;
        }
        return logisticList.find((item: any) => item.id === Number(id));
    };

    const setLogisticFormFieldValue = (formRef: any, key: any, value: any) => {
        if (logisticList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        loadingLogisticList,
        logisticList,
        activeLogisticList,
        setLogisticFormFieldValue,
        getLogisticById
    };
};
