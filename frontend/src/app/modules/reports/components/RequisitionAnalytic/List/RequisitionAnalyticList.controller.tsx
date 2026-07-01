import React, { FC, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form } from 'antd';
import queryString, { parse } from 'query-string';
import RequisitionAnalyticListFilter from './RequisitionAnalyticList.filter';
import RequisitionAnalyticListing from './RequisitionAnalyticList.listing';
import RequisitionAnalyticListPagination from './RequisitionAnalyticList.pagination';
import { useErrorHandler } from 'src/app/hooks/useErrorHandler';
import { useForm } from 'src/app/hooks/useForm';
import { ReportInvApi } from 'src/app/api';
import { Message } from 'src/app/utils';
import download from 'downloadjs';
import { useWorkflow } from 'src/app/hooks/workflow/useWorkflow';
import { useCrudListService } from 'src/app/hooks/crud/useCrudListService';
import RequisitionViewController from '../RequisitionView/RequisitionView.controller';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
};
const initialState = {
  search: '',
  entity: {},
  entityId: null,
  listData: [],
  branchInfo: {},
  itemInfo: {},
  fields: {
    step_code: 'ALL',
    logistic_id: null,
    branch_id: null,
    request_by: null,
    status: 1,
  },
  filters: {
    step_code: 'ALL',
    logistic_id: null,
    branch_id: null,
    request_by: null,
    dashboard: false,
    status: 1,
  },
  pagination: {
    currentPage: 1,
    pageSize: 50,
  },
  totalCount: 0,
  selectedRowKeys: [],
  sort: 'id asc',
  view: null,
  loading: false,
  exportLoading: false,
  isShowView: false,
  isShowForm: false,
  bulkAction: {
    action: '',
    field: '',
    value: '',
    ids: [] as any,
  },
};

