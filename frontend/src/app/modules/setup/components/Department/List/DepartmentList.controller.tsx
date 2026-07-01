import React, { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { parse } from 'query-string';
import { Form } from 'antd';
import DepartmentListFilter from './DepartmentList.filter';
import DepartmentListing from './DepartmentList.listing';
import DepartmentListPagination from './DepartmentList.pagination';
import DepartmentViewController from '../View/DepartmentView.controller';
import DepartmentFormController from '../Form/DepartmentForm.controller';
import { useCrudListService } from 'src/app/hooks/crud/useCrudListService';
import { DepartmentApi } from 'src/app/api';
import { useLang } from 'src/app/hooks/useLang';

const initialState = {
  search: '',
  entity: {},
  entityId: null,
  listData: [],
  filters: {
    status: '',
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
  },
  totalCount: 0,
  selectedRowKeys: [],
  sort: 'id desc',
  view: null,
  loading: false,
  isShowView: false,
  isShowForm: false,
  fields: {},
  bulkAction: {
    action: '',
    field: '',
    value: '',
    ids: [] as any,
  },
  message: {
    network_error: 'A network error occurred. Please try again later.',
    delete_success: 'Delete Department successfully.',
    delete_confirm_title: 'Delete Department',
    delete_confirm: 'Are you sure you want to delete this Department?',
    delete_bulk_select: 'Please select item(s)',
    delete_bulk_confirm: 'Are you sure you wish to delete selected Department?',
  },
};

const DepartmentListController: FC<any> = (props) => {
  const location = useLocation();
  const queryParams = parse(location.search);

  const queryState = {
    filters: {
      status: queryParams?.status || initialState.filters.status,
    },
  };

  const {
    BaseCrudListService,
    formRef,
    payload,
    setFilters,
    initialValues,
    listData,
    search,
    filters,
    sort,
    pagination,
    totalCount,
    loading,
    entityId,
    isShowView,
    isShowForm,
    setIsShowForm,
    selectedRowKeys,
    bulkAction,
    reloadListing,
    reloadView,
    reloadForm,
  } = useCrudListService(DepartmentApi, queryState, initialState, props);

  useEffect(() => {
    initData();
  }, [search, filters, sort, pagination, reloadListing]);

  useEffect(() => {
    handleUrl();
  }, [entityId, isShowView, isShowForm]);

  useEffect(() => {
    if (bulkAction.action !== '') {
      executeBulkAction();
    }
  }, [bulkAction]);

  const initData = async () => {
    await handleUrl();
    await handlePayload();
    await loadData();
  };

  const loadData = (): Promise<any> => {
    return BaseCrudListService.loadData();
  };

  const executeBulkAction = (): Promise<any> => {
    return BaseCrudListService.executeBulkAction();
  };

  const handleUrl = (): void => {
    let urlObject: any = {};

    if (search) {
      urlObject.q = search;
    }
    if (filters.status) {
      urlObject.status = filters.status;
    }
    BaseCrudListService.handleUrl(urlObject);
  };

  const processFilters = (): string => {
    let filterString = '';

    if (filters.status) {
      filterString += " status='" + filters.status + "'";
    }

    return BaseCrudListService.processFilters(filterString);
  };

  const processQueryParams = () => {
    let filterString = {};
    return BaseCrudListService.processQueryParams(filterString);
  };

  const processOrderBy = (): string => {
    let orderByString = '';
    return BaseCrudListService.processOrderBy(orderByString);
  };

  const handlePayload = (): void => {
    payload.current = {
      $select: '',
      $search: search,
      $filter: processFilters(),
      $queryParams: processQueryParams(),
      $expand: '',
      $orderby: processOrderBy(),
      $top: pagination.pageSize,
      $skip: pagination.pageSize * (pagination.currentPage - 1),
    };
  };

  const onChangeSwitchToggle = (checked: any, record: any) => {
    BaseCrudListService.onChangeSwitchToggle(checked, record);
  };

  const handleTableChange = (
    pagination: any,
    filters: any,
    sorter: any,
    extra: any
  ) => {
    BaseCrudListService.handleTableChange(pagination, filters, sorter, extra);
  };

  const handleOnChanged = (fieldName: string, value: any, text?: any) => {
    if (fieldName === 'filter_status') {
      setFilters({
        ...filters,
        status: value,
      });
    }
    BaseCrudListService.handleOnChanged(fieldName, value, text);
  };

  const handleCallbackFunc = (
    event: any,
    action: string,
    recordId?: any,
    data?: any
  ) => {
    BaseCrudListService.handleCallbackFunc(event, action, recordId, data);
  };

  return (
    <div className="card">
      <Form
        form={formRef}
        name="exampleListingFilterForm"
        initialValues={initialValues}
      >
        <DepartmentListFilter
          filters={filters}
          handleOnChanged={handleOnChanged}
          handleCallbackFunc={handleCallbackFunc}
        />
        <DepartmentListing
          loading={loading}
          listData={listData}
          reloadListing={reloadListing}
          selectedRowKeys={selectedRowKeys}
          onChangeSwitchToggle={onChangeSwitchToggle}
          handleOnChanged={handleOnChanged}
          handleTableChange={handleTableChange}
          handleCallbackFunc={handleCallbackFunc}
        />
        <DepartmentListPagination
          pagination={pagination}
          totalCount={totalCount}
          handleOnChanged={handleOnChanged}
        />
      </Form>
      <DepartmentViewController
        entityId={entityId}
        reloadView={reloadView}
        isShowView={isShowView}
        handleCallbackFunc={handleCallbackFunc}
      />
      <DepartmentFormController
        entityId={entityId}
        reloadForm={reloadForm}
        isShowForm={isShowForm}
        handleCallbackFunc={handleCallbackFunc}
      />
    </div>
  );
};

export default DepartmentListController;
