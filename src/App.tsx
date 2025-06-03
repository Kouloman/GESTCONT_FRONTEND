import React from 'react';

import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Lazy-loaded components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const ContainerEntry = lazy(() => import('./pages/containers/ContainerEntry'));
const ContainerExit = lazy(() => import('./pages/containers/ContainerExit'));
const ClientContainerEntry = lazy(() => import('./pages/clients/ClientContainerEntry'));
const ClientContainerExit = lazy(() => import('./pages/clients/ClientContainerExit'));
const ContainerList = lazy(() => import('./pages/containers/ContainerList'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const ShippingLineManagement = lazy(() => import('./pages/admin/ShippingLineManagement'));
const IsoManagement = lazy(() => import('./pages/admin/IsoManagement'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  const { isAuthenticated, isInitialized, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isInitialized) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/container-entry" element={<ContainerEntry />} />
            <Route path="/container-exit" element={<ContainerExit />} />
            <Route path="/client-container-entry" element={<ClientContainerEntry />} />
            <Route path="/client-container-exit" element={<ClientContainerExit />} />
            <Route path="/containers" element={<ContainerList />} />
            <Route path="/profile" element={<Profile />} />
            
            <Route element={<AdminRoute />}>
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/shipping-lines" element={<ShippingLineManagement />} />
              <Route path="/admin/iso-codes" element={<IsoManagement />} />
            </Route>
          </Route>
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;