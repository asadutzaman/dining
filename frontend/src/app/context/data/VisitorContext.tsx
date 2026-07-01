import React, { createContext, useState } from 'react'

const initialState = {
  serviceOrganizationShortCode: null,
  serviceOrganizationId: null,
};

export const VisitorContext = createContext<any>(initialState);

export const VisitorContextProvider = ({ children }: any) => {
  const [serviceOrganizationId, setServiceOrganizationId] = useState<any>(initialState.serviceOrganizationId);
  const [serviceOrganizationShortCode, setServiceOrganizationShortCode] = useState<any>(initialState.serviceOrganizationShortCode);

  const contextValue = {
    serviceOrganizationId, setServiceOrganizationId,
    serviceOrganizationShortCode, setServiceOrganizationShortCode
  };

  return (
    <VisitorContext.Provider value={contextValue}>
      {children}
    </VisitorContext.Provider>
  );
};

export default VisitorContextProvider;
