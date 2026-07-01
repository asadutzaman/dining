import queryString, {parse} from 'query-string'
import React, {useRef, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {AntModal, EnumUtils, Message} from '../../utils'
import {useForm} from '../useForm'
import {useLang} from '../useLang'

export const useCrudListService = (
  CrudServiceApi: any,
  queryState: any = {},
  initialState: any = {},
  props: any = {}
) => {
  const {t} = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = parse(location.search)
  const payload = useRef<any>({})

  queryState = {
    search: queryParams?.q || initialState.search,
    filters: {
      ...queryState.filters,
    },
    pagination: {
      currentPage: queryParams?.page || initialState.pagination.currentPage,
      pageSize: queryParams?.pageSize || initialState.pagination.pageSize,
    },
    sort: queryParams?.sort || initialState.sort,
    view: queryParams?.view || initialState.view,
    isShowView: queryParams?.isShowView || initialState.isShowView,
    isShowForm: queryParams?.isShowForm || initialState.isShowForm,
    // isShowModalForm: queryParams?.isShowModalForm || initialState.isShowModalForm,
    entity: queryParams?.entity || initialState.entity,
    entityId: queryParams?.entityId || initialState.entityId,
  }

  const [listData, setListData] = useState<any[]>(initialState.listData)
  const [view, setView] = useState(queryState.view)
  const [search, setSearch] = useState<any>(queryState.search)
  const [filters, setFilters] = useState<any>(queryState.filters)
  const [sort, setSort] = useState(queryState.sort)
  const [pagination, setPagination] = React.useState<any>(queryState.pagination)
  const [totalCount, setTotalCount] = useState(initialState.totalCount)
  const [loading, setLoading] = useState(initialState.loading)
  const [entity, setEntity] = useState(queryState.entity)
  const [entityId, setEntityId] = useState(queryState.entityId)
  const [isShowView, setIsShowView] = useState(queryState.isShowView)
  const [isShowForm, setIsShowForm] = useState(queryState.isShowForm)
  const [selectedRowKeys, setSelectedRowKeys] = React.useState(initialState.selectedRowKeys)
  const [bulkAction, setBulkAction] = React.useState(initialState.bulkAction)
  const [reloadListing, setReloadListing] = useState<number>(Date.now())
  const [reloadView, setReloadView] = useState<number>(Date.now())
  const [reloadForm, setReloadForm] = useState<number>(Date.now())

  const [isShowModalForm, setIsShowModalForm] = useState<{[key: string]: boolean}>(
    initialState.modalFormType
  )

  const {formRef, initialValues, resetForm, setErrors} = useForm({
    search: initialState.search,
    ...initialState.filters,
  })

  const loadData = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoading(true)
      CrudServiceApi.list(payload.current)
        .then((res: any) => {
          setListData(res.data.results)
          setTotalCount(res.data.meta.totalCount)
          setLoading(false)
          resolve(res)
        })
        .catch((err: any) => {
          if (err?.status === 409) {
            setErrors(err.data)
          } else if (err?.status === 412) {
            setErrors(err.data)
          } else if (err?.status === 422) {
            Message.error(err.data)
          } else {
            Message.error(t('A network error occurred. Please try again later.'))
          }
          setLoading(false)
          reject(err)
        })
    })
  }

  const handleDelete = (value: any, action: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (value && action === 'ok') {
        setLoading(true)
        CrudServiceApi.delete(value)
          .then((res: any) => {
            Message.success(t(initialState.message.delete_success))
            handleHideView()
            handleReloadListing()
            setLoading(false)
            resolve(res)
          })
          .catch((err: any) => {
            if (err?.status === 409) {
              setErrors(err.data)
            } else if (err?.status === 412) {
              setErrors(err.data)
            } else if (err?.status === 422) {
              Message.error(err.data)
            } else {
              Message.error(t('A network error occurred. Please try again later.'))
            }
            setLoading(false)
            resolve(null)
          })
      } else {
        resolve(undefined)
      }
    })
  }

  const executeBulkAction = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoading(true)
      const payload = {
        ...bulkAction,
      }
      CrudServiceApi.bulk(payload)
        .then((res: any) => {
          handleReloadListing()
          setLoading(false)
          resolve(res)
        })
        .catch((err: any) => {
          if (err?.status === 409) {
            setErrors(err.data)
          } else if (err?.status === 412) {
            setErrors(err.data)
          } else if (err?.status === 422) {
            Message.error(err.data)
          } else {
            Message.error(t('A network error occurred. Please try again later.'))
          }
          setLoading(false)
          reject(err)
        })
    })
  }

  const handleUrl = (urlObject: any = {}): void => {
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
    // if (isShowModalForm) {
    //     urlObject.isShowModalForm = isShowModalForm
    // }
    if (Object.keys(urlObject).length) {
      navigate({search: queryString.stringify(urlObject)})
    } else {
      navigate(`${location.pathname}`)
    }
  }

  const processFilters = (filterString: any = {}): string => {
    return filterString
  }

  const processQueryParams = (filterString: any = {}) => {
    return filterString
  }

  const processOrderBy = (orderByString: any = {}): string => {
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

  const handleBulkActions = (action: string) => {
    if (selectedRowKeys.length === 0) {
      Message.error(t(initialState.message.delete_bulk_select))
      return
    }
    if (action === 'active') {
      setBulkAction({
        ...bulkAction,
        action: 'update_boolean',
        field: 'status',
        value: '1',
        ids: selectedRowKeys,
      })
    } else if (action === 'inactive') {
      setBulkAction({
        ...bulkAction,
        action: 'update_boolean',
        field: 'status',
        value: '0',
        ids: selectedRowKeys,
      })
    } else if (action === 'delete') {
      AntModal.confirm(
        t(initialState.message.delete_confirm_title),
        t(initialState.message.delete_bulk_confirm),
        selectedRowKeys,
        confirmBulkDelete,
        t('Delete'),
        t('Cancel')
      )
    }
  }

  const confirmBulkDelete = (value: any, action: any) => {
    if (value && action === 'ok') {
      setBulkAction({
        ...bulkAction,
        action: 'delete',
        ids: value,
      })
    }
  }

  const handleActions = (action: string, recordId?: any, data?: any) => {
    const record = listData.find((item) => item.id === Number(recordId))
    setEntity(record)

    if (action === 'view') {
      setEntityId(recordId)
      setIsShowView(true)
    } else if (action === 'add') {
      setEntityId(null)
      setIsShowForm(true)
      handleReloadForm()
    } else if (action === 'edit') {
      setEntityId(recordId)
      setIsShowForm(true)
      handleReloadForm()
    } else if (action === 'modalUpdateForm') {
      // DATA LIKE THIS { modalFormType: enum, whichModal: modalName}
      setEntityId(recordId)
      setIsShowModalForm((prev) => {
        let updateFormType: any = {}
        EnumUtils.getEnumValues(data.modalFormType).map((item) => (updateFormType[item] = false))
        return {
          ...updateFormType,
          [data.whichModal]: true,
        }
      })
      handleReloadForm()
    } else if (action === 'delete') {
      AntModal.confirm(
        t(initialState.message.delete_confirm_title),
        t(initialState.message.delete_confirm),
        recordId,
        handleDelete,
        t('Delete'),
        t('Cancel')
      )
    }
  }

  const handleReset = () => {
    setSearch(initialState.search)
    setPagination({
      currentPage: initialState.pagination.currentPage,
      pageSize: initialState.pagination.pageSize,
    })
    setSort(initialState.sort)
    setView(initialState.view)
    setFilters({status: initialState.filters.status})
    resetForm()
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

  const handleTableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
    if (sorter.order === 'ascend') {
      setSort(sorter.field + ' asc')
    } else if (sorter.order === 'descend') {
      setSort(sorter.field + ' desc')
    } else if (sorter.order === undefined) {
      setSort(initialState.sort)
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

  const handleHideView = () => {
    setIsShowView(false)
    if (isShowForm === false) {
      setEntityId(null)
    }
  }

  const handleHideForm = () => {
    setIsShowForm(false)
    if (isShowView === false) {
      setEntityId(null)
    }
  }
  const handleHideModalUpdateForm = (data: any) => {
    // DATA LIKE THIS { modalFormType: enum, whichModal: modalName}
    setIsShowModalForm((prev) => {
      let updateFormType: any = {}
      EnumUtils.getEnumValues(data.modalFormType).map((item) => (updateFormType[item] = false))
      return {
        ...updateFormType,
      }
    })
    // setIsShowModalForm(false);
    // if (isShowModalForm === false) {
    setEntityId(null)
    // }
  }

  const updateListItem = (recordId: any, data: any) => {
    setListData((listData) => {
      const index = listData.findIndex((item) => item.id === Number(recordId))
      listData[index] = {...listData[index], ...data}
      return [...listData]
    })
  }

  const handleCallbackFunc = (event: any, actionType: string, recordId?: any, data?: any) => {
    if (event === null || event === undefined || event === '') {
      event = event ? event : 'singleAction'
    }
    if (actionType === null || actionType === undefined || actionType === '') {
      actionType = actionType ? actionType : ''
    }
    if (event === 'singleAction' && actionType === 'add') {
      handleActions('add')
    } else if (event === 'singleAction' && actionType === 'edit') {
      handleActions('edit', recordId)
    } else if (event === 'singleAction' && actionType === 'view') {
      handleActions('view', recordId)
    } else if (event === 'singleAction' && actionType === 'modalUpdateForm') {
      handleActions('modalUpdateForm', recordId, data)
    } else if (event === 'singleAction' && actionType === 'delete') {
      handleActions('delete', recordId)
    } else if (event === 'singleAction' && actionType === 'hideView') {
      handleHideView()
    } else if (event === 'singleAction' && actionType === 'hideForm') {
      handleHideForm()
    } else if (event === 'singleAction' && actionType === 'hideModalUpdateForm') {
      handleHideModalUpdateForm(data)
    } else if (event === 'singleAction' && actionType === 'reloadView') {
      handleReloadView()
    } else if (event === 'singleAction' && actionType === 'reloadForm') {
      handleReloadForm()
    } else if (event === 'singleAction' && actionType === 'reloadListing') {
      handleReloadListing()
    } else if (event === 'singleAction' && actionType === 'resetListing') {
      handleReset()
    } else if (event === 'singleAction' && actionType === 'updateListItem') {
      updateListItem(recordId, data)
    } else if (event === 'bulkAction' && actionType) {
      handleBulkActions(actionType)
    }
  }

  const hookState = {
    listData,
    setListData,
    view,
    search,
    setSearch,
    filters,
    sort,
    pagination,
    totalCount,
    setTotalCount,
    loading,
    setLoading,
    entity,
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
    formRef,
    initialValues,
    payload,
    setFilters,
  }

  const hookMethod = {
    loadData,
    handleDelete,
    executeBulkAction,
    handleUrl,
    processFilters,
    processQueryParams,
    processOrderBy,
    handlePayload,
    onChangeSwitchToggle,
    handleBulkActions,
    confirmBulkDelete,
    handleActions,
    handleReset,
    handleReloadListing,
    handleReloadForm,
    handleReloadView,
    handleTableChange,
    handleOnChanged,
    handleHideView,
    handleHideForm,
    handleHideModalUpdateForm,
    updateListItem,
    handleCallbackFunc,
    resetForm,
  }

  return {
    ...hookState,
    BaseCrudListService: {
      ...hookState,
      ...hookMethod,
    },
  }
}
