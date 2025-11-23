import React from "react";
import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/authStore";

/**
 * Componente de Ruta Privada.
 *
 * Este componente envuelve las rutas que solo deben ser accesibles
 * por usuarios que han iniciado sesión.
 *
 * Comprueba si existe un 'usuario' en el estado global de autenticación (`useAuthStore`).
 * - Si no hay usuario, redirige a la página de login (`/login`).
 * - Si hay un usuario, renderiza el contenido de la ruta anidada a través de `<Outlet />`.
 */
const PrivateRoute = () => {
  const { user } = useAuthStore();

  // Si no hay un usuario autenticado, redirige a la página de login.
  // 'replace' evita que el usuario pueda volver a la ruta anterior con el botón de "atrás".
  if (!user) return <Navigate to="/login" replace />;

  // Si el usuario está autenticado, permite el acceso a la ruta solicitada.
  return <Outlet />;
};

export default PrivateRoute;
