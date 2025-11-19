import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import useAuthStore from "../store/authStore";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import api from "../services/api";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("/cart");
      setCart(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token, fetchCart]);

  const handleUpdateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      await api(`/cart/update/${productId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });
      fetchCart();
    } catch (err) {
      toast.error(`Error al actualizar la cantidad: ${err.message}`);
    }
  };

  const handleQuantityChange = (productId, currentQty, delta, maxStock) => {
    const newQty = currentQty + delta;
    if (newQty >= 1 && newQty <= maxStock) {
      handleUpdateQuantity(productId, newQty);
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      await api(`/cart/remove/${productId}`, {
        method: "DELETE",
      });
      toast.success("Producto eliminado del carrito.");
      fetchCart();
    } catch (err) {
      toast.error(`Error al eliminar el producto: ${err.message}`);
    }
  };

  const handleCheckout = async () => {
    try {
      await api("/orders", {
        method: "POST",
      });
      toast.success("¡Pedido realizado con éxito!");
      navigate("/profile"); // Navigate to profile to see orders
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  if (loading) {
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
          {cart.CartItems.map((item) => (
            <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.Product.name}</h3>
                  <p className="text-emerald-400 font-medium">${item.Product.price}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity, -1, item.Product.stock)}
                      className="p-2 hover:bg-slate-600 rounded transition-colors text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-white font-medium min-w-[2rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity, 1, item.Product.stock)}
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
                    onClick={() => handleRemoveProduct(item.productId)}
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
            onClick={handleCheckout}
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
