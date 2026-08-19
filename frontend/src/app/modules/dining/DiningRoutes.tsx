import React from 'react'
import {Route, Routes} from 'react-router-dom'
import MemberListController from './components/Member/List/MemberList.controller'
import MemberImportController from './components/Member/Import/MemberImport.controller'
import MealSettingListController from './components/MealSetting/List/MealSettingList.controller'
import MealTokenListController from './components/MealToken/List/MealTokenList.controller'
import MealTokenIssueController from './components/MealToken/Issue/MealTokenIssue.controller'
import PaymentListController from './components/Payment/List/PaymentList.controller'
import PaymentCollectController from './components/Payment/Collect/PaymentCollect.controller'
import MonthlyReportController from './components/Reports/MonthlyReport/MonthlyReport.controller'
import IndividualReportController from './components/Reports/IndividualReport/IndividualReport.controller'
import MealCostReportController from './components/Reports/MealCostReport/MealCostReport.controller'

const DiningRoutes = () => {
  return (
    <Routes>
      <Route path={'/member'} element={<MemberListController />} />
      <Route path={'/member/import'} element={<MemberImportController />} />
      <Route path={'/meal-setting'} element={<MealSettingListController />} />
      <Route path={'/meal-token'} element={<MealTokenListController />} />
      <Route path={'/meal-token/issue'} element={<MealTokenIssueController />} />
      <Route path={'/payment'} element={<PaymentListController />} />
      <Route path={'/payment/collect'} element={<PaymentCollectController />} />
      <Route path={'/report/monthly'} element={<MonthlyReportController />} />
      <Route path={'/report/individual'} element={<IndividualReportController />} />
      <Route path={'/report/meal-cost'} element={<MealCostReportController />} />
    </Routes>
  )
}

export default DiningRoutes
