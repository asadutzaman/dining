import React from 'react';
import { Route, Routes } from "react-router-dom";
import { Registration } from './components/Registration'
import { ForgotPassword } from './components/ForgotPassword'
import Login from './components/Login/Login.controller'
import Logout from './components/Logout/Logout.Controller'
import { AuthLayout } from './AuthLayout';

const AuthRoutes = () => {
    return (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route path='/login' element={<Login />} />
                <Route path='/logout' element={<Logout />} />
                <Route path='/registration' element={<Registration />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route index element={<Login />} />
            </Route>
        </Routes>
    )
};

export default AuthRoutes;