import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ChangePasswordController from './components/ChangePassword/ChangePassword.controller';
import { Overview } from './components/account/Overview';

const ProfileRoutes = () => {

    return (
        <Routes>
            <Route path={"/change-password"} element={<ChangePasswordController />} />
            <Route path={"/own-profile"} element={<Overview />} />
        </Routes>
    )

}

export default ProfileRoutes;