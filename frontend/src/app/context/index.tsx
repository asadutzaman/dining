import React from 'react'
import {node} from 'prop-types'

// import SocketProvider from "./socket/SocketContext";
import AuthProvider from './auth/auth.context'
// import SettingProvider from "./data/SettingContext";
import DataProvider from './data/DataContext'
import ListProvider from './list/list.context'
import LoadingProvider from './loading/LoadingContext'
import ThemeProvider from './data/ThemeContext'
import CountProvider from './data/CountContext'
import VisitorContextProvider from './data/VisitorContext'
import {LayoutProvider} from '../../_metronic/layout/core'
import {AuthInit} from '../modules/auth'
import {MasterInit} from '../../_metronic/layout/MasterInit'
import {Outlet} from 'react-router-dom'

const ContextProvider = ({children}: any) => {
  return (
    <LayoutProvider>
      <AuthProvider>
        <Outlet />
        <MasterInit />
      </AuthProvider>
    </LayoutProvider>
  )
}

ContextProvider.propTypes = {
  children: node.isRequired,
}

export default ContextProvider
