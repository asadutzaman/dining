import { useState, useEffect } from "react";
import { BrandApi } from "src/app/api";

export const useBrandList = () => {
    // USED STATES
    const [brandList, setBrandList] = useState<any>([]);
    const [loadingBrandList, setLoadingBrandList] = useState<boolean>(false);
    const [disabledBrandList, setDisabledBrandList] = useState<boolean>(true);

    useEffect(() => {
        loadBrandList();
    }, []);

    const loadBrandList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingBrandList(true);
            const payload = {
                $select: "id,name,status",
                $orderby: "sort_order asc",
            };
            BrandApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setBrandList(list);
                    }
                    setLoadingBrandList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingBrandList(false);
                    reject(err);
                });
        });
    };

    const getBrandById = (id: any) => {
        if (!brandList) {
            return;
        }
        return brandList.find((item: any) => item.id === Number(id));
    };

    const setBrandFormFieldValue = (formRef: any, key: any, value: any) => {
        if (brandList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        brandList,
        loadingBrandList,
        setBrandFormFieldValue,
        getBrandById,
        disabledBrandList,
        setDisabledBrandList
    };
};
