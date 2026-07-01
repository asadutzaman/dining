import React, {FC, useEffect, useState} from 'react'
import {useLocation} from 'react-router-dom'
import {Form} from 'antd'
import {parse} from 'query-string'
import WorkflowStepListFilter from './WorkflowStepList.filter'
import WorkflowStepListing from './WorkflowStepList.listing'
import {WorkflowStepApi} from 'src/app/api'
// import {WorkflowSetupDataList} from '../../Workflow/data/WorkflowSetup.data'
import {WorkflowSetupDataList} from '../../Workflow/data/WorkflowSetup.data'
import {useLang} from 'src/app/hooks/useLang'
import {useCrudListService} from 'src/app/hooks/crud/useCrudListService'
import WorkflowStepFormController from '../Form/WorkflowStepForm.controller'

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
  sort: 'sort_order asc',
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

const WorkflowStepListController: FC<any> = (props) => {
  const {workflowInfo, workflowId} = props
  const {t} = useLang()
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
  } = useCrudListService(WorkflowStepApi, queryState, initialState, props)

  const commonWorkflowStepSetupData = WorkflowSetupDataList.find(
    (item) => item.WORKFLOW_CODE === 'COMMON_APPLICATION'
  )
  const [workflowStepSetupData, setWorkflowStepSetupData] = useState<any>(
    commonWorkflowStepSetupData
  )

  useEffect(() => {
    if (workflowInfo.workflow_code && WorkflowSetupDataList.length > 0) {
      const filterStepSetupData = WorkflowSetupDataList.find(
        (item) => item.WORKFLOW_CODE === workflowInfo.workflow_code
      )
      if (filterStepSetupData) {
        setWorkflowStepSetupData((prevState) => {
          return {
            ...filterStepSetupData,
            STEP_INFO: filterStepSetupData['STEP_INFO'] || prevState.STEP_INFO,
            PRECONDITION: filterStepSetupData['PRECONDITION'] || prevState.PRECONDITION,
            APPROVERS: filterStepSetupData['APPROVERS'] || prevState.APPROVERS,
            ACTIONS: filterStepSetupData['ACTIONS'] || prevState.ACTIONS,
            TASK: filterStepSetupData['TASK'] || prevState.TASK,
            RECIPIENTS: filterStepSetupData['RECIPIENTS'] || prevState.RECIPIENTS,
          }
        })
      }
    }
  }, [workflowInfo.workflow_code, WorkflowSetupDataList])

  useEffect(() => {
    if (workflowId) {
      initData()
    }
  }, [workflowId, search, filters, sort, reloadListing])

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

    if (workflowId) {
      filterString += " AND workflow_id='" + workflowId + "'"
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
      $expand: '',
      $orderby: processOrderBy(),
      $top: 100,
      $skip: 0,
    }
  }

  const onChangeSwitchToggle = (checked: any, record: any) => {
    BaseCrudListService.onChangeSwitchToggle(checked, record)
  }

  const handleTableChange = (pagination, filters, sorter, extra) => {
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

  // const handleActions = (action: string, recordId?: any) => {
  //   const record = listData.find((item) => item.id === Number(recordId))
  //   setEntity(record)

  //   if (action === 'view') {
  //     setEntityId(recordId)
  //     setIsShowView(true)
  //   } else if (action === 'add') {
  //     setEntityId(null)
  //     setIsShowForm(true)
  //     handleReloadForm()
  //   } else if (action === 'edit') {
  //     setEntityId(recordId)
  //     setIsShowForm(true)
  //     handleReloadForm()
  //   } else if (action === 'delete') {
  //     AntModal.confirm(
  //       t('Delete WorkflowStep'),
  //       t('Are you sure you want to delete this approvalStep?'),
  //       recordId,
  //       handleDelete,
  //       'Delete'
  //     )
  //   }
  // }

  // const handleReset = () => {
  //   setSearch(initialState.search)
  //   setFilters({status: initialState.filters.status})
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

  // const updateListItem = (recordId: any, data: any) => {
  //   setListData((listData) => {
  //     const index = listData.findIndex((item) => item.id === Number(recordId))
  //     listData[index] = {...listData[index], ...data}
  //     return [...listData]
  //   })
  // }

  return (
    <div className='card'>
      <Form form={formRef} name='approvalStepListingFilterForm' initialValues={initialValues}>
        <WorkflowStepListFilter
          filters={filters}
          handleOnChanged={handleOnChanged}
          handleCallbackFunc={handleCallbackFunc}
        />
        <WorkflowStepListing
          loading={loading}
          listData={listData}
          reloadListing={reloadListing}
          selectedRowKeys={selectedRowKeys}
          workflowStepSetupData={workflowStepSetupData}
          onChangeSwitchToggle={onChangeSwitchToggle}
          handleOnChanged={handleOnChanged}
          handleTableChange={handleTableChange}
          handleCallbackFunc={handleCallbackFunc}
        />
      </Form>
      <WorkflowStepFormController
        entityId={entityId}
        reloadForm={reloadForm}
        isShowForm={isShowForm}
        workflowInfo={workflowInfo}
        workflowStepSetupData={workflowStepSetupData}
        handleCallbackFunc={handleCallbackFunc}
        stepLists={listData}
      />
    </div>
  )
}

export default WorkflowStepListController
