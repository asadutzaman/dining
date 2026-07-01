import React, { createContext, useState } from 'react'

const initialState = {
  sidebarVisible: true,
  activeMenuKey: null,
  headerTabGroup: null,
};

export const DataContext = createContext<any>(initialState);

export const DataContextProvider = ({ children }: any) => {
  const [sidebarVisible, changeSidebarVisible] = useState<boolean>(initialState.sidebarVisible);
  const [activeMenuKey, changeActiveMenuKey] = useState<any>(initialState.activeMenuKey);
  const [headerTabGroup, changeHeaderTabGroup] = useState<any>(initialState.headerTabGroup);

  const setHeaderTabGroup = (tabGroup: any) => {
    changeHeaderTabGroup(tabGroup);
  };

  const setActiveMenuKey = (key: any) => {
    changeActiveMenuKey(key);
  };

  const setSidebarVisible = (status: any = null) => {
    if (status) {
      changeSidebarVisible(status);
    }
    else {
      changeSidebarVisible(!sidebarVisible);
    }
  };

  const contextValue = {
    sidebarVisible, activeMenuKey, headerTabGroup,
    setHeaderTabGroup, setActiveMenuKey, setSidebarVisible
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContextProvider;
