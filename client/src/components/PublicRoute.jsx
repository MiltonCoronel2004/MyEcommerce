import { Navigate, Outlet } from "react-router";
import useAuthStore from "../store/authStore";


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
