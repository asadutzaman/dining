import React, {FC, useEffect, useRef, useState} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {Form} from 'antd'
import queryString, {parse} from 'query-string'
import ItemLowStockListFilter from './ItemLowStockList.filter'
import ItemLowStockListing from './ItemLowStockList.listing'
import ItemLowStockListPagination from './ItemLowStockList.pagination'
import {useErrorHandler} from 'src/app/hooks/useErrorHandler'
import {useForm} from 'src/app/hooks/useForm'
import {ReportInvApi} from 'src/app/api'
import {Message} from 'src/app/utils'
import download from 'downloadjs'

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
    branch_id: null,
    logistic_id: null,
    item_ids: [],
    stock_status: null,
    status: 1,
  },
  filters: {
    branch_id: null,
    logistic_id: null,
    stock_status: null,
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
}

const ItemLowStockListController: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = parse(location.search)
  const payload = useRef<any>({})
  const queryState = {
    search: queryParams?.q || initialState.search,
    filters: {
      branch_id: queryParams?.branch_id || initialState.filters.branch_id,
      logistic_id: queryParams?.logistic_id || initialState.filters.logistic_id,
      stock_status: queryParams?.stock_status || initialState.filters.stock_status,
      // status: queryParams?.status || initialState.filters.status,
    },
    pagination: {
      currentPage: queryParams?.page || initialState.pagination.currentPage,
      pageSize: queryParams?.pageSize || initialState.pagination.pageSize,
    },
    sort: queryParams?.sort || initialState.sort,
    view: queryParams?.view || initialState.view,
    isShowView: queryParams?.isShowView || initialState.isShowView,
    isShowForm: queryParams?.isShowForm || initialState.isShowForm,
    entity: queryParams?.entity || initialState.entity,
    entityId: queryParams?.entityId || initialState.entityId,
  }

  const {formRef, initialValues, handleChange, resetForm} = useForm(initialState.fields)
  // const { formRef, initialValues, resetForm } = useForm({
  //     search: queryState.search,
  //     // status: queryState.filters.status,
  // });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [isExportSubmitted, setIsExportSubmitted] = useState<boolean>(false)
  const [listData, setListData] = useState<any[]>(initialState.listData)
  const [branchInfo, setBranchInfo] = useState<any>(initialState.branchInfo)
  const [itemInfo, setItemInfo] = useState<any>(initialState.itemInfo)

  const [view, setView] = useState(queryState.view)
  const [search, setSearch] = useState<any>(queryState.search)
  const [filters, setFilters] = useState<any>(queryState.filters)
  const [sort, setSort] = useState(queryState.sort)
  const [pagination, setPagination] = React.useState<any>(queryState.pagination)
  const [totalCount, setTotalCount] = useState(initialState.totalCount)
  const [loading, setLoading] = useState(initialState.loading)
  const [exportLoading, setExportLoading] = useState(initialState.exportLoading)
  const [entity, setEntity] = useState(queryState.entity)
  const [entityId, setEntityId] = useState(queryState.entityId)
  const [isShowView, setIsShowView] = useState(queryState.isShowView)
  const [isShowForm, setIsShowForm] = useState(queryState.isShowForm)
  const [selectedRowKeys, setSelectedRowKeys] = React.useState(initialState.selectedRowKeys)
  const [bulkAction, setBulkAction] = React.useState(initialState.bulkAction)
  const [reloadListing, setReloadListing] = useState<number>(Date.now())
  const [reloadView, setReloadView] = useState<number>(Date.now())
  const [reloadForm, setReloadForm] = useState<number>(Date.now())
  const [ListingComponent, setListingComponent] = useState<any>(ItemLowStockListing)

  const {handleErrorMessage, handleSuccessMessage, showErrorMessage} = useErrorHandler()

  useEffect(() => {
    if (filters.branch_id) {
      if (isSubmitted) {
        initPreviewData()
      } else if (isExportSubmitted) {
        initExportData()
      } else if (filters.branch_id && filters.stock_status) {
        initPreviewData()
      }
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
    await handlePayload()
    await handleExportPayload()
    await exportItemStockList()
  }

  const loadData = (): void => {
    setLoading(true)
    ReportInvApi.getItemLowStockReport(payload.current)
      .then((res) => {
        setBranchInfo(res.data.branchInfo)
        setItemInfo(res.data.itemInfo)
        prepareListData(res.data.results)
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
      ReportInvApi.getItemLowStockReportExport(payload.current)
        .then((res) => {
          if (res.status == 200) {
            download(new Blob([res.data]), 'ItemLowStockReport.xlsx', {
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

  const prepareListData = (dataArray) => {
    setListData(dataArray)
  }

  const handleUrl = (): void => {
    let urlObject: any = {}

    if (search) {
      urlObject.q = search
    }
    if (filters.branch_id) {
      urlObject.branch_id = filters.branch_id
    }
    if (filters.logistic_id) {
      urlObject.logistic_id = filters.logistic_id
    }
    if (filters.stock_status) {
      urlObject.stock_status = filters.stock_status
    }
    if (sort !== initialState.sort) {
      urlObject.sort = sort
    }
    if (pagination.currentPage !== initialState.pagination.currentPage) {
      urlObject.page = pagination.currentPage
    }
    if (pagination.pageSize !== initialState.pagination.pageSize) {
      urlObject.pageSize = pagination.pageSize
    }
    if (view !== initialState.view) {
      urlObject.view = view
    }
    if (entityId) {
      urlObject.entityId = entityId
    }
    if (isShowView) {
      urlObject.isShowView = isShowView
    }
    if (isShowForm) {
      urlObject.isShowForm = isShowForm
    }
    if (Object.keys(urlObject).length) {
      navigate(`${location.pathname}?${queryString.stringify(urlObject)}`)
    } else {
      navigate(`${location.pathname}`)
    }
  }

  // PENDING
  const processFilters = (): string => {
    let filterString = '1=1'

    if (filters.branch_id) {
      filterString += " AND branch_id='" + filters.branch_id + "'"
    }
    if (filters.logistic_id) {
      filterString += " AND logistic_id='" + filters.logistic_id + "'"
    }
    if (filters.item_ids) {
      filterString += " AND item_ids='" + filters.item_ids + "'"
    }
    if (filters.stock_status) {
      filterString += " AND stock_status='" + filters.stock_status + "'"
    }
    return filterString
  }

  // PENDING
  const processQueryParams = () => {
    let filterString = {}

    if (filters.branch_id) {
      filterString['branch_id'] = filters.branch_id
    }
    if (filters.logistic_id) {
      filterString['logistic_id'] = filters.logistic_id
    }
    if (filters.item_ids) {
      filterString['item_ids'] = filters.item_ids
    }
    if (filters.stock_status) {
      filterString['stock_status'] = filters.stock_status
    }

    return filterString
  }

  // PENDING
  const processOrderBy = (): string => {
    let orderByString
    if (sort === 'date-desc') {
      orderByString = 'id desc'
    } else {
      orderByString = sort
    }

    return orderByString
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
    setEntity(record)

    if (checked === true) {
      setBulkAction({
        ...bulkAction,
        action: 'update_boolean',
        field: 'status',
        value: '1',
        ids: [record.id],
      })
    } else {
      setBulkAction({
        ...bulkAction,
        action: 'update_boolean',
        field: 'status',
        value: '0',
        ids: [record.id],
      })
    }
  }

  const handleReset = () => {
    setSearch(initialState.search)
    setFilters({
      // item_ids: initialState.filters.item_ids,
      branch_id: initialState.filters.branch_id,
    })
    setPagination({
      currentPage: initialState.pagination.currentPage,
      pageSize: initialState.pagination.pageSize,
    })
    setSort(initialState.sort)
    setView(initialState.view)
    resetForm()
    handleUrl()
  }

  const handleReloadListing = () => {
    setReloadListing(Date.now())
  }

  const handleReloadForm = () => {
    setReloadForm(Date.now())
  }

  const handleReloadView = () => {
    setReloadView(Date.now())
  }

  // PENDING
  const handleTableChange = (pagination, filters, sorter, extra) => {
    if (sorter.order === 'ascend') {
      setSort(sorter.field + ' asc')
    } else if (sorter.order === 'descend') {
      setSort(sorter.field + ' desc')
    } else if (sorter.order === undefined) {
      setSort(initialState.sort)
    }
  }

  const handleCallbackFunc = (event: any, action: string, recordId?: any, data?: any) => {
    if (event === null || event === undefined || event === '') {
      event = event ? event : 'singleAction'
    } else if (event == 'singleAction' && action == 'reloadView') {
      handleReloadView()
    } else if (event == 'singleAction' && action == 'reloadForm') {
      handleReloadForm()
    } else if (event == 'singleAction' && action == 'reloadListing') {
      handleReloadListing()
    } else if (event == 'singleAction' && action == 'resetListing') {
      handleReset()
    }
  }
  const handleOnChanged = (fieldName: string, value: any, text?: any) => {
    if (fieldName === 'selected_row_keys') {
      setSelectedRowKeys(value)
    } else if (fieldName === 'search') {
      setSearch(value)
    } else if (fieldName === 'view_type') {
      setView(value)
    } else if (fieldName === 'pagination_change_page_and_size') {
      setPagination({
        ...pagination,
        currentPage: value,
        pageSize: text,
      })
    }
  }

  const handleSubmit = (values: any) => {
    setFilters({
      ...values,
    })
  }

  return (
    <div className='card'>
      <Form
        {...formItemLayout}
        form={formRef}
        layout='vertical'
        name='exampleListingFilterForm'
        initialValues={initialValues}
      >
        <ItemLowStockListFilter
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
        <ListingComponent
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
        <ItemLowStockListPagination
          pagination={pagination}
          totalCount={totalCount}
          handleOnChanged={handleOnChanged}
        />
      </Form>
    </div>
  )
}

export default ItemLowStockListController
