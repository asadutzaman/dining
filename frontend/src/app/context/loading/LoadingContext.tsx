import React, { createContext, useCallback, useState } from 'react'
// import Loader from "../../components/Loading/Loader";

const initialState = {
  isLoading: false
};

export const LoadingContext = createContext<any>(initialState);

export const LoadingProvider = ({ children }: any) => {
  const [isLoading, setIsLoading] = useState<boolean>(initialState.isLoading);

  const showGlobalLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const hideGlobalLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const contextValue = {
    isLoading, showGlobalLoading, hideGlobalLoading
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {/* <Loader /> */}
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;
