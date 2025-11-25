import { useState, useEffect } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import api from "../services/api";
import { Calendar, ListOrdered } from "lucide-react";
import { handleApiError } from "../utils/errorHandler";
import Loading from "../components/Loading";

const statusTranslations = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  
  cancelled: "Cancelado",
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data, ok } = await api("/orders");
        if (ok) {
          setOrders(data);
        } else {
          setOrders([]);
          handleApiError(data);
        }
      } catch (error) {
        setOrders([]);
        toast.error("Ocurrió un error de red al cargar los pedidos.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold text-white mb-8 tracking-tight">Mis Pedidos</h2>

        {orders.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
            <ListOrdered className="mx-auto text-slate-600 mb-4" size={64} />
            <p className="text-slate-400 text-lg mb-6">Aún no tienes pedidos.</p>
            <Link
              to="/"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/30"
            >
              Comenzar a Comprar
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id + "order"} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                <div className="p-6 bg-slate-700/50 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Pedido #{order.id}</h3>
                    <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                      <Calendar size={16} />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Total</p>
                      <p className="text-lg font-bold text-emerald-400">${parseFloat(order.total).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Estado</p>
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          order.status === "paid"
                            ? "bg-blue-500/20 text-blue-400"
                            : order.status === "shipped"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-600 text-slate-300"
                        }`}
                      >
                        {statusTranslations[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {order.OrderItems.map((item) => (
                    <div key={item.id + "item"} className="flex items-center gap-4">
                      <img
                        src={
                          item.Product.imageUrl
                            ? `${import.meta.env.VITE_SERVER_URL}/uploads/${item.Product.imageUrl}`
                            : `${import.meta.env.VITE_SERVER_URL}/uploads/computer.png`
                        }
                        alt={item.Product.name}
                        className="w-16 h-16 object-cover rounded-md border border-slate-700"
                      />
                      <div className="grow">
                        <p className="font-semibold text-white">{item.Product.name}</p>
                        <p className="text-sm text-slate-400">
                          {item.quantity} x ${parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-white">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
