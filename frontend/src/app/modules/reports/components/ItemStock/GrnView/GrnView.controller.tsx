import React, {FC, useEffect, useState} from 'react'
import {GoodsReceiveNoteApi} from 'src/app/api'
import DrawerView from 'src/app/components/Drawer/DrawerView'
import GrnView from './GrnView.view'
import {useCrudViewService} from 'src/app/hooks/crud/useCrudViewService'
import {useErrorHandler} from 'src/app/hooks/useErrorHandler'

const initialState = {
  modalTitle: 'Goods Receive Note Info',
  listData: [],
  loading: false,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
}

const GrnViewController: FC<any> = (props) => {
  const {
    modalTitle,
    itemData,
    loading,
    setLoading,
    entityId,
    reloadView,
    isShowView,
    handleCallbackFunc,
  } = useCrudViewService(GoodsReceiveNoteApi, initialState, props)
  const [listData, setListData] = useState(initialState.listData)
  const [financialYear, setFinancialYear] = useState('2025-2026')
  const {handleErrorMessage, handleSuccessMessage, showErrorMessage} = useErrorHandler()

  useEffect(() => {
    setListData(initialState.listData)
    if (entityId && isShowView) {
      loadData()
    }
  }, [entityId, reloadView, financialYear])

  const loadData = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoading(true)
      const params = {
        item_id: entityId,
        financial_year: financialYear,
      }
      GoodsReceiveNoteApi.getItemGrnDetails(params)
        .then((res: any) => {
          setListData(res.data.results)
          setLoading(false)
          resolve(res)
        })
        .catch((err: any) => {
          handleErrorMessage(err)
          setLoading(false)
          reject(null)
        })
    })
  }

  return (
    <DrawerView
      loading={loading}
      reloadView={reloadView}
      isShowView={isShowView}
      modalTitle={modalTitle}
      itemData={itemData}
      listData={listData}
      component={GrnView}
      handleCallbackFunc={handleCallbackFunc}
      financialYear={financialYear}
      setFinancialYear={setFinancialYear}
    />
  )
}

export default React.memo(GrnViewController)
