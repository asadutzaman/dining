import {SelectProps} from 'antd'
import {useState} from 'react'
import {ItemApi} from 'src/app/api'
import {useLang} from '../useLang'

export const useLiveSearchItemList = () => {
  const {t, lang} = useLang()
  // USED STATES
  const [itemList, setItemList] = useState<SelectProps['options']>([])
  const [loadingItemList, setLoadingItemList] = useState<boolean>(false)

  const loadItemList = (searchValue: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoadingItemList(true)
      const payload = {
        $filter: `code ILIKE '%${searchValue}%' OR name_en ILIKE '%${searchValue}%' OR name_bn ILIKE '%${searchValue}%'`,
      }
      ItemApi.dropdown(payload)
        .then((res) => {
          //   const list = res.data.results
          resolve(res.data)
        })
        .catch((err) => {
          setLoadingItemList(false)
          reject(err)
        })
    })
  }

  let currentValue: string

  const searchItem = (inputValue: string) => {
    currentValue = inputValue
    loadItemList(inputValue).then((res) => {
      if (res.results.length > 0) {
        if (currentValue === inputValue) {
          const data = res.results.map((item: any) => ({
            value: item.id,
            text:
              lang === 'en'
                ? `[${item.code}] - ${item.name_en}`
                : `[${item.code}] - ${item.name_bn}`,
            itemData: item,
          }))
          setItemList(data)
          setLoadingItemList(false)
        }
      } else {
        setItemList([])
        setLoadingItemList(false)
      }
    })
  }

  return {
    loadingItemList,
    setLoadingItemList,
    itemList,
    setItemList,
    searchItem,
  }
}
