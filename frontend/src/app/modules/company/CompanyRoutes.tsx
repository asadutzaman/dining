import React from 'react'
import {Route, Routes} from 'react-router-dom'
import OrganizationListController from './components/Organization/List/OrganizationList.controller'
import OrganogramListController from './components/Organogram/List/OrganogramList.controller'
import UserListController from './components/Users/List/UserList.controller'
import ApplicationSettingsController from './components/ApplicationSetting/View/ApplicationSettingsView.controller'
import GovtHolidayListController from './components/GovtHollday/List/GovtHolidayList.controller'
import DatabaseBackupViewController from './components/DatabaseBackup/View/DatabaseBackupView.controller'

const CompanyRoutes = () => {
  return (
    <Routes>
      <Route path={'/organization'} element={<OrganizationListController />} />
      <Route path={'/organogram'} element={<OrganogramListController />} />
      <Route path={'/users'} element={<UserListController />} />
      <Route path={'/application-settings'} element={<ApplicationSettingsController />} />
      <Route path={'/govt-holiday'} element={<GovtHolidayListController />} />
      <Route path={'/database-backup'} element={<DatabaseBackupViewController />} />
    </Routes>
  )
}

export default CompanyRoutes
