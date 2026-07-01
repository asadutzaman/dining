import React, {FC, useEffect, useState} from 'react'
import {useLocation, useParams} from 'react-router-dom'
import {parse} from 'query-string'
import {Form} from 'antd'
import RequisitionItemLimitListFilter from './RequisitionItemLimitList.filter'
import RequisitionItemLimitListing from './RequisitionItemLimitList.listing'
import RequisitionItemLimitListPagination from './RequisitionItemLimitList.pagination'
import RequisitionItemLimitViewController from '../View/RequisitionItemLimitView.controller'
import RequisitionItemLimitFormController from '../Form/RequisitionItemLimitForm.controller'
import {useCrudListService} from 'src/app/hooks/crud/useCrudListService'
import {RequisitionItemLimitApi} from 'src/app/api'

const initialState = {
  search: '',
  entity: {},
  entityId: null,
  listData: [],
  filters: {
    limit_type: null,
    designationId: null,
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
    delete_success: 'Delete Requisition Item Limit successfully.',
    delete_confirm_title: 'Delete Requisition Item Limit',
    delete_confirm: 'Are you sure you want to delete this Requisition Item Limit?',
    delete_bulk_select: 'Please select item(s)',
    delete_bulk_confirm: 'Are you sure you wish to delete selected Requisition Item Limit?',
  },
}

const RequisitionItemLimitListController: FC<any> = (props) => {
  const location = useLocation()
  const queryParams = parse(location.search)
  const {designationId} = useParams()

  const queryState = {
    filters: {
      limit_type: queryParams?.limit_type || initialState.filters.limit_type,
      designationId: designationId,
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
  } = useCrudListService(RequisitionItemLimitApi, queryState, initialState, props)

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
    if (filters.limit_type) {
      urlObject.limit_type = filters.limit_type
    }

    BaseCrudListService.handleUrl(urlObject)
  }

  const processFilters = (): string => {
    let filterString = '1=1'

    if (filters.designationId) {
      filterString += ' AND designation_id=' + filters.designationId
    }
    if (filters.limit_type) {
      filterString += " AND limit_type='" + filters.limit_type + "'"
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
    if (fieldName === 'limit_type') {
      setFilters({
        ...filters,
        limit_type: value,
      })
    }
    BaseCrudListService.handleOnChanged(fieldName, value, text)
  }

  const handleCallbackFunc = (event: any, action: string, recordId?: any, data?: any) => {
    BaseCrudListService.handleCallbackFunc(event, action, recordId, data)
  }

  return (
    <div className='card'>
      <Form form={formRef} name='exampleListingFilterForm' initialValues={initialValues}>
        <RequisitionItemLimitListFilter
          filters={filters}
          handleOnChanged={handleOnChanged}
          handleCallbackFunc={handleCallbackFunc}
        />
        <RequisitionItemLimitListing
          loading={loading}
          listData={listData}
          reloadListing={reloadListing}
          selectedRowKeys={selectedRowKeys}
          onChangeSwitchToggle={onChangeSwitchToggle}
          handleOnChanged={handleOnChanged}
          handleTableChange={handleTableChange}
          handleCallbackFunc={handleCallbackFunc}
        />
        <RequisitionItemLimitListPagination
          pagination={pagination}
          totalCount={totalCount}
          handleOnChanged={handleOnChanged}
        />
      </Form>
      <RequisitionItemLimitViewController
        entityId={entityId}
        reloadView={reloadView}
        isShowView={isShowView}
        handleCallbackFunc={handleCallbackFunc}
      />
      <RequisitionItemLimitFormController
        entityId={entityId}
        reloadForm={reloadForm}
        isShowForm={isShowForm}
        handleCallbackFunc={handleCallbackFunc}
        designationId={designationId}
      />
    </div>
  )
}

export default RequisitionItemLimitListController
