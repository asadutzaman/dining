import React, {FC, useEffect, useRef, useState} from 'react'
import {useNavigate, useLocation} from 'react-router-dom'
import {Form} from 'antd'
import queryString, {parse} from 'query-string'
import {AntModal} from 'src/app/utils'
import WorkflowListFilter from './WorkflowList.filter'
import WorkflowListing from './WorkflowList.listing'
import WorkflowListPagination from './WorkflowList.pagination'
import {useForm} from 'src/app/hooks/useForm'
import WorkflowViewController from '../View/WorkflowView.controller'
import WorkflowFormController from '../Form/WorkflowForm.controller'
import {WorkflowApi} from 'src/app/api'
import {useErrorHandler} from 'src/app/hooks/useErrorHandler'
import {useLang} from 'src/app/hooks/useLang'
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
}

const WorkflowListController: FC<any> = (props) => {
  const {t} = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = parse(location.search)

  const queryState = {
    search: queryParams?.q || initialState.search,
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
  } = useCrudListService(WorkflowApi, queryState, initialState, props)

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
    let filterString = ''

    if (filters.status) {
      filterString += " status='" + filters.status + "'"
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

  // const handleHideView = () => {
  //   setIsShowView(false)
  //   if (isShowForm === false) {
  //     setEntityId(null)
  //   }
  // }

  // const handleHideForm = () => {
  //   setIsShowForm(false)
  //   if (isShowView === false) {
  //     setEntityId(null)
  //   }
  // }

  // const handleReset = () => {
  //   setSearch(initialState.search)
  //   setFilters({
  //     status: initialState.filters.status,
  //   })
  //   setPagination({
  //     currentPage: initialState.pagination.currentPage,
  //     pageSize: initialState.pagination.pageSize,
  //   })
  //   setSort(initialState.sort)
  //   setView(initialState.view)
  //   resetForm()
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

  // const updateListItem = (recordId: any, data: any) => {
  //   setListData((listData) => {
  //     const index = listData.findIndex((item) => item.id === Number(recordId))
  //     listData[index] = {...listData[index], ...data}
  //     return [...listData]
  //   })
  // }

  return (
    <div className='card'>
      <div className='listing-page-container listing-page-container-resource'>
        <Form form={formRef} name='approvalProcessListingFilterForm' initialValues={initialValues}>
          <WorkflowListFilter
            filters={filters}
            handleOnChanged={handleOnChanged}
            handleCallbackFunc={handleCallbackFunc}
          />
          <WorkflowListing
            loading={loading}
            listData={listData}
            reloadListing={reloadListing}
            selectedRowKeys={selectedRowKeys}
            onChangeSwitchToggle={onChangeSwitchToggle}
            handleOnChanged={handleOnChanged}
            handleTableChange={handleTableChange}
            handleCallbackFunc={handleCallbackFunc}
          />
          <WorkflowListPagination
            pagination={pagination}
            totalCount={totalCount}
            handleOnChanged={handleOnChanged}
          />
        </Form>
        <WorkflowViewController
          entityId={entityId}
          reloadView={reloadView}
          isShowView={isShowView}
          handleCallbackFunc={handleCallbackFunc}
        />
        <WorkflowFormController
          entityId={entityId}
          reloadForm={reloadForm}
          isShowForm={isShowForm}
          handleCallbackFunc={handleCallbackFunc}
        />
      </div>
    </div>
  )
}

export default WorkflowListController
