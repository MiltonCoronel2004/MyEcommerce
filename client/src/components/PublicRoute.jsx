import React from "react";
import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/authStore";

const PublicRoute = () => {
  const { user } = useAuthStore();

  if (user) {
    if (user?.role === "admin") return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
