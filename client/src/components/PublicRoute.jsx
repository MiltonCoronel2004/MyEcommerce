import React from 'react';
import { Navigate, Outlet } from 'react-router';
import useAuthStore from '../store/authStore';

const PublicRoute = () => {
  const { isAuthenticated } = useAuthStore();

  // If authenticated, redirect to the dashboard. Otherwise, render the child public route.
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
