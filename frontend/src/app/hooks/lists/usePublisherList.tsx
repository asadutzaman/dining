import { useState, useEffect } from "react";
import { PublisherApi } from "../../api";

export const usePublisherList = () => {
    // USED STATES
    const [publisherList, setPublisherList] = useState<any>([]);
    const [activePublisherList, setActivePublisherList] = useState<any>([]);
    const [loadingPublisherList, setLoadingPublisherList] = useState<boolean>(false);

    useEffect(() => {
        loadPublisherList();
    }, []);

    const loadPublisherList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingPublisherList(true);
            const payload = {
                $select: "id,name,status",
                $orderby: "sort_order asc",
            };
            PublisherApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setPublisherList(list);
                        const activePublishers = list.filter((item: any) => item.status === 1);
                        setActivePublisherList(activePublishers);
                    }
                    setLoadingPublisherList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingPublisherList(false);
                    reject(err);
                });
        });
    };

    const getPublisherById = (id: any) => {
        if (!publisherList) {
            return;
        }
        return publisherList.find((item: any) => item.id === Number(id));
    };

    const setPublisherFormFieldValue = (formRef: any, key: any, value: any) => {
        if (publisherList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        loadingPublisherList,
        publisherList,
        activePublisherList,
        setPublisherFormFieldValue,
        getPublisherById
    };
};
