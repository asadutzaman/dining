import React from 'react'
import {Route, Routes} from 'react-router-dom'
import RequisitionListController from './components/Requisition/List/RequisitionList.controller'
import GoodsReceiveNoteListController from './components/GoodsReceiveNote/List/GoodsReceiveNoteList.controller'
import RequisitionApprovalListController from './components/RequisitionApproval/List/RequisitionApprovalList.controller'
import StockAdjustmentListController from './components/StockAdjustment/List/StockAdjustmentList.controller'
import GoodsReceiveNoteApprovalListController from './components/GoodsReceiveNoteApproval/List/GoodsReceiveNoteApprovalList.controller'
import ItemStockListController from 'src/app/modules/reports/components/ItemStock/List/ItemStockList.controller'
import StockAdjustmentApprovalListController from './components/StockAdjustmentApproval/List/StockAdjustmentApprovalList.controller'
import ItemConsumptionListController from './components/ItemConsumption/List/ItemConsumptionList.controller'
import StockTransferListController from './components/StockTransfer/List/StockTransferList.controller'
import ItemLowStockListController from 'src/app/modules/reports/components/ItemLowStock/List/ItemLowStockList.controller'
import StockTransferApprovalListController from './components/StockTransferApproval/List/StockTransferApprovalList.controller'
import RequisitionAnalyticListController from '../reports/components/RequisitionAnalytic/List/RequisitionAnalyticList.controller'
import ItemRequisitionStatusListController from '../reports/components/ItemRequisitionStatus/List/ItemRequistionStatusList.controller'
import RequesterWiseDisbursementListController from '../reports/components/RequesterWiseDisbursement/List/RequesterWiseDisbursementList.controller'
import ItemWiseDisbursementListController from '../reports/components/ItemWiseDisbursement/List/ItemWiseDisbursementList.controller'
import ThanaWiseDisbursementListController from '../reports/components/ThanaWiseDisbursement/List/ThanaWiseDisbursementList.controller'

const InventoryRoutes = () => {
  return (
    <Routes>
      <Route path={'/requisition'} element={<RequisitionListController />} />
      <Route path={'/requisition-approval'} element={<RequisitionApprovalListController />} />

      <Route path={'/goods-receive-note'} element={<GoodsReceiveNoteListController />} />
      <Route
        path={'/goods-receive-note-approval'}
        element={<GoodsReceiveNoteApprovalListController />}
      />

      <Route path={'/stock-adjustment'} element={<StockAdjustmentListController />} />
      <Route
        path={'/stock-adjustment-approval'}
        element={<StockAdjustmentApprovalListController />}
      />

      <Route path={'/item-consumption'} element={<ItemConsumptionListController />} />

      <Route path={'/stock-transfer'} element={<StockTransferListController />} />
      <Route path={'/stock-transfer-approval'} element={<StockTransferApprovalListController />} />

      {/* Report */}
      <Route
        path={'/report/requisition-analytics'}
        element={<RequisitionAnalyticListController />}
      />
      <Route path={'/report/item-stock'} element={<ItemStockListController />} />
      <Route path={'/report/item-low-stock'} element={<ItemLowStockListController />} />
      <Route
        path={'/report/requisition-statistics'}
        element={<ItemRequisitionStatusListController />}
      />
      <Route
        path={'/report/requester-wise-disbursement'}
        element={<RequesterWiseDisbursementListController />}
      />
      <Route
        path={'/report/item-wise-disbursement'}
        element={<ItemWiseDisbursementListController />}
      />
      <Route
        path={'/report/branch-wise-disbursement'}
        element={<ThanaWiseDisbursementListController />}
      />
    </Routes>
  )
}

export default InventoryRoutes
