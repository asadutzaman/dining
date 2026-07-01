import {Suspense} from 'react'
import {Outlet} from 'react-router-dom'
import {LayoutProvider, LayoutSplashScreen} from '../_metronic/layout/core'
import {MasterInit} from '../_metronic/layout/MasterInit'
import AuthProvider from './context/auth/auth.context'
import {I18nextProvider} from 'react-i18next'
import i18n from './i18n/i18n'

const App = () => {
  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <I18nextProvider i18n={i18n}>
        <LayoutProvider>
          <AuthProvider>
            <Outlet />
            <MasterInit />
          </AuthProvider>
        </LayoutProvider>
      </I18nextProvider>
    </Suspense>
  )
}

export {App}
