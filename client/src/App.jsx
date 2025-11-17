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
import useAuthStore from "./store/authStore";
import { useEffect, useState } from "react";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { validateToken } = useAuthStore();

  useEffect(() => {
    const initialize = async () => {
      await validateToken();
      setIsInitialized(true);
    };
    initialize();
  }, [validateToken]);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
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
      <Routes>
        {/* Routes available to all users */}
        <Route element={<Public />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
        </Route>

        {/* Routes for unauthenticated users only */}
        <Route element={<PublicRoute />}>
          <Route element={<Public />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* Private Routes for authenticated users */}
        <Route element={<PrivateRoute />}>
          <Route element={<Private />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cart" element={<CartPage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<Private />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin/products" element={<ProductListPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
