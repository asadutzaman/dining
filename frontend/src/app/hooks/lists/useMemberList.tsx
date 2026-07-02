import { useState, useEffect } from "react";
import { MemberApi } from "../../api";

export const useMemberList = () => {
    // USED STATES
    const [memberList, setMemberList] = useState<any>([]);
    const [loadingMemberList, setLoadingMemberList] = useState<boolean>(false);

    useEffect(() => {
        loadMemberList();
    }, []);

    const loadMemberList = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            setLoadingMemberList(true);
            const payload = {
                $select: "id,member_code,name,member_type,status",
                $orderby: "name asc",
            };
            MemberApi.dropdown(payload)
                .then((res) => {
                    const list = res.data.results;
                    if (list.length > 0) {
                        setMemberList(list);
                    }
                    setLoadingMemberList(false);
                    resolve(res.data);
                })
                .catch((err) => {
                    setLoadingMemberList(false);
                    reject(err);
                });
        });
    };

    const getMemberById = (id: any) => {
        if (!memberList) {
            return;
        }
        return memberList.find((item: any) => item.id === Number(id));
    };

    const setMemberFormFieldValue = (formRef: any, key: any, value: any) => {
        if (memberList?.find((item: any) => item.id === Number(value))) {
            formRef.setFieldsValue({ [key]: value });
        } else {
            formRef.setFieldsValue({ [key]: null });
        }
    };

    return {
        loadingMemberList,
        memberList,
        setMemberFormFieldValue,
        getMemberById
    };
};
