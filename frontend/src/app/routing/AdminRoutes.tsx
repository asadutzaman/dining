import { lazy, FC, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { MasterLayout } from '../../_metronic/layout/MasterLayout';
import TopBarProgress from 'react-topbar-progress-indicator';
import { DashboardWrapper } from '../pages/dashboard/DashboardWrapper';
import { MenuTestPage } from '../pages/MenuTestPage';
import { getCSSVariableValue } from '../../_metronic/assets/ts/_utils';
import { WithChildren } from '../../_metronic/helpers';
import BuilderPageWrapper from '../pages/layout-builder/BuilderPageWrapper';

const AdminRoutes = () => {
  const ExampleRoutes = lazy(() => import('../modules/example/ExampleRoutes'));
  const SettingRoutes = lazy(() => import('../modules/setting/SettingRoutes'));
  const SetupRoutes = lazy(() => import('../modules/setup/SetupRoutes'));
  const InventoryRoutes = lazy(
    () => import('../modules/inventory/InventoryRoutes')
  );
  const PatientRoutes = lazy(() => import('../modules/patient/PatientRoutes'));

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* CUSTOM MENU ROUTES */}
        {/* <Route path={'example'} element={<ExampleUserListController />} /> */}
        <Route
          path={'/example/*'}
          element={
            <SuspensedView>
              <ExampleRoutes />
            </SuspensedView>
          }
        />
        <Route
          path={'/setting/*'}
          element={
            <SuspensedView>
              <SettingRoutes />
            </SuspensedView>
          }
        />
        <Route
          path={'/setup/*'}
          element={
            <SuspensedView>
              <SetupRoutes />
            </SuspensedView>
          }
        />
        <Route
          path={'/inventory/*'}
          element={
            <SuspensedView>
              <InventoryRoutes />
            </SuspensedView>
          }
        />
        <Route
          path={'/patient/*'}
          element={
            <SuspensedView>
              <PatientRoutes />
            </SuspensedView>
          }
        />

        {/* Redirect to Dashboard after success login/registartion */}
        <Route path="auth/*" element={<Navigate to="/admin/dashboard" />} />
        {/* Pages */}
        <Route path="/dashboard" element={<DashboardWrapper />} />
        <Route path="builder" element={<BuilderPageWrapper />} />
        <Route path="menu-test" element={<MenuTestPage />} />
        {/* Lazy Modules */}
        {/* Page Not Found */}
        <Route path="*" element={<Navigate to="/error/404" />} />
      </Route>
    </Routes>
  );
};

const SuspensedView: FC<WithChildren> = ({ children }) => {
  const baseColor = getCSSVariableValue('--bs-primary');
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  });
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>;
};

export { AdminRoutes };
