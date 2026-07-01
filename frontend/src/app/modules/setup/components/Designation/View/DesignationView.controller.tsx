import React, {FC, useEffect, useState} from 'react'
import DesignationView from './DesignationView.view'
import {useParams} from 'react-router-dom'
import {useErrorHandler} from 'src/app/hooks/useErrorHandler'
import {DesignationApi} from 'src/app/api'

const initialState = {
  modalTitle: 'Designation Overview',
  itemData: {},
  loading: true,
  fields: {},
  message: {
    network_error: 'A network error occurred. Please try again later.',
  },
}

const DesignationViewController: FC<any> = (props) => {
  const {designationId} = useParams()

  const modalTitle = initialState.modalTitle
  const [itemData, setItemData] = useState(initialState.itemData)
  const [loading, setLoading] = useState(initialState.loading)
  const {handleErrorMessage, handleSuccessMessage, showErrorMessage} = useErrorHandler()

  useEffect(() => {
    setItemData(initialState.itemData)
    if (designationId) {
      loadData()
    }
  }, [designationId])

  const loadData = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoading(true)
      DesignationApi.getById(designationId)
        .then((res: any) => {
          setItemData(res.data)
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
    <>
      <DesignationView loading={loading} modalTitle={modalTitle} itemData={itemData} />
    </>
  )
}

export default React.memo(DesignationViewController)