const RequisitionAnalyticListController: FC = (props) => {
  const location = useLocation();
  const queryParams = parse(location.search);

  const queryState = {
    search: queryParams?.q || initialState.search,
    filters: {
      step_code: queryParams?.step_code || initialState.filters.step_code,
      logistic_id: queryParams?.logistic_id || initialState.filters.logistic_id,
      branch_id: queryParams?.branch_id || initialState.filters.branch_id,
      request_by: queryParams?.request_by || initialState.filters.request_by,
      dashboard: queryParams?.dashboard || initialState.filters.dashboard,
    },
  };

  const {
    BaseCrudListService,
    formRef,
    payload,
    setFilters,
    initialValues,
    listData,
    setListData,
    search,
    filters,
    sort,
    pagination,
    totalCount,
    setTotalCount,
    loading,
    setLoading,
    entityId,
    isShowView,
    isShowForm,
    setIsShowForm,
    isShowModalForm,
    selectedRowKeys,
    bulkAction,
    reloadListing,
    reloadView,
    reloadForm,
    // resetForm,
  } = useCrudListService(ReportInvApi, queryState, initialState, props);

  const { handleChange, resetForm } = useForm(initialState.fields);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isExportSubmitted, setIsExportSubmitted] = useState<boolean>(false);
  // const [listData, setListData] = useState<any[]>(initialState.listData)
  const [branchInfo, setBranchInfo] = useState<any>(initialState.branchInfo);
  const [itemInfo, setItemInfo] = useState<any>(initialState.itemInfo);
  const [logisticName, setLogisticName] = useState<string>('All Logistics');

  // const [view, setView] = useState(queryState.view)
  // const [search, setSearch] = useState<any>(queryState.search)
  // const [filters, setFilters] = useState<any>(queryState.filters)
  // const [sort, setSort] = useState(queryState.sort)
  // const [pagination, setPagination] = React.useState<any>(queryState.pagination)
  // const [totalCount, setTotalCount] = useState(initialState.totalCount)
  // const [loading, setLoading] = useState(initialState.loading)
  const [exportLoading, setExportLoading] = useState(
    initialState.exportLoading
  );
  // const [entity, setEntity] = useState(queryState.entity)
  // const [entityId, setEntityId] = useState(queryState.entityId)
  // const [isShowView, setIsShowView] = useState(queryState.isShowView)
  // const [isShowForm, setIsShowForm] = useState(queryState.isShowForm)
  // const [selectedRowKeys, setSelectedRowKeys] = React.useState(initialState.selectedRowKeys)
  // const [bulkAction, setBulkAction] = React.useState(initialState.bulkAction)
  // const [reloadListing, setReloadListing] = useState<number>(Date.now())
  // const [reloadView, setReloadView] = useState<number>(Date.now())
  // const [reloadForm, setReloadForm] = useState<number>(Date.now())
  const [ListingComponent, setListingComponent] = useState<any>(
    RequisitionAnalyticListing
  );

  const { handleErrorMessage, handleSuccessMessage, showErrorMessage } =
    useErrorHandler();
  const { workflowData, workflowLoading } = useWorkflow(
    'Requisition',
    'REQUISITION_APPROVAL'
  );

  useEffect(() => {
    // if (filters.step_code) {
    if (isSubmitted) {
      initPreviewData();
    } else if (isExportSubmitted) {
      initExportData();
    } else if (filters.step_code && filters.dashboard) {
      initPreviewData();
    }
    // }
  }, [
    search,
    filters,
    sort,
    pagination,
    reloadListing,
    isSubmitted,
    isExportSubmitted,
  ]);

  useEffect(() => {
    handleUrl();
  }, [entityId, isShowView, isShowForm]);

  const initPreviewData = async () => {
    await handleUrl();
    await handlePayload();
    await loadData();
  };

  const initExportData = async () => {
    await handleUrl();
    // await handlePayload();
    await handleExportPayload();
    await exportRequisitionAnalyticList();
  };

  const loadData = (): void => {
    setLoading(true);
    ReportInvApi.getRequisitionAnalyticReport(payload.current)
      .then((res) => {
        setListData(res.data.results);
        setBranchInfo(res.data.branchInfo);
        setItemInfo(res.data.itemInfo);
        setLoading(false);
      })
      .catch((err) => {
        handleErrorMessage(err);
        setLoading(false);
      });
  };

  const exportRequisitionAnalyticList = (): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      setExportLoading(true);
      ReportInvApi.getRequisitionAnalyticReportExport(payload.current)
        .then((res) => {
          if (res.status == 200) {
            download(new Blob([res.data]), 'RequisitionAnalyticReport.xlsx', {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
          }
          Message.success('Download Successfully');
          setExportLoading(false);
          resolve(res);
        })
        .catch((err) => {
          if (err?.status === 422) {
            Message.error(err.data, 5);
          } else {
            Message.error('A network error occurred. Please try again later.');
          }
          setExportLoading(false);
          reject(err);
        });
    });
  };

  const handleUrl = (): void => {
    let urlObject: any = {};

    if (filters.step_code) {
      urlObject.step_code = filters.step_code;
    }
    if (filters.logistic_id) {
      urlObject.logistic_id = filters.logistic_id;
    }
    if (filters.branch_id) {
      urlObject.branch_id = filters.branch_id;
    }
    if (filters.request_by) {
      urlObject.request_by = filters.request_by;
    }
    BaseCrudListService.handleUrl(urlObject);
  };

  // PENDING
  const processFilters = (): string => {
    let filterString = '1=1';

    if (filters.step_code) {
      filterString += " AND step_code='" + filters.step_code + "'";
    }
    if (filters.logistic_id) {
      filterString += " AND logistic_id='" + filters.logistic_id + "'";
    }
    if (filters.branch_id) {
      filterString += " AND branch_id='" + filters.branch_id + "'";
    }
    if (filters.request_by) {
      filterString += " AND request_by='" + filters.request_by + "'";
    }

    return BaseCrudListService.processFilters(filterString);
  };

  // PENDING
  const processQueryParams = () => {
    let filterString = {};

    if (filters.step_code) {
      filterString['step_code'] = filters.step_code;
    }
    if (filters.branch_id) {
      filterString['branch_id'] = filters.branch_id;
    }
    if (filters.logistic_id) {
      filterString['logistic_id'] = filters.logistic_id;
    }
    if (filters.request_by) {
      filterString['request_by'] = filters.request_by;
    }

    return BaseCrudListService.processQueryParams(filterString);
  };

  // PENDING
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

  // FOR EXPORT WITHOUT PAGINATION
  const handleExportPayload = (): void => {
    payload.current = {
      $select: '',
      $search: search,
      $filter: processFilters(),
      $queryParams: processQueryParams(),
      $expand: '',
      $orderby: processOrderBy(),
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
    if (fieldName === 'status') {
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

  const handleSubmit = (values: any) => {
    setFilters({
      ...values,
    });
  };

  // const handleReset = () => {
  //   setSearch(initialState.search)
  //   setFilters({
  //     // item_ids: initialState.filters.item_ids,
  //     step_code: initialState.filters.step_code,
  //     branch_id: initialState.filters.branch_id,
  //     logistic_id: initialState.filters.logistic_id,
  //     request_by: initialState.filters.request_by,
  //   })
  //   setPagination({
  //     currentPage: initialState.pagination.currentPage,
  //     pageSize: initialState.pagination.pageSize,
  //   })
  //   setSort(initialState.sort)
  //   setView(initialState.view)
  //   resetForm()
  //   handleUrl()
  // }

  // const handleReloadListing = () => {
  //   setReloadListing(Date.now())
  // }

  // const handleReloadForm = () => {
  //   setReloadForm(Date.now())
  // }

  // const handleReloadView = () => {
  //   setReloadView(Date.now())
  // }

  return (
    <div className="card">
      <Form
        {...formItemLayout}
        form={formRef}
        layout="vertical"
        name="exampleListingFilterForm"
        initialValues={initialValues}
      >
        <RequisitionAnalyticListFilter
          formRef={formRef}
          initialValues={initialValues}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setIsSubmitted={setIsSubmitted}
          setIsExportSubmitted={setIsExportSubmitted}
          filters={filters}
          params={{
            ...payload.current,
            $selectedIds: selectedRowKeys,
          }}
          listData={listData}
          itemInfo={itemInfo}
          branchInfo={branchInfo}
          loading={loading}
          workflowSteps={workflowData?.workflow_steps || []}
          workflowLoading={workflowLoading}
          exportLoading={exportLoading}
          ListingComponent={ListingComponent}
          handleCallbackFunc={handleCallbackFunc}
          pagination={pagination}
          totalCount={totalCount}
        />
        <RequisitionAnalyticListing
          loading={loading}
          listData={listData}
          itemInfo={itemInfo}
          branchInfo={branchInfo}
          reloadListing={reloadListing}
          selectedRowKeys={selectedRowKeys}
          filters={filters}
          onChangeSwitchToggle={onChangeSwitchToggle}
          handleTableChange={handleTableChange}
          handleCallbackFunc={handleCallbackFunc}
          pagination={pagination}
          totalCount={totalCount}
          handleSubmit={handleSubmit}
        />
        <RequisitionAnalyticListPagination
          pagination={pagination}
          totalCount={totalCount}
          handleOnChanged={handleOnChanged}
        />
      </Form>

      <RequisitionViewController
        entityId={entityId}
        reloadView={reloadView}
        isShowView={isShowView}
        handleCallbackFunc={handleCallbackFunc}
      />
    </div>
  );
};

export default RequisitionAnalyticListController;
