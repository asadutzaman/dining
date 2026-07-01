import { SelectProps } from 'antd';
import { useState } from 'react';
import { ItemApi } from 'src/app/api';

export const useItemList = () => {
  // USED STATES
  const [itemList, setItemList] = useState<SelectProps['options']>([]);
  const [loadingItemList, setLoadingItemList] = useState<boolean>(false);

  const loadItemList = (searchValue: any, logisticId?: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      setLoadingItemList(true);
      let payload: any = {
        $filter: `code ILIKE '%${searchValue}%' OR name_en ILIKE '%${searchValue}%'`,
      };

      if (logisticId) {
        payload = {
          $filter: `logistic_id=${logisticId} AND (code ILIKE '%${searchValue}%' OR name_en ILIKE '%${searchValue}%')`,
          logistic_id: logisticId,
        };
      }

      ItemApi.dropdown(payload)
        .then((res) => {
          const list = res.data.results;
          resolve(res.data);
        })
        .catch((err) => {
          setLoadingItemList(false);
          reject(err);
        });
    });
  };

  let currentValue: string;

  const searchItem = (inputValue: string, logisticId?: number) => {
    currentValue = inputValue;
    loadItemList(inputValue, logisticId).then((res) => {
      if (res.results.length > 0) {
        if (currentValue === inputValue) {
          const data = res.results.map((item: any) => ({
            value: item.id,
            text: `[${item.code}] - ${item.name_en}`,
            itemData: item,
          }));
          setItemList(data);
          setLoadingItemList(false);
        }
      } else {
        setItemList([]);
        setLoadingItemList(false);
      }
    });
  };

  return {
    loadingItemList,
    setLoadingItemList,
    itemList,
    setItemList,
    searchItem,
  };
};
