import React, {FC, useEffect, useState} from 'react'
import {useLocation} from 'react-router-dom'
import {parse} from 'query-string'
import {Form} from 'antd'
import StockTransferApprovalListFilter from './StockTransferApprovalList.filter'
import StockTransferApprovalListing from './StockTransferApprovalList.listing'
import StockTransferApprovalListPagination from './StockTransferApprovalList.pagination'
import StockTransferApprovalViewController from '../View/StockTransferApprovalView.controller'
import {useCrudListService} from 'src/app/hooks/crud/useCrudListService'
import {StockTransferApprovalApi} from 'src/app/api'
import {useWorkflow} from 'src/app/hooks/workflow/useWorkflow'
import {useWorkflowActiveStep} from 'src/app/hooks/workflow/useWorkflowActiveStep'

const initialState = {
  search: '',
  entity: {},
  entityId: null,
  workflowInfo: {
    workflowType: 'StockTransfer',
    workflowCode: 'STOCK_TRANSFER_APPROVAL',
    workflowName: 'Stock Transfer Approval',
  },
  listData: [],
  filters: {
    status: '',
    workflow_step: '',
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
    delete_success: 'Delete Stock Transfer successfully.',
    delete_confirm_title: 'Delete StockTransferApproval',
    delete_confirm: 'Are you sure you want to delete this Stock Transfer?',
    delete_bulk_select: 'Please select item(s)',
    delete_bulk_confirm: 'Are you sure you wish to delete selected Stock Transfer?',
  },
}

const StockTransferApprovalListController: FC<any> = (props) => {
  const location = useLocation()
  const queryParams = parse(location.search)

  const queryState = {
    filters: {
      status: queryParams?.status || initialState.filters.status,
      workflow_step: queryParams?.workflow_step || initialState.filters.workflow_step,
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
  } = useCrudListService(StockTransferApprovalApi, queryState, initialState, props)

  const {workflowData, workflowLoading} = useWorkflow(
    initialState.workflowInfo.workflowType,
    initialState.workflowInfo.workflowCode
  )
  const [activeStep, setActiveStep] = useState<string>('')
  const [activeStepRecordQty, setActiveStepRecordQty] = useState<number>(0)

  const {
    activeStepData,
    getMyWorkflowActiveStepFilters,
    activeStepActionList,
    workflowNextStepApproverList,
  } = useWorkflowActiveStep(workflowData, activeStep)

  useEffect(() => {
    if (workflowData && activeStep === '') {
      const firstActiveStep =
        workflowData.workflow_steps?.find((step) => step.myStep)?.step_code || ''

      if (firstActiveStep) {
        handleStepChange(firstActiveStep)
      }
    }
  }, [workflowData, activeStep])

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
    try {
      await handleUrl()
      await handlePayload()
      await loadData()
    } catch (error: any) {
      console.error('Error initializing data:', error)
    }
  }

  const loadData = (): Promise<any> => {
    return BaseCrudListService.loadData().then((res) => {
      setActiveStepRecordQty(res.data.results.length || 0)
    })
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
    if (filters.workflow_step) {
      urlObject.workflow_step = filters.workflow_step
    }
    BaseCrudListService.handleUrl(urlObject)
  }

  const processFilters = (): string => {
    let filterString = '1=1'

    if (filters.status) {
      filterString += ` AND status='${filters.status}'`
    }
    if (filters.workflow_step) {
      filterString += getMyWorkflowActiveStepFilters(filters.workflow_step, ['process_status'])
    }

    return BaseCrudListService.processFilters(filterString)
  }

  const processQueryParams = () => {
    let filterString = {
      workflow_step: '' as any,
    }
    if (filters.workflow_step) {
      const activeStepInfo = workflowData.workflow_steps?.find(
        (step: any) => step.step_code === filters.workflow_step
      )
      filterString.workflow_step = activeStepInfo.id || ''
    }
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
    if (fieldName === 'workflow_step') {
      setFilters({
        ...filters,
        workflow_step: value,
      })
    }
    BaseCrudListService.handleOnChanged(fieldName, value, text)
  }

  const handleCallbackFunc = (event: any, action: string, recordId?: any, data?: any) => {
    BaseCrudListService.handleCallbackFunc(event, action, recordId, data)
  }

  const handleStepChange = (value: any) => {
    setActiveStep(value)
    setActiveStepRecordQty(0)
  }

  return (
    <div className='card'>
      <Form form={formRef} name='exampleListingFilterForm' initialValues={initialValues}>
        <StockTransferApprovalListFilter
          filters={filters}
          handleOnChanged={handleOnChanged}
          handleCallbackFunc={handleCallbackFunc}
          workflowData={workflowData}
          activeStep={activeStep}
          workflowLoading={workflowLoading}
          handleStepChange={handleStepChange}
          activeStepRecordQty={activeStepRecordQty}
        />
        <StockTransferApprovalListing
          loading={loading}
          listData={listData}
          reloadListing={reloadListing}
          selectedRowKeys={selectedRowKeys}
          onChangeSwitchToggle={onChangeSwitchToggle}
          handleOnChanged={handleOnChanged}
          handleTableChange={handleTableChange}
          handleCallbackFunc={handleCallbackFunc}
        />
        <StockTransferApprovalListPagination
          pagination={pagination}
          totalCount={totalCount}
          handleOnChanged={handleOnChanged}
        />
      </Form>
      <StockTransferApprovalViewController
        entityId={entityId}
        reloadView={reloadView}
        isShowView={isShowView}
        handleCallbackFunc={handleCallbackFunc}
        workflowLoading={workflowLoading}
        workflowData={workflowData}
        workflowActiveStep={activeStepData}
        activeStepActionList={activeStepActionList}
        workflowNextStepApproverList={workflowNextStepApproverList}
      />
    </div>
  )
}

export default StockTransferApprovalListController
