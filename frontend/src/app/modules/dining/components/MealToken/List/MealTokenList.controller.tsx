import React, {FC, useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import {parse} from 'query-string'
import {Form} from 'antd'
import {MealTokenApi} from 'src/app/api'
import MealTokenListFilter from './MealTokenList.filter'
import MealTokenListing from './MealTokenList.listing'
import MealTokenListPagination from './MealTokenList.pagination'
import MealTokenViewController from '../View/MealTokenView.controller'
import {useCrudListService} from 'src/app/hooks/crud/useCrudListService'

const initialState = {
  search: '',
  entity: {},
  entityId: null,
  listData: [],
  filters: {
    meal_type: '',
    payment_status: '',
    collection_status: '',
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
    delete_success: 'Delete token successfully.',
    delete_confirm_title: 'Delete Token',
    delete_confirm: 'Are you sure you want to delete this token? Any due balance from this token will be reversed.',
    delete_bulk_select: 'Please select item(s)',
    delete_bulk_confirm: 'Are you sure you wish to delete selected tokens?',
  },
}

const MealTokenListController: FC<any> = (props) => {
  const location = useLocation()
  const queryParams = parse(location.search)

  const queryState = {
    filters: {
      meal_type: queryParams?.meal_type || initialState.filters.meal_type,
      payment_status: queryParams?.payment_status || initialState.filters.payment_status,
      collection_status: queryParams?.collection_status || initialState.filters.collection_status,
    },
  }

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
  } = useCrudListService(MealTokenApi, queryState, initialState, props)

  useEffect(() => {
    initData()
  }, [search, filters, sort, pagination, reloadListing])

  useEffect(() => {
    handleUrl()
  }, [entityId, isShowView, isShowForm])

  const initData = async () => {
    await handleUrl()
    await handlePayload()
    await loadData()
  }

  const loadData = (): Promise<any> => {
    return BaseCrudListService.loadData()
  }

  const handleUrl = (): void => {
    let urlObject: any = {}

    if (search) {
      urlObject.q = search
    }
    if (filters.meal_type) {
      urlObject.meal_type = filters.meal_type
    }
    if (filters.payment_status) {
      urlObject.payment_status = filters.payment_status
    }
    if (filters.collection_status) {
      urlObject.collection_status = filters.collection_status
    }
    BaseCrudListService.handleUrl(urlObject)
  }

  const processFilters = (): string => {
    let filterString = '1=1'

    if (filters.meal_type) {
      filterString += " AND meal_type='" + filters.meal_type + "'"
    }
    if (filters.payment_status) {
      filterString += " AND payment_status='" + filters.payment_status + "'"
    }
    if (filters.collection_status) {
      filterString += " AND collection_status='" + filters.collection_status + "'"
    }

    return BaseCrudListService.processFilters(filterString)
  }

  const processQueryParams = () => {
    let filterString = {}
    return BaseCrudListService.processQueryParams(filterString)
  }

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

  const handleTableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
    BaseCrudListService.handleTableChange(pagination, filters, sorter, extra)
  }

  const handleOnChanged = (fieldName: string, value: any, text?: any) => {
    if (fieldName === 'filter_meal_type') {
      setFilters({...filters, meal_type: value})
    }
    if (fieldName === 'filter_payment_status') {
      setFilters({...filters, payment_status: value})
    }
    if (fieldName === 'filter_collection_status') {
      setFilters({...filters, collection_status: value})
    }
    BaseCrudListService.handleOnChanged(fieldName, value, text)
  }

  const handleCallbackFunc = (event: any, action: string, recordId?: any, data?: any) => {
    BaseCrudListService.handleCallbackFunc(event, action, recordId, data)
  }

  return (
    <div className='card'>
      <Form form={formRef} name='mealTokenListingFilterForm' initialValues={initialValues}>
        <MealTokenListFilter
          filters={filters}
          handleOnChanged={handleOnChanged}
          handleCallbackFunc={handleCallbackFunc}
        />
        <MealTokenListing
          loading={loading}
          listData={listData}
          reloadListing={reloadListing}
          selectedRowKeys={selectedRowKeys}
          handleOnChanged={handleOnChanged}
          handleTableChange={handleTableChange}
          handleCallbackFunc={handleCallbackFunc}
        />
        <MealTokenListPagination
          pagination={pagination}
          totalCount={totalCount}
          handleOnChanged={handleOnChanged}
        />
      </Form>
      <MealTokenViewController
        entityId={entityId}
        reloadView={reloadView}
        isShowView={isShowView}
        handleCallbackFunc={handleCallbackFunc}
      />
    </div>
  )
}

export default MealTokenListController
