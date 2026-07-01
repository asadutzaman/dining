import React from 'react';
import { Route, Routes, Outlet } from 'react-router-dom'
import ResourceListController from './components/Resource/List/ResourceList.controller';
import ScopeListController from './components/Scope/List/ScopeList.controller';
import RoleListController from './components/Role/List/RoleList.controller';
import GroupListController from './components/Group/List/GroupList.controller';
import PermissionResourceController from './components/PermissionResource/PermissionResource.controller';

const PermissionRoutes = () => {

    return (
        <Routes>
            <Route path={"/resource"} element={<ResourceListController />} />
            <Route path={"/scope"} element={<ScopeListController />} />
            <Route path={"/group"} element={<GroupListController />} />
            <Route path={"/role"} element={<RoleListController />} />
            <Route path={"/permission-role"} element={<PermissionResourceController />} />
        </Routes>
    )

}

export default PermissionRoutes;