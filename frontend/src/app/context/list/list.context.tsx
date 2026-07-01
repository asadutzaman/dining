import React, { createContext, useContext, useEffect, useState } from 'react'
import initialState from './list.state';
import { AuthContext } from "../auth/auth.context";

export const ListContext = createContext<any>(initialState);

export const ListProvider = ({ children }: any) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [enumListContext, setEnumListContext] = useState<any[]>(initialState.enumListContext);
  const [lookupListContext, setLookupListContext] = useState<any[]>(initialState.lookupListContext);
  const [locationListContext, setLocationListContext] = useState<any[]>(initialState.locationListContext);
  const [organizationListContext, setOrganizationListContext] = useState<any[]>(initialState.organizationListContext);
  const [organogramListContext, setOrganogramListContext] = useState<any[]>(initialState.organogramListContext);
  const [userListContext, setUserListContext] = useState<any[]>(initialState.userListContext);
  const [groupListContext, setGroupListContext] = useState<any[]>(initialState.groupListContext);
  const [roleListContext, setRoleListContext] = useState<any[]>(initialState.roleListContext);
  const [employeeListContext, setEmployeeListContext] = useState<any[]>(initialState.employeeListContext);
  const [designationListContext, setDesignationListContext] = useState<any[]>(initialState.designationListContext);
  const [departmentListContext, setDepartmentListContext] = useState<any[]>(initialState.departmentListContext);
  const [productListContext, setProductListContext] = useState<any[]>(initialState.productListContext);
  const [componentListContext, setComponentListContext] = useState<any[]>(initialState.componentListContext);
  const [manufacturerListContext, setManufacturerListContext] = useState<any[]>(initialState.manufacturerListContext);
  const [serviceAssignmentListContext, setServiceAssignmentListContext] = useState<any[]>(initialState.serviceAssignmentListContext);

  useEffect(() => {
    if (isAuthenticated === false) {
      handleReset();
    }
  }, [isAuthenticated]);

  const handleReset = () => {
    setEnumListContext(initialState.enumListContext);
    setLookupListContext(initialState.lookupListContext);
    setLocationListContext(initialState.locationListContext);
    setOrganizationListContext(initialState.organizationListContext);
    setOrganogramListContext(initialState.organogramListContext);
    setUserListContext(initialState.userListContext);
    setGroupListContext(initialState.groupListContext);
    setRoleListContext(initialState.roleListContext);
    setEmployeeListContext(initialState.employeeListContext);
    setDesignationListContext(initialState.designationListContext);
    setDepartmentListContext(initialState.departmentListContext);
    setProductListContext(initialState.productListContext);
    setComponentListContext(initialState.componentListContext);
    setManufacturerListContext(initialState.manufacturerListContext);
    setServiceAssignmentListContext(initialState.serviceAssignmentListContext);
  };

  const contextValue = {
    organizationListContext, setOrganizationListContext,
    organogramListContext, setOrganogramListContext,
    userListContext, setUserListContext,
    roleListContext, setRoleListContext,
    groupListContext, setGroupListContext,
    employeeListContext, setEmployeeListContext,
    locationListContext, setLocationListContext,
    departmentListContext, setDepartmentListContext,
    productListContext, setProductListContext,
    designationListContext, setDesignationListContext,
    lookupListContext, setLookupListContext,
    enumListContext, setEnumListContext,
    componentListContext, setComponentListContext,
    manufacturerListContext, setManufacturerListContext,
    serviceAssignmentListContext, setServiceAssignmentListContext
  };

  return (
    <ListContext.Provider value={contextValue}>
      {children}
    </ListContext.Provider>
  );
};

export default ListProvider;
