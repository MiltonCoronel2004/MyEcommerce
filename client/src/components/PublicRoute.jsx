import React from "react";
import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/authStore";

/**
 * Componente de Ruta Pública.
 *
 * Este componente envuelve las rutas que solo deben ser accesibles
 * por usuarios que NO han iniciado sesión (ej: /login, /register).
 *
 * Comprueba si existe un 'usuario' en el estado global.
 * - Si hay un usuario, lo redirige a la página principal ('/') o al dashboard si es admin.
 *   Esto evita que un usuario logueado vea, por ejemplo, la página de login.
 * - Si no hay un usuario, renderiza el contenido de la ruta anidada, permitiendo el acceso.
 */
const PublicRoute = () => {
  const { user } = useAuthStore();

  if (user) {
    // Si el usuario es admin, se le redirige a su panel principal.
    if (user?.role === "admin") return <Navigate to="/dashboard" replace />;
    // Si es un usuario normal, se le redirige a la página de inicio.
    return <Navigate to="/" replace />;
  }

  // Si no hay usuario, permite el acceso a la ruta (ej: /login).
  return <Outlet />;
};

export default PublicRoute;
