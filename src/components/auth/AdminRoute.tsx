import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const AdminRoute = () => {
  const { isAdmin, isInitialized } = useAuth();

  if (!isInitialized) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;