import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import useAuthStore from "../store/authStore";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import api from "../services/api";

const CartPage = () => {
  const navigate = useNavigate();
  const { user, cart, token, fetchCart, updateProductQuantity, removeProductFromCart } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleFetchCart = useCallback(async () => {
    if (token) {
      setLoading(true);
      await fetchCart();
      setLoading(false);
    }
  }, [token, fetchCart]);

  useEffect(() => {
    handleFetchCart();
  }, [handleFetchCart]);

  const handleQuantityInputChange = (productId, value) => {
    const quantity = Number(value);
    if (!isNaN(quantity)) {
      updateProductQuantity(productId, quantity);
    }
  };

  const handleQuantityChange = (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    updateProductQuantity(productId, newQty);
  };

  const checkout = async () => {
    const requiredFields = ["email", "addressLine1", "city", "state", "postalCode", "country"];
    const missingFields = requiredFields.filter(field => !user[field]);

    if (missingFields.length > 0) {
      toast.error("Por favor, completa tu información de perfil (email y dirección) antes de proceder al pago.");
      navigate('/profile');
      return;
    }

    try {
      const { url } = await api("/payments/create-checkout-session", {
        method: "POST",
      });
      window.location.href = url;
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-4xl font-bold text-white mb-8 tracking-tight">Tu Carrito</h2>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
            <ShoppingCart className="mx-auto text-slate-600 mb-4" size={64} />
            <p className="text-slate-400 text-lg mb-6">Tu carrito está vacío.</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/30"
            >
              Comenzar a Comprar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const total = cart.CartItems.reduce((acc, item) => {
    return acc + item.quantity * item.Product.price;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold text-white mb-8 tracking-tight">Tu Carrito</h2>

        <div className="space-y-4 mb-8">
          {cart.CartItems.map((item, index) => (
            <div
              key={item.id + item.Product.price + index}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.Product.name}</h3>
                  <p className="text-emerald-400 font-medium">${item.Product.price}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity, -1)}
                      className="p-2 hover:bg-slate-600 rounded transition-colors text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityInputChange(item.productId, e.target.value)}
                      className="w-16 text-center bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-emerald-500"
                      min="0"
                      max={item.Product.stock}
                    />
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity, 1)}
                      className="p-2 hover:bg-slate-600 rounded transition-colors text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity >= item.Product.stock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="text-right min-w-[5rem]">
                    <p className="text-white font-semibold">${(item.quantity * item.Product.price).toFixed(2)}</p>
                  </div>

                  <button
                    onClick={() => removeProductFromCart(item.productId)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Total</h3>
            <p className="text-3xl font-bold text-emerald-400">${total.toFixed(2)}</p>
          </div>
          <button
            onClick={checkout}
            className="w-full px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/30 text-lg"
          >
            Proceder al Pago
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
