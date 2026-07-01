import React from 'react'
import {Route, Routes} from 'react-router-dom'
import PatientListController from './components/Patient/List/PatientList.controller'

const PatientRoutes = () => {
  return (
    <Routes>
      <Route path='list' element={<PatientListController />} />
    </Routes>
  )
}

export default PatientRoutes
