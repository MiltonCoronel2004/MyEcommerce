import React from 'react';
import { Navigate, Outlet } from 'react-router';
import useAuthStore from '../store/authStore';

const PrivateRoute = () => {
  const { isAuthenticated } = useAuthStore();

  // If authenticated, render the child routes. Otherwise, navigate to login.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
