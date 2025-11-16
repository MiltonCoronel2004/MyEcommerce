import React from 'react';
import { Navigate, Outlet } from 'react-router';
import useAuthStore from '../store/authStore';

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/profile" replace />;
};

export default AdminRoute;
