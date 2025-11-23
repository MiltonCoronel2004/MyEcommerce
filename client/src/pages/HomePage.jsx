import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";
import { ShoppingCart } from "lucide-react";
import { handleApiError } from "../utils/errorHandler";
import api from "../services/api";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, addProductToCart } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, ok } = await api("/products");
        if (ok) setProducts(data);
        else handleApiError(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCartClick = (e, productId) => {
    e.preventDefault(); // Evita la navegación al hacer clic en el botón dentro de un Link
    if (!user) {
      toast.info("Por favor, inicia sesión para añadir artículos a tu carrito.");
      return navigate("/login");
    }
    addProductToCart(productId, 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-12 tracking-tight">Productos</h1>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 flex flex-col hover:shadow-2xl hover:shadow-emerald-500/10"
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="relative w-full h-48">
                    <img
                      src={
                        product.imageUrl
                          ? `${import.meta.env.VITE_SERVER_URL}/uploads/${product.imageUrl}`
                          : `${import.meta.env.VITE_SERVER_URL}/uploads/computer.png`
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all"></div>
                  </div>
                </Link>
                <div className="p-5 flex flex-col grow">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">{product.Category?.name || "Sin Categoría"}</p>
                  <h3 className="text-xl font-bold text-white mb-3">{product.name}</h3>

                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Disponibles: {product.stock}</h4>

                  <div className="flex items-end justify-between mt-auto">
                    <span className="text-2xl font-bold text-emerald-500">${parseFloat(product.price).toFixed(2)}</span>
                    <button
                      onClick={(e) => handleAddToCartClick(e, product.id)}
                      className="p-2 bg-emerald-500/10 text-emerald-400 rounded-full hover:bg-emerald-500/20 hover:text-emerald-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title={user?.role === "admin" ? "Los administradores no pueden añadir productos al carrito" : "Añadir al carrito"}
                      disabled={product.stock === 0 || user?.role === "admin"}
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
            <p className="text-slate-400 text-lg">No se encontraron productos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
