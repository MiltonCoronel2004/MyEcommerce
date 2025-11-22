import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import useAuthStore from "../store/authStore";
import { User, ShoppingCart, LogOut, Settings, LayoutDashboard, List, ListOrdered, ChevronDown } from "lucide-react";

const Header = () => {
  const { user, token, logout, cart } = useAuthStore();
  const navigate = useNavigate();
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsAdminMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const totalItems = cart?.CartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 backdrop-blur-sm bg-slate-800/95">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent hover:from-emerald-300 hover:to-emerald-500 transition-all"
          >
            MyEcommerce
          </Link>

          {token ? (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-all"
              >
                <User size={20} />
                <span className="hidden sm:inline">Perfil</span>
              </Link>

              {user?.role === "admin" && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg transition-all"
                  >
                    <span>Admin</span>
                    <ChevronDown size={20} className={`transition-transform ${isAdminMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isAdminMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-10">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-emerald-400"
                      >
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <Link
                        to="/admin/products"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-emerald-400"
                      >
                        <Settings size={16} /> Productos
                      </Link>
                      <Link
                        to="/admin/categories"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-emerald-400"
                      >
                        <List size={16} /> Categorías
                      </Link>
                      <Link
                        to="/admin/orders"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-emerald-400"
                      >
                        <ListOrdered size={16} /> Pedidos
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {user?.role !== "admin" && (
                <Link
                  to="/cart"
                  className="relative flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-all"
                >
                  <ShoppingCart size={20} />
                  <span className="hidden sm:inline">Carrito</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-emerald-500 rounded-full">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-600 hover:border-red-500/30 rounded-lg transition-all font-medium"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="px-4 py-2 text-slate-300 hover:text-emerald-400 transition-colors font-medium">
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/30"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
