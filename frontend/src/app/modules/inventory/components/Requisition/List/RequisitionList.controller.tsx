import React, {FC, useEffect, useState} from 'react'
import {useLocation} from 'react-router-dom'
import {parse} from 'query-string'
import {Form} from 'antd'
import RequisitionListFilter from './RequisitionList.filter'
import RequisitionListing from './RequisitionList.listing'
import RequisitionListPagination from './RequisitionList.pagination'
import RequisitionViewController from '../View/RequisitionView.controller'
import RequisitionFormController from '../Form/RequisitionForm.controller'
import {useCrudListService} from 'src/app/hooks/crud/useCrudListService'
import {RequisitionApi} from 'src/app/api'
import AcknowledgementFormController from '../Block/Acknowledgement/AcknowledgementForm.controller'
import { ModalFormType } from '../ModalFormType.enum'

const initialState = {
  search: '',
  entity: {},
  entityId: null,
  listData: [],
  modalFormType: {
    'ACKNOWLEDGEMENT': false,
  },
  filters: {
    status: '',
    process_status: '',
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
    delete_success: 'Delete requisition successfully.',
    delete_confirm_title: 'Delete Requisition',
    delete_confirm: 'Are you sure you want to delete this requisition?',
    delete_bulk_select: 'Please select item(s)',
    delete_bulk_confirm: 'Are you sure you wish to delete selected requisition?',
  },
}

const RequisitionListController: FC<any> = (props) => {
  const location = useLocation()
  const queryParams = parse(location.search)

  const queryState = {
    filters: {
      status: queryParams?.status || initialState.filters.status,
      process_status: queryParams?.process_status || initialState.filters.process_status,
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
    isShowModalForm,
    selectedRowKeys,
    bulkAction,
    reloadListing,
    reloadView,
    reloadForm,
  } = useCrudListService(RequisitionApi, queryState, initialState, props)

  useEffect(() => {
    if (queryParams.newRequisition) {
      setIsShowForm(true)
    }
  }, [queryParams.newRequisition])

  useEffect(() => {
    initData()
  }, [search, filters, sort, pagination, reloadListing])

  useEffect(() => {
    handleUrl()
  }, [entityId, isShowView, isShowForm, isShowModalForm])

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
    if (filters.process_status) {
      urlObject.process_status = filters.process_status
    }
    BaseCrudListService.handleUrl(urlObject)
  }

  const processFilters = (): string => {
    let filterString = ''

    if (filters.status) {
      filterString += " status='" + filters.status + "'"
    }
    if (filters.process_status) {
      filterString += " process_status='" + filters.process_status + "'"
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
    if (fieldName === 'status') {
      setFilters({
        ...filters,
        status: value,
      })
    }
    if (fieldName === 'process_status') {
      setFilters({
        ...filters,
        process_status: value,
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
        <RequisitionListFilter
          filters={filters}
          handleOnChanged={handleOnChanged}
          handleCallbackFunc={handleCallbackFunc}
        />
        <RequisitionListing
          loading={loading}
          listData={listData}
          reloadListing={reloadListing}
          selectedRowKeys={selectedRowKeys}
          onChangeSwitchToggle={onChangeSwitchToggle}
          handleOnChanged={handleOnChanged}
          handleTableChange={handleTableChange}
          handleCallbackFunc={handleCallbackFunc}
        />
        <RequisitionListPagination
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
      <RequisitionFormController
        entityId={entityId}
        reloadForm={reloadForm}
        isShowForm={isShowForm}
        handleCallbackFunc={handleCallbackFunc}
      />
      <AcknowledgementFormController
          entityId={entityId}
          reloadForm={reloadForm}
          modalFormObject={{ ModalFormType: ModalFormType, whichModal: ModalFormType.REQUEST_ACKNOWLEDGEMENT }}
          isShowModalForm={isShowModalForm[ModalFormType.REQUEST_ACKNOWLEDGEMENT]}
          handleCallbackFunc={handleCallbackFunc}
      />
    </div>
  )
}

export default RequisitionListController
