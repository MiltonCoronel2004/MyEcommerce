import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Public from "./layouts/Public";
import Private from "./layouts/Private";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import AdminRoute from "./components/AdminRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import DashboardPage from "./pages/Admin/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import ProductListPage from "./pages/Admin/ProductListPage";
import CategoryListPage from "./pages/Admin/CategoryListPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import useAuthStore from "./store/authStore";
import { useEffect, useState } from "react";
import Loading from "./components/Loading";

import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";

import MyOrdersPage from "./pages/MyOrdersPage";

import OrderListPage from "./pages/Admin/OrderListPage";

function App() {
  const { loading, checkAuth } = useAuthStore();

  /**
   * Efecto de inicialización.
   * Se ejecuta una sola vez al cargar la aplicación para validar el token de sesión
   * almacenado en el `localStorage`. Esto permite mantener al usuario "logueado"
   * entre recargas de la página.
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Muestra un indicador de carga global mientras se valida el token.
  if (loading) return <Loading />;

  return (
    <Router>
      {/* Contenedor para las notificaciones (toasts) que aparecen en la aplicación. */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Define la estructura de rutas de la aplicación. */}
      <Routes>
        {/* --- Rutas Públicas Generales --- */}
        {/* Usan el layout 'Public' (ej: header y footer genéricos). */}
        <Route element={<Public />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
        </Route>

        {/* --- Rutas solo para Visitantes (no logueados) --- */}
        {/* El componente 'PublicRoute' redirige a los usuarios logueados. */}
        <Route element={<PublicRoute />}>
          <Route element={<Public />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        {/* --- Rutas Privadas para Usuarios Logueados --- */}
        {/* El componente 'PrivateRoute' protege estas rutas. */}
        <Route element={<PrivateRoute />}>
          {/* Usan el layout 'Private' (ej: header con menú de usuario, sidebar, etc.). */}
          <Route element={<Private />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/order/success" element={<PaymentSuccessPage />} />
            <Route path="/order/cancel" element={<PaymentCancelPage />} />
          </Route>
        </Route>

        {/* --- Rutas Privadas solo para Administradores --- */}
        {/* El componente 'AdminRoute' protege estas rutas. */}
        <Route element={<AdminRoute />}>
          <Route element={<Private />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin/products" element={<ProductListPage />} />
            <Route path="/admin/categories" element={<CategoryListPage />} />
            <Route path="/admin/orders" element={<OrderListPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
