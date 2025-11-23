import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { ListOrdered, Calendar, Truck, XCircle, ChevronDown, Download } from "lucide-react";
import { handleApiError } from "../../utils/errorHandler";
import Loading from "../../components/Loading";
import useAuthStore from "../../store/authStore";

const b64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
};

const statusTranslations = {
  paid: "Pagado",
  shipped: "Enviado",
  cancelled: "Cancelado",
};

const OrderListPage = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchAllOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, ok } = await api("/orders/admin/all");
      if (ok) {
        setOrders(data);
      } else {
        setOrders([]);
        handleApiError(data);
      }
    } catch (error) {
      setOrders([]);
      toast.error("Error de red al cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExport = async (format) => {
    try {
      toast.info("Generando reporte...");
      const { data, ok } = await api(`/reports/orders?format=${format}`);
      if (!ok) {
        return handleApiError(data);
      }
      const { fileData, filename } = data;
      const blob = b64toBlob(fileData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("¡Reporte descargado!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const { data, ok } = await api(`/orders/admin/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      if (ok) {
        toast.success(`Pedido #${orderId} marcado como ${statusTranslations[status]}.`);
        fetchAllOrders(); // Refresh orders
      } else {
        handleApiError(data);
      }
    } catch (err) {
      toast.error(err.message || "Error al actualizar el estado del pedido.");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-white tracking-tight">Todos los Pedidos</h2>
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-600 hover:border-emerald-500/30 rounded-lg transition-all font-medium"
            >
              <Download size={20} />
              <span>Exportar</span>
              <ChevronDown size={20} className={`transition-transform ${isExportMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-10">
                <button onClick={() => handleExport("csv")} className="w-full text-left block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                  Exportar como CSV
                </button>
                <button onClick={() => handleExport("pdf")} className="w-full text-left block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                  Exportar como PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
            <ListOrdered className="mx-auto text-slate-600 mb-4" size={64} />
            <p className="text-slate-400 text-lg">No hay pedidos para mostrar.</p>
          </div>
        ) : (
                    <div className="space-y-8">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                          <div className="p-6 bg-slate-700/50 flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-bold text-white">Pedido #{order.id}</h3>
                              <p className="text-sm text-slate-400">
                                Usuario: {order.User.firstName} ({order.User.email})
                              </p>
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
                              <div key={item.id} className="flex items-center gap-4">
                                <img
                                  src={
                                    item.Product.imageUrl
                                      ? `${import.meta.env.VITE_SERVER_URL}/uploads/${item.Product.imageUrl}`
                                      : "https://i.imgur.com/1q2h3p5.png"
                                  }
                                  alt={item.Product.name}
                                  className="w-16 h-16 object-cover rounded-md border border-slate-700"
                                />
                                <div className="flex-grow">
                                  <p className="font-semibold text-white">{item.Product.name}</p>
                                  <p className="text-sm text-slate-400">
                                    {item.quantity} x ${parseFloat(item.price).toFixed(2)}
                                  </p>
                                </div>
                                <p className="font-semibold text-white">${(item.quantity * item.price).toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
          
                          <div className="p-4 bg-slate-800 border-t border-slate-700 flex items-center justify-end gap-3">
                            {order.status === "paid" && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, "shipped")}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                                disabled={order.status === "shipped"}
                              >
                                <Truck size={16} />
                                Marcar como Enviado
                              </button>
                            )}
                            {order.status !== "cancelled" && order.status !== "shipped" && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                              >
                                <XCircle size={16} />
                                Cancelar Pedido
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>        )}
      </div>
    </div>
  );
};

export default OrderListPage;
