import React, {FC, useEffect} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {Form} from 'antd'
import {parse} from 'query-string'
import GroupListFilter from './GroupList.filter'
import GroupListing from './GroupList.listing'
import GroupListPagination from './GroupList.pagination'
import GroupViewController from '../View/GroupView.controller'
import GroupFormController from '../Form/GroupForm.controller'
import {GroupApi} from 'src/app/api'
import {useCrudListService} from 'src/app/hooks/crud/useCrudListService'

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
  sort: 'name asc',
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
    delete_success: 'Delete example successfully.',
    delete_confirm_title: 'Delete Example',
    delete_confirm: 'Are you sure you want to delete this example?',
    delete_bulk_select: 'Please select item(s)',
    delete_bulk_confirm: 'Are you sure you wish to delete selected examples?',
  },
}

const GroupListController: FC<any> = (props) => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = parse(location.search)

  const queryState = {
    filters: {
      status: queryParams?.status || initialState.filters.status,
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
  } = useCrudListService(GroupApi, queryState, initialState, props)

  useEffect(() => {
    initData()
  }, [search, filters, sort, pagination, reloadListing])

  useEffect(() => {
    handleUrl()
  }, [entityId, isShowView, isShowForm])

  useEffect(() => {
    if (bulkAction.action !== '') {
      executeBulkAction()
    }
  }, [bulkAction])

  const initData = async () => {
    await handleUrl()
    await handlePayload()
    await loadData()
  }

  const loadData = (): Promise<any> => {
    return BaseCrudListService.loadData()
  }

  const executeBulkAction = (): Promise<any> => {
    return BaseCrudListService.executeBulkAction()
  }

  const handleUrl = (): void => {
    let urlObject: any = {}

    if (search) {
      urlObject.q = search
    }
    if (filters.status) {
      urlObject.status = filters.status
    }
    BaseCrudListService.handleUrl(urlObject)
  }

  const processFilters = (): string => {
    let filterString = '1=1'

    if (filters.status) {
      filterString += " AND status='" + filters.status + "'"
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

  const onChangeSwitchToggle = (checked: any, record: any) => {
    BaseCrudListService.onChangeSwitchToggle(checked, record)
  }

  const handleTableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
    BaseCrudListService.handleTableChange(pagination, filters, sorter, extra)
  }

  const handleOnChanged = (fieldName: string, value: any, text?: any) => {
    if (fieldName === 'filter_status') {
      setFilters({
        ...filters,
        status: value,
      })
    }
    BaseCrudListService.handleOnChanged(fieldName, value, text)
  }

  const handleCallbackFunc = (event: any, action: string, recordId?: any, data?: any) => {
    BaseCrudListService.handleCallbackFunc(event, action, recordId, data)
  }

  return (
    <div className='card'>
      <div className='listing-page-container listing-page-container-resource'>
        <Form form={formRef} name='resourceListingFilterForm' initialValues={initialValues}>
          <GroupListFilter
            filters={filters}
            handleOnChanged={handleOnChanged}
            handleCallbackFunc={handleCallbackFunc}
          />
          <GroupListing
            loading={loading}
            listData={listData}
            reloadListing={reloadListing}
            selectedRowKeys={selectedRowKeys}
            onChangeSwitchToggle={onChangeSwitchToggle}
            handleOnChanged={handleOnChanged}
            handleTableChange={handleTableChange}
            handleCallbackFunc={handleCallbackFunc}
          />
          <GroupListPagination
            pagination={pagination}
            totalCount={totalCount}
            handleOnChanged={handleOnChanged}
          />
        </Form>
        <GroupViewController
          entityId={entityId}
          reloadView={reloadView}
          isShowView={isShowView}
          handleCallbackFunc={handleCallbackFunc}
        />
        <GroupFormController
          entityId={entityId}
          reloadForm={reloadForm}
          isShowForm={isShowForm}
          handleCallbackFunc={handleCallbackFunc}
        />
      </div>
    </div>
  )
}

export default GroupListController
