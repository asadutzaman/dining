import React from 'react';
import { Route, Routes, Outlet } from 'react-router-dom'
import ExampleListController from './components/ExampleUser/List/ExampleList.controller';

const ExampleRoutes = () => {

    return (
        <Routes>
            {/* <Route element={<Outlet />}> */}
            <Route path='example-users' element={<ExampleListController />} />
            {/* </Route> */}
        </Routes>
    )

}

export default ExampleRoutes;