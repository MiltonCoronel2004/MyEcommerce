import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";
import { ShoppingCart } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    if (!user) {
      toast.info("Por favor, inicia sesión para añadir artículos a tu carrito.");
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add to cart");
      }
      const product = products.find((p) => p.id === productId);
      toast.success(`'${product.name}' añadido al carrito!`);
    } catch (err) {
      toast.error(`Error al añadir al carrito: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 border border-red-500/20 rounded-lg p-6 max-w-md">
          <p className="text-red-400 text-center">Error: {error}</p>
        </div>
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
                      src={product.imageUrl ? `http://localhost:3000/uploads/${product.imageUrl}` : `http://localhost:3000/uploads/computer.png`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all"></div>
                  </div>
                </Link>
                <div className="p-5 flex flex-col flex-grow">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">{product.Category?.name || "Sin Categoría"}</p>
                  <h3 className="text-lg font-bold text-white mb-3 flex-grow">{product.name}</h3>
                  <div className="flex items-end justify-between mt-auto">
                    <span className="text-2xl font-bold text-emerald-500">${parseFloat(product.price).toFixed(2)}</span>
                    <button
                      onClick={(e) => handleAddToCart(e, product.id)}
                      className="p-2 bg-emerald-500/10 text-emerald-400 rounded-full hover:bg-emerald-500/20 hover:text-emerald-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Añadir al carrito"
                      disabled={product.stock === 0}
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
