import React, { FC, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form } from "antd";
import queryString, { parse } from "query-string";
import { useForm } from "../../../../hooks/useForm";
import PermissionResourceView from "./PermissionResource.view";
import PermissionResourceFilter from "./PermissionResource.filter";
import { Message } from "../../../../utils";
import { PermissionApi, RoleApi } from "../../../../api";
import "./Permission.module.listing.scss";
import "./PermissionResource.style.scss";

const initialState = {
    listData: [],
    roleListData: [],
    roleId: 1,
    expandAll: 1,
    loading: false,
    fields: {},
};

const PermissionResourceController: FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = parse(location.search);
    const payload = useRef<any>({});

    const queryState = {
        roleId: queryParams?.roleId || initialState.roleId,
    };

    const { formRef, initialValues } = useForm({ roleId: queryState.roleId });
    const [listData, setListData] = useState<any[]>(initialState.listData);
    const [roleListData, setRoleListData] = useState(initialState.roleListData);
    const [roleId, setRoleId] = useState(queryState.roleId);
    const [expandAll, setExpandAll] = useState(initialState.expandAll);
    const [loading, setLoading] = useState(initialState.loading);

    useEffect(() => {
        initData();
    }, [roleId]);

    useEffect(() => {
        handleUrl();
    }, [roleId, expandAll]);

    useEffect(() => {
        loadRoleData();
    }, []);

    const initData = async () => {
        await handleUrl();
        await handlePayload();
        await loadData();
    };

    const loadData = (): void => {
        setLoading(true);
        PermissionApi.rolePermission(roleId, payload.current)
            .then((res) => {
                setListData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                Message.error("A network error occurred. Please try again later.");
                setLoading(false);
            });
    };

    const loadRoleData = (): void => {
        setLoading(true);
        RoleApi.list()
            .then((res) => {
                setRoleListData(res.data.results);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
            });
    };

    const handleUrl = (): void => {
        let urlObject: any = {};
        if (roleId) {
            urlObject.roleId = roleId;
        }
        if (Object.keys(urlObject).length) {
            navigate({ search: queryString.stringify(urlObject) });
        }
    };

    const processFilters = (): string => {
        let filterString = "status=1";

        if (roleId) {
            filterString += " AND role_id='" + roleId + "'";
        }

        return filterString;
    };

    const handlePayload = (): void => {
        payload.current = {
            $select: "",
            $search: "",
            $filter: processFilters(),
            $expand: "",
            $orderby: "",
            $top: 0,
            $skip: 0,
        };
    };

    const handleSubmit = (values: any): void => {
        if (values.roleId) {
            setRoleId(values.roleId);
        }
    };

    const handleExpandAll = (value: any): void => {
        setExpandAll(value);
    };

    return (
        <div className="card">
            <div className="listing-page-container listing-page-container-permission-resource">
                <Form form={formRef} name="permissionResourceFilterForm" initialValues={initialValues} onFinish={handleSubmit}>
                    <PermissionResourceFilter
                        roleId={roleId}
                        loading={loading}
                        expandAll={expandAll}
                        handleExpandAll={handleExpandAll}
                        roleListData={roleListData}
                    />
                    {roleId && !loading && <PermissionResourceView roleId={roleId} expandAll={expandAll} listData={listData} />}
                </Form>
            </div>
        </div>
    );
};

export default PermissionResourceController;
