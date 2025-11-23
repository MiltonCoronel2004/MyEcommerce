import React from "react";
import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/authStore";

/**
 * Componente de Ruta de Administrador.
 *
 * Este componente protege las rutas que son exclusivas para los usuarios
 * con el rol de 'admin'.
 *
 * Realiza una doble verificación:
 * 1. Asegura que haya un usuario autenticado. Si no, redirige a '/login'.
 * 2. Verifica que el rol del usuario sea 'admin'. Si no, redirige a la página principal ('/').
 *
 * Si ambas condiciones se cumplen, permite el acceso a la ruta anidada.
 */
const AdminRoute = () => {
  const { user } = useAuthStore();

  // Si no hay usuario, no está autorizado.
  if (!user) return <Navigate to="/login" replace />;
  // Si el usuario no tiene el rol de 'admin', no está autorizado.
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  // Si pasa las verificaciones, permite el acceso.
  return <Outlet />;
};

export default AdminRoute;
