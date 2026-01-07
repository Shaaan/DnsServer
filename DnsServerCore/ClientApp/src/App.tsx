import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './features/auth/LoginPage';

// Lazy load feature pages
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ZonesPage = lazy(() => import('./features/zones/ZonesPage').then(module => ({ default: module.ZonesPage })));
const ZoneRecordsPage = lazy(() => import('./features/zones/ZoneRecordsPage').then(module => ({ default: module.ZoneRecordsPage })));
const DnsClientPage = lazy(() => import('./features/tools/DnsClientPage').then(module => ({ default: module.DnsClientPage })));
const BlockedAllowedPage = lazy(() => import('./features/zones/BlockedAllowedPage').then(module => ({ default: module.BlockedAllowedPage })));
const DhcpPage = lazy(() => import('./features/dhcp/DhcpPage').then(module => ({ default: module.DhcpPage })));
const DhcpScopeFormPage = lazy(() => import('./features/dhcp/DhcpScopeFormPage').then(module => ({ default: module.DhcpScopeFormPage })));
const AppsPage = lazy(() => import('./features/apps/AppsPage').then(module => ({ default: module.AppsPage })));
const LogsPage = lazy(() => import('./features/query-logs/LogsPage').then(module => ({ default: module.LogsPage })));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage').then(module => ({ default: module.SettingsPage })));
const AdministrationPage = lazy(() => import('./features/admin/AdministrationPage').then(module => ({ default: module.AdministrationPage })));
const CachePage = lazy(() => import('./features/cache/CachePage').then(module => ({ default: module.CachePage })));

const PageLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<MainLayout />}>
        <Route path="/" element={
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        } />

        <Route path="zones" element={
          <Suspense fallback={<PageLoader />}>
            <ZonesPage />
          </Suspense>
        } />

        <Route path="zones/:zoneName" element={
          <Suspense fallback={<PageLoader />}>
            <ZoneRecordsPage />
          </Suspense>
        } />

        <Route path="tools/dns-client" element={
          <Suspense fallback={<PageLoader />}>
            <DnsClientPage />
          </Suspense>
        } />

        <Route path="cache" element={
          <Suspense fallback={<PageLoader />}>
            <CachePage />
          </Suspense>
        } />

        <Route path="allowed" element={
          <Suspense fallback={<PageLoader />}>
            <BlockedAllowedPage type="allowed" />
          </Suspense>
        } />

        <Route path="blocked" element={
          <Suspense fallback={<PageLoader />}>
            <BlockedAllowedPage type="blocked" />
          </Suspense>
        } />

        <Route path="dhcp" element={
          <Suspense fallback={<PageLoader />}>
            <DhcpPage />
          </Suspense>
        } />

        <Route path="dhcp/scopes/:scopeName" element={
          <Suspense fallback={<PageLoader />}>
            <DhcpScopeFormPage />
          </Suspense>
        } />

        <Route path="apps" element={
          <Suspense fallback={<PageLoader />}>
            <AppsPage />
          </Suspense>
        } />

        <Route path="logs" element={
          <Suspense fallback={<PageLoader />}>
            <LogsPage />
          </Suspense>
        } />

        <Route path="settings" element={
          <Suspense fallback={<PageLoader />}>
            <SettingsPage />
          </Suspense>
        } />

        <Route path="admin" element={
          <Suspense fallback={<PageLoader />}>
            <AdministrationPage />
          </Suspense>
        } />
      </Route>

      {/* Catch all - Redirect to Dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
