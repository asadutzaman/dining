import React, {FC, useEffect, useRef, useState} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {Form} from 'antd'
import queryString, {parse} from 'query-string'
import ItemStockListFilter from './ItemStockList.filter'
import ItemStockListing from './ItemStockList.listing'
import ItemStockListPagination from './ItemStockList.pagination'
import {useErrorHandler} from 'src/app/hooks/useErrorHandler'
import {useForm} from 'src/app/hooks/useForm'
import {ReportInvApi} from 'src/app/api'
import {Message} from 'src/app/utils'
import download from 'downloadjs'
import GrnViewController from '../GrnView/GrnView.controller'
import {useCrudListService} from 'src/app/hooks/crud/useCrudListService'

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 24},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 24},
  },
}
const initialState = {
  search: '',
  entity: {},
  entityId: null,
  listData: [],
  branchInfo: {},
  itemInfo: {},
  fields: {
    logistic_id: null,
    item_ids: [],
    stock_level: null,
    financial_year: null,
  },
  filters: {
    logistic_id: null,
    dashboard: false,
    stock_level: null,
    financial_year: null,
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
}

const ItemStockListController: FC = (props) => {
  const location = useLocation()
  const queryParams = parse(location.search)

  const queryState = {
    search: queryParams?.q || initialState.search,
    filters: {
      logistic_id: queryParams?.logistic_id || initialState.filters.logistic_id,
      dashboard: queryParams?.dashboard || initialState.filters.dashboard,
      stock_level: queryParams?.stock_level || initialState.filters.stock_level,
      financial_year: queryParams?.financial_year || initialState.filters.financial_year,
    },
  }

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
  } = useCrudListService(ReportInvApi, queryState, initialState, props)

  const {handleChange, resetForm} = useForm(initialState.fields)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [isExportSubmitted, setIsExportSubmitted] = useState<boolean>(false)
  // const [listData, setListData] = useState<any[]>(initialState.listData)
  const [branchInfo, setBranchInfo] = useState<any>(initialState.branchInfo)
  const [itemInfo, setItemInfo] = useState<any>(initialState.itemInfo)
  const [logisticName, setLogisticName] = useState<string>('All Logistics')

  // const [view, setView] = useState(queryState.view)
  // const [search, setSearch] = useState<any>(queryState.search)
  // const [filters, setFilters] = useState<any>(queryState.filters)
  // const [sort, setSort] = useState(queryState.sort)
  // const [pagination, setPagination] = React.useState<any>(queryState.pagination)
  // const [totalCount, setTotalCount] = useState(initialState.totalCount)
  // const [loading, setLoading] = useState(initialState.loading)
  const [exportLoading, setExportLoading] = useState(initialState.exportLoading)
  // const [entity, setEntity] = useState(queryState.entity)
  // const [entityId, setEntityId] = useState(queryState.entityId)
  // const [isShowView, setIsShowView] = useState(queryState.isShowView)
  // const [isShowForm, setIsShowForm] = useState(queryState.isShowForm)
  // const [selectedRowKeys, setSelectedRowKeys] = React.useState(initialState.selectedRowKeys)
  // const [bulkAction, setBulkAction] = React.useState(initialState.bulkAction)
  // const [reloadListing, setReloadListing] = useState<number>(Date.now())
  // const [reloadView, setReloadView] = useState<number>(Date.now())
  // const [reloadForm, setReloadForm] = useState<number>(Date.now())
  const [ListingComponent, setListingComponent] = useState<any>(ItemStockListing)

  const {handleErrorMessage, handleSuccessMessage, showErrorMessage} = useErrorHandler()

  useEffect(() => {
    if (filters.logistic_id) {
      initPreviewData()
      if (isSubmitted) {
        initPreviewData()
      } else if (isExportSubmitted) {
        initExportData()
      } else if (filters.logistic_id && filters.dashboard) {
        initPreviewData()
      }
    } else if (filters.dashboard && filters.stock_level) {
      initPreviewData()
    }
  }, [search, filters, sort, pagination, reloadListing, isSubmitted, isExportSubmitted])

  useEffect(() => {
    handleUrl()
  }, [entityId, isShowView, isShowForm])

  const initPreviewData = async () => {
    await handleUrl()
    await handlePayload()
    await loadData()
  }

  const initExportData = async () => {
    await handleUrl()
    // await handlePayload();
    await handleExportPayload()
    await exportItemStockList()
  }

  const loadData = (): void => {
    setLoading(true)
    ReportInvApi.getItemStockReport(payload.current)
      .then((res) => {
        setListData(res.data.results)
        setLogisticName(res.data.logistic_name)
        setTotalCount(res.data.meta.totalCount)
        setLoading(false)
      })
      .catch((err) => {
        handleErrorMessage(err)
        setLoading(false)
      })
  }

  const exportItemStockList = (): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      setExportLoading(true)
      ReportInvApi.getItemStockReportExport(payload.current)
        .then((res) => {
          if (res.status == 200) {
            download(new Blob([res.data]), 'ItemStockReport.xlsx', {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            })
          }
          Message.success('Download Successfully')
          setExportLoading(false)
          resolve(res)
        })
        .catch((err) => {
          if (err?.status === 422) {
            Message.error(err.data, 5)
          } else {
            Message.error('A network error occurred. Please try again later.')
          }
          setExportLoading(false)
          reject(err)
        })
    })
  }

  const handleUrl = (): void => {
    let urlObject: any = {}

    if (filters.logistic_id) {
      urlObject.logistic_id = filters.logistic_id
    }
    if (filters.stock_level) {
      urlObject.stock_level = filters.stock_level
    }
    BaseCrudListService.handleUrl(urlObject)
  }

  // PENDING
  const processFilters = (): string => {
    let filterString = '1=1'

    if (filters.logistic_id) {
      filterString += " AND logistic_id='" + filters.logistic_id + "'"
    }
    if (filters.item_ids) {
      filterString += " AND item_ids='" + filters.item_ids + "'"
    }
    if (filters.stock_level) {
      filterString += " AND stock_level='" + filters.stock_level + "'"
    }
    if (filters.financial_year) {
      filterString += " AND financial_year='" + filters.financial_year + "'"
    }

    return BaseCrudListService.processFilters(filterString)
  }

  // PENDING
  const processQueryParams = () => {
    let filterString = {}

    if (filters.logistic_id) {
      filterString['logistic_id'] = filters.logistic_id
    }
    if (filters.item_ids) {
      filterString['item_ids'] = filters.item_ids
    }
    if (filters.stock_level) {
      filterString['stock_level'] = filters.stock_level
    }
    if (filters.financial_year) {
      filterString['financial_year'] = filters.financial_year
    }

    return BaseCrudListService.processQueryParams(filterString)
  }

  // PENDING
  const processOrderBy = (): string => {
    let orderByString = ''
    return BaseCrudListService.processOrderBy(orderByString)
  }

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
    }
  }

  // FOR EXPORT WITHOUT PAGINATION
  const handleExportPayload = (): void => {
    payload.current = {
      $select: '',
      $search: search,
      $filter: processFilters(),
      $queryParams: processQueryParams(),
      $expand: '',
      $orderby: processOrderBy(),
    }
  }

  const onChangeSwitchToggle = (checked: any, record: any) => {
    BaseCrudListService.onChangeSwitchToggle(checked, record)
  }

  const handleTableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
    BaseCrudListService.handleTableChange(pagination, filters, sorter, extra)
  }

  const handleOnChanged = (fieldName: string, value: any, text?: any) => {
    if (fieldName === 'status') {
      setFilters({
        ...filters,
        status: value,
      })
    }
    BaseCrudListService.handleOnChanged(fieldName, value, text)
  }

  const handleCallbackFunc = (event: any, action: string, recordId?: any, data?: any) => {
    // if (event === null || event === undefined || event === '') {
    //   event = event ? event : 'singleAction'
    // } else if (event === 'singleAction' && action === 'reloadView') {
    //   handleReloadView()
    // } else if (event === 'singleAction' && action === 'reloadForm') {
    //   handleReloadForm()
    // } else if (event === 'singleAction' && action === 'reloadListing') {
    //   handleReloadListing()
    // } else if (event === 'singleAction' && action === 'resetListing') {
    //   handleReset()
    // }
    BaseCrudListService.handleCallbackFunc(event, action, recordId, data)
  }

  const handleSubmit = (values: any) => {
    setFilters({
      ...values,
    })
  }

  // const handleReset = () => {
  //   setSearch(initialState.search)
  //   setFilters({
  //     // item_ids: initialState.filters.item_ids,
  //     logistic_id: initialState.filters.logistic_id,
  //     stock_level: initialState.filters.stock_level,
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
    <div className='card'>
      <Form
        {...formItemLayout}
        form={formRef}
        layout='vertical'
        name='exampleListingFilterForm'
        initialValues={initialValues}
      >
        <ItemStockListFilter
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
          exportLoading={exportLoading}
          ListingComponent={ListingComponent}
          handleCallbackFunc={handleCallbackFunc}
          pagination={pagination}
          totalCount={totalCount}
        />
        <ItemStockListing
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
          logisticName={logisticName}
        />
        <ItemStockListPagination
          pagination={pagination}
          totalCount={totalCount}
          handleOnChanged={handleOnChanged}
        />
      </Form>
      <GrnViewController
        entityId={entityId}
        reloadView={reloadView}
        isShowView={isShowView}
        handleCallbackFunc={handleCallbackFunc}
      />
    </div>
  )
}

export default ItemStockListController
