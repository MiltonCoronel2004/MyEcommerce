import React from "react";
import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/authStore";


const PrivateRoute = () => {
  const { user } = useAuthStore();

  // Para cuando este componente se renderiza, la comprobación inicial del token ya ha finalizado.
  // Si 'user' es null, significa que el usuario no está autenticado.
  if (!user) return <Navigate to="/login" replace />;

  // Si el usuario existe, está autenticado y puede acceder a la ruta.
  return <Outlet />;
};

export default PrivateRoute;
