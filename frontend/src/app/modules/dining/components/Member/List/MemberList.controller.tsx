import React, {FC, useEffect, useState} from 'react'
import {useLocation} from 'react-router-dom'
import {parse} from 'query-string'
import {Form} from 'antd'
import {MemberApi} from 'src/app/api'
import MemberListFilter from './MemberList.filter'
import MemberListing from './MemberList.listing'
import MemberListPagination from './MemberList.pagination'
import MemberViewController from '../View/MemberView.controller'
import MemberFormController from '../Form/MemberForm.controller'
import MemberCandidatePicker from '../Candidate/MemberCandidatePicker'
import {useCrudListService} from 'src/app/hooks/crud/useCrudListService'

const initialState = {
  search: '',
  entity: {},
  entityId: null,
  listData: [],
  filters: {
    status: '',
    member_type: '',
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
    delete_success: 'Delete member successfully.',
    delete_confirm_title: 'Delete Member',
    delete_confirm: 'Are you sure you want to delete this member?',
    delete_bulk_select: 'Please select item(s)',
    delete_bulk_confirm: 'Are you sure you wish to delete selected members?',
  },
}

const MemberListController: FC<any> = (props) => {
  const location = useLocation()
  const queryParams = parse(location.search)

  const queryState = {
    filters: {
      status: queryParams?.status || initialState.filters.status,
      member_type: queryParams?.member_type || initialState.filters.member_type,
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
  } = useCrudListService(MemberApi, queryState, initialState, props)

  const [isCandidatePickerOpen, setIsCandidatePickerOpen] = useState(false)
  const [candidatePrefill, setCandidatePrefill] = useState<any>(null)

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
    if (filters.status) {
      urlObject.status = filters.status
    }
    if (filters.member_type) {
      urlObject.member_type = filters.member_type
    }
    BaseCrudListService.handleUrl(urlObject)
  }

  const processFilters = (): string => {
    let filterString = '1=1'

    if (filters.status) {
      filterString += " AND status='" + filters.status + "'"
    }
    if (filters.member_type) {
      filterString += " AND member_type='" + filters.member_type + "'"
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
    if (fieldName === 'filter_member_type') {
      setFilters({
        ...filters,
        member_type: value,
      })
    }
    BaseCrudListService.handleOnChanged(fieldName, value, text)
  }

  const handleCallbackFunc = (event: any, action: string, recordId?: any, data?: any) => {
    BaseCrudListService.handleCallbackFunc(event, action, recordId, data)
  }

  const openCandidatePicker = () => {
    setIsCandidatePickerOpen(true)
  }

  const handlePickCandidate = (candidate: any) => {
    setCandidatePrefill({
      member_type: candidate.member_type,
      name: candidate.name,
      staff_id: candidate.staff_id ?? null,
      roll_no: candidate.roll_no ?? null,
      candidate_id: candidate.id,
    })
    setIsCandidatePickerOpen(false)
    handleCallbackFunc(null, 'add')
  }

  return (
    <div className='card'>
      <Form form={formRef} name='memberListingFilterForm' initialValues={initialValues}>
        <MemberListFilter
          filters={filters}
          handleOnChanged={handleOnChanged}
          handleCallbackFunc={handleCallbackFunc}
          onOpenCandidatePicker={openCandidatePicker}
        />
        <MemberListing
          loading={loading}
          listData={listData}
          reloadListing={reloadListing}
          selectedRowKeys={selectedRowKeys}
          onChangeSwitchToggle={onChangeSwitchToggle}
          handleOnChanged={handleOnChanged}
          handleTableChange={handleTableChange}
          handleCallbackFunc={handleCallbackFunc}
        />
        <MemberListPagination
          pagination={pagination}
          totalCount={totalCount}
          handleOnChanged={handleOnChanged}
        />
      </Form>
      <MemberViewController
        entityId={entityId}
        reloadView={reloadView}
        isShowView={isShowView}
        handleCallbackFunc={handleCallbackFunc}
      />
      <MemberFormController
        entityId={entityId}
        reloadForm={reloadForm}
        isShowForm={isShowForm}
        handleCallbackFunc={handleCallbackFunc}
        prefillFields={candidatePrefill}
        onPrefillConsumed={() => setCandidatePrefill(null)}
      />
      <MemberCandidatePicker
        open={isCandidatePickerOpen}
        onClose={() => setIsCandidatePickerOpen(false)}
        onPick={handlePickCandidate}
      />
    </div>
  )
}

export default MemberListController
