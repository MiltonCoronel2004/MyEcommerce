import React, { useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { User, ShoppingCart, LogOut, Settings } from "lucide-react";

const PrivateLayout = () => {
  const { logout, user, verifyToken } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    verifyToken();
  }, [location, verifyToken]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 backdrop-blur-sm bg-slate-800/95">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent hover:from-emerald-300 hover:to-emerald-500 transition-all"
            >
              MyEcommerce
            </Link>

            <div className="flex items-center gap-6">
              <span className="text-slate-400 text-sm hidden sm:block">
                Welcome, <span className="text-emerald-400 font-medium">{user?.firstName || "User"}</span>
              </span>

              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-all"
              >
                <User size={20} />
                <span className="hidden sm:inline">Profile</span>
              </Link>

              <Link
                to="/cart"
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-all"
              >
                <ShoppingCart size={20} />
                <span className="hidden sm:inline">Cart</span>
              </Link>

              {user?.role === "admin" && (
                <Link
                  to="/admin/products"
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg transition-all"
                >
                  <Settings size={20} />
                  <span className="hidden sm:inline">Manage Products</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-600 hover:border-red-500/30 rounded-lg transition-all font-medium"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PrivateLayout;
