import { useState, useEffect } from "react";
import { AuthorApi } from "../../api";

export const useAuthorList = () => {
    // USED STATES
    const [authorList, setAuthorList] = useState<any>([]);
    const [activeAuthorList, setActiveAuthorList] = useState<any>([]);
    const [loadingAuthorList, setLoadingAuthorList] = useState<boolean>(false);

    useEffect(() => {
        loadAuthorList();
    }, []);

    const loadAuthorList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingAuthorList(true);
            const payload = {
                $select: "id,name,status",
                $orderby: "sort_order asc",
            };
            AuthorApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setAuthorList(list);
                        const activeAuthors = list.filter((item: any) => item.status === 1);
                        setActiveAuthorList(activeAuthors);
                    }
                    setLoadingAuthorList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingAuthorList(false);
                    reject(err);
                });
        });
    };

    const getAuthorById = (id: any) => {
        if (!authorList) {
            return;
        }
        return authorList.find((item: any) => item.id === Number(id));
    };

    const setAuthorFormFieldValue = (formRef: any, key: any, value: any) => {
        if (authorList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        loadingAuthorList,
        authorList,
        activeAuthorList,
        setAuthorFormFieldValue,
        getAuthorById
    };
};
