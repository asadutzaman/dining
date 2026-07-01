/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/app/modules/Auth/pages/AuthPage`, `src/app/BasePage`).
 */

import { FC } from 'react'
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'
import { AdminRoutes } from './AdminRoutes'
import { ErrorsPage } from '../modules/errors/ErrorsPage'
import { App } from '../App'
import ProtectedAdminRoute from './NavigationRoute/ProtectedAdminRoute'
import AuthRoutes from '../modules/auth/AuthRoutes'

/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */
const { PUBLIC_URL } = process.env

const AppRoutes: FC = () => {

    return (
        <BrowserRouter basename={PUBLIC_URL}>
            <Routes>
                <Route element={<App />}>
                    <Route element={<ProtectedAdminRoute />}>
                        <Route path='admin/*' element={<AdminRoutes />} />
                        <Route index element={<Navigate to='/admin/dashboard' />} />
                    </Route>

                    <Route path='auth/*' element={<AuthRoutes />} />
                    <Route path='error/*' element={<ErrorsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export { AppRoutes }
