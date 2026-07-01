import { Empty, Select, SelectProps, Spin } from 'antd';
import React, { useEffect } from 'react';
import { useLiveSearchItemList } from 'src/app/hooks/liveSearchData/useLiveSearchItemList';

interface Props extends SelectProps {
  itemCode: any;
  placeholder?: string;
  isMultiple?: boolean;

  onLoad?: (value: any) => void;
  onChange?: (value: any, option: any) => void;
  onSelect?: (value: any, option: any) => void;
}

const LiveSearchItemSelect: React.FC<Props> = (props) => {
  const { itemCode, isMultiple = false } = props;

  const {
    loadingItemList,
    setLoadingItemList,
    itemList,
    setItemList,
    searchItem,
  } = useLiveSearchItemList();

  useEffect(() => {
    if (itemCode) {
      if (props.onLoad) {
        props.onLoad(itemCode);
      }
    }
  }, [itemCode, props]);

  const handleOnChanged = (value: any, option: any) => {
    if (props.onChange) {
      props.onChange(value, option);
    }
  };

  const handleOnSelect = (value: any, option: any) => {
    if (props.onSelect) {
      props.onSelect(value, option);
    }
  };

  const handleSearch = (searchValue: string) => {
    if (searchValue.length >= 2) {
      //8
      setLoadingItemList(true);
      setItemList([]);
      searchItem(searchValue);
    }
  };

  // const [itemCode, setJobNumber] = useState<string>();
  // const handleSelectChange = (newValue: string) => {
  //     setJobNumber(newValue);
  // };

  if (isMultiple) {
    return (
      <Select
        {...props}
        allowClear={true}
        showSearch
        placeholder={props.placeholder || '-- Search --'}
        value={itemCode}
        style={props.style}
        defaultActiveFirstOption={false}
        suffixIcon={null}
        filterOption={false}
        onSearch={handleSearch}
        // onChange={handleSelectChange}
        onChange={(value, option) => handleOnChanged(value, option)}
        onSelect={(value, option) => handleOnSelect(value, option)}
        loading={loadingItemList}
        notFoundContent={loadingItemList ? <Spin size="small" /> : <Empty />}
        options={(itemList || []).map((item) => ({
          value: item.value,
          label: item.text,
          itemData: item.itemData,
        }))}
        mode="multiple"
      />
    );
  } else {
    return (
      <Select
        {...props}
        allowClear={true}
        showSearch
        placeholder={props.placeholder || '-- Search --'}
        value={itemCode}
        style={props.style}
        defaultActiveFirstOption={false}
        suffixIcon={null}
        filterOption={false}
        onSearch={handleSearch}
        // onChange={handleSelectChange}
        onChange={(value, option) => handleOnChanged(value, option)}
        onSelect={(value, option) => handleOnSelect(value, option)}
        loading={loadingItemList}
        notFoundContent={loadingItemList ? <Spin size="small" /> : <Empty />}
        options={(itemList || []).map((item) => ({
          value: item.value,
          label: item.text,
          itemData: item.itemData,
        }))}
      />
    );
  }
};

export default LiveSearchItemSelect;
