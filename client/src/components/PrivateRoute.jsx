import React from "react";
import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/authStore";

/**
 * Componente de Ruta Privada.
 *
 * Este componente envuelve las rutas que solo deben ser accesibles
 * por usuarios que han iniciado sesión.
 *
 * Se ejecuta DESPUÉS de que la verificación de token inicial en `App.jsx` ha terminado.
 * Simplemente comprueba si existe un 'usuario' en el estado global.
 *
 * - Si no hay usuario, redirige a la página de login (`/login`).
 * - Si hay un usuario, renderiza el contenido de la ruta anidada a través de `<Outlet />`.
 */
const PrivateRoute = () => {
  const { user } = useAuthStore();

  // Para cuando este componente se renderiza, la comprobación inicial del token ya ha finalizado.
  // Si 'user' es null, significa que el usuario no está autenticado.
  if (!user) return <Navigate to="/login" replace />;

  // Si el usuario existe, está autenticado y puede acceder a la ruta.
  return <Outlet />;
};

export default PrivateRoute;
