import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "react-toastify";
import useAuthStore from "../store/authStore";
import { ShoppingCart, ArrowLeft, Package, Minus, Plus } from "lucide-react";
import api from "../services/api";
import Loading from "../components/Loading";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchProductById = async () => {
      setLoading(true);
      try {
        const data = await api(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProductById();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.info("Por favor, inicia sesión para añadir artículos a tu carrito.");
      navigate("/login");
      return;
    }
    try {
      await api("/cart/add", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      toast.success(`${quantity} de ${product.name} añadido(s) al carrito!`);
    } catch (err) {
      toast.error(`Error al añadir al carrito: ${err.message}`);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  if (loading) {
    return <Loading />;
  }

  if (!product) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Producto no encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors">
          <ArrowLeft size={20} />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 flex items-center justify-center">
            <img
              src={product.imageUrl ? `http://localhost:3000/uploads/${product.imageUrl}` : `https://i.imgur.com/1q2h3p5.png`}
              alt={product.name}
              className="max-w-full h-auto rounded-lg"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">{product.name}</h1>
              <p className="text-slate-400 text-lg leading-relaxed">{product.description}</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm">Precio</span>
                <span className="text-3xl font-bold text-emerald-400">${parseFloat(product.price).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Package size={20} className="text-emerald-400" />
                <span>En Stock: {product.stock} unidades</span>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <label htmlFor="quantity" className="text-slate-400 text-sm mb-3 block">
                Cantidad:
              </label>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={decrementQuantity}
                  className="p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity <= 1}
                >
                  <Minus size={20} />
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 1 && val <= product.stock) setQuantity(val);
                  }}
                  min="1"
                  max={product.stock}
                  className="w-20 text-center bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={incrementQuantity}
                  className="p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={quantity >= product.stock}
                >
                  <Plus size={20} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                {product.stock === 0 ? "Agotado" : "Añadir al Carrito"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
