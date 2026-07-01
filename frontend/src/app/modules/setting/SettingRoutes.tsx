import React from 'react'
import {Route, Routes} from 'react-router-dom'
import PermissionRoutes from '../permission/PermissionRoutes'
import CompanyRoutes from '../company/CompanyRoutes'
import ProfileRoutes from '../profile/ProfileRoutes'

const SettingRoutes = () => {
  return (
    <Routes>
      <Route path={'/company/*'} element={<CompanyRoutes />} />
      <Route path={'/profile/*'} element={<ProfileRoutes />} />
      <Route path={'/permission/*'} element={<PermissionRoutes />} />
    </Routes>
  )
}

export default SettingRoutes
