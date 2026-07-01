import React from 'react'
import {Route, Routes} from 'react-router-dom'
import UnitListController from './components/Unit/List/UnitList.controller'
import DepartmentListController from './components/Department/List/DepartmentList.controller'
import DesignationListController from './components/Designation/List/DesignationList.controller'
import DesignationViewController from './components/Designation/View/DesignationView.controller'
import SupplierListController from './components/Supplier/List/SupplierList.controller'
import ItemCategoryListController from './components/ItemCategory/List/ItemCategoryList.controller'
import BrandListController from './components/Brand/List/BrandList.controller'
import BranchListController from './components/Branch/List/BranchList.controller'
import ItemListController from './components/Item/List/ItemList.controller'
import LogisticListController from './components/Logistic/List/LogisticList.controller'
import AttributeListController from './components/Attribute/List/AttributeList.controller'
import ShelveListController from './components/Shelve/List/ShelveList.controller'

const SetupRoutes = () => {
  return (
    <Routes>
      <Route path={'/unit'} element={<UnitListController />} />
      <Route path={'/department'} element={<DepartmentListController />} />
      <Route path={'/designation'} element={<DesignationListController />} />
      <Route path={'/designation/view/:designationId'} element={<DesignationViewController />} />
      <Route path={'/supplier'} element={<SupplierListController />} />
      <Route path={'/item-category'} element={<ItemCategoryListController />} />
      <Route path={'/brand'} element={<BrandListController />} />
      <Route path={'/branch'} element={<BranchListController />} />
      <Route path={'/shelve'} element={<ShelveListController />} />
      <Route path={'/logistic'} element={<LogisticListController />} />
      <Route path={'/attribute'} element={<AttributeListController />} />
      <Route path={'/item'} element={<ItemListController />} />
    </Routes>
  )
}

export default SetupRoutes
