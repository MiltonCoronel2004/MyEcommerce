import React from "react";
import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/authStore";

const AdminRoute = () => {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;
  console.log(user);
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
};

export default AdminRoute;
