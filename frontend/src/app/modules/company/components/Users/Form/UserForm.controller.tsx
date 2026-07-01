import React, {FC, useEffect, useState} from 'react'
import {BranchApi, UserApi} from 'src/app/api'
import {useCrudFormService} from 'src/app/hooks/crud/useCrudFormService'
import DrawerForm from 'src/app/components/Drawer/DrawerForm'
import UserForm from './UserForm.form'
import {useErrorHandler} from 'src/app/hooks/useErrorHandler'

const initialState = {
  modalTitle: 'Create User',
  itemData: {},
  fields: {
    name: null,
    email: null,
    phone: null,
    password: null,
    employee_id: null,
    designation_id: null,
    logistic_id: null,
    branch_id: null,
    department_id: null,
    role_ids: [],
    // organization_ids: [],
    // organogram_ids: [],
    status: 1,
  },
  isNewRecord: true,
  permissionType: 'RESOURCE',
  loading: false,
  message: {
    network_error: 'A network error occurred. Please try again later.',
    create_success: 'The operation performed successfully.',
    update_success: 'The operation performed successfully.',
  },
}

const UserFormController: FC<any> = (props) => {
  const {
    BaseCrudFormService,
    entityId,
    modalTitle,
    setModalTitle,
    isNewRecord,
    setIsNewRecord,
    isShowForm,
    reloadForm,
    itemData,
    loading,
    resetForm,
    isSubmitting,
    formRef,
    initialValues,
    handleChange,
    handleSubmitFailed,
    handleCallbackFunc,
  } = useCrudFormService(UserApi, initialState, props)
  const [branchTreeData, setBranchTreeData] = useState<any[]>([])
  const [checkedKeys, setCheckedKeys] = useState<any[]>([])
  const {handleErrorMessage} = useErrorHandler()

  useEffect(() => {
    loadBranchTree()
    if (entityId && isShowForm) {
      setIsNewRecord(false)
      setModalTitle('Edit User')
      resetForm()
      loadData()
    } else {
      setCheckedKeys([])
      formRef.setFieldsValue({
        branch_id: null,
      })
      resetForm()
      setModalTitle(initialState.modalTitle)
      setIsNewRecord(initialState.isNewRecord)
    }
  }, [entityId, isShowForm, reloadForm])

  const loadData = (): void => {
    BaseCrudFormService.loadData().then((res: any) => {
      const initFormDta = {
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        password: res.data.password,
        employee_id: res.data.employee_id,
        designation_id: res.data.designation_id,
        logistic_id: res.data.logistic_id,
        branch_id: res.data.branch_id,
        department_id: res.data.department_id,
        role_ids: res.data.role_ids?.map((item: any) => Number(item)),
        // organization_ids: res.data.organization_ids?.map((item: any) => Number(item)),
        // organogram_ids: res.data.organogram_ids?.map((item: any) => Number(item)),
        status: res.data.status,
      }
      handleChange(initFormDta)
      formRef.setFieldsValue(initFormDta)

      const branchId = res.data.branch_id
      const checked = [`key-${branchId}`]
      setCheckedKeys(checked)
    })
  }

  const loadBranchTree = () => {
    BranchApi.getBranchTree()
      .then((res) => {
        setBranchTreeData(res.data)
      })
      .catch((err) => {
        handleErrorMessage(err)
      })
  }

  const handleSubmit = async (values: any): Promise<void> => {
    try {
      if (entityId) {
        await handleUpdate(values)
      } else {
        await handleCreate(values)
      }
    } catch (error: any) {
      // console.error('Form submission error:', error)
      handleSubmitFailed(error)
    }
  }

  const handleCreate = (values: any): Promise<any> => {
    const payload = {
      ...values,
    }
    return BaseCrudFormService.handleCreate(payload)
  }

  const handleUpdate = (values: any): Promise<any> => {
    const payload = {
      ...values,
    }
    return BaseCrudFormService.handleUpdate(payload)
  }

  return (
    <div className='form-page-container form-page-container-resource'>
      <DrawerForm
        drawerWidth={'90%'}
        loading={loading}
        isNewRecord={isNewRecord}
        itemData={itemData}
        modalTitle={modalTitle}
        isSubmitting={isSubmitting}
        isShowForm={isShowForm}
        formRef={formRef}
        initialValues={initialValues}
        component={UserForm}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSubmitFailed={handleSubmitFailed}
        handleCallbackFunc={handleCallbackFunc}
        checkedKeys={checkedKeys}
        setCheckedKeys={setCheckedKeys}
        branchTreeData={branchTreeData}
      />
    </div>
  )
}

export default React.memo(UserFormController)
