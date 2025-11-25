import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";
import useAuthStore from "../store/authStore";
import api from "../services/api";

const PaymentSuccessPage = () => {
  const { fetchCart } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const verificationInitiated = useRef(false);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setError("No se encontró el ID de la sesión de pago.");
        setLoading(false);
        return;
      }

      try {
        const data = await api("/payments/verify-session", {
          method: "POST",
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (data.error) throw new Error(data.error);

        setOrderId(data.orderId);
        toast.success(data.message || "¡Pago verificado con éxito!");
        fetchCart();
      } catch (err) {
        setError(err.message || "Ocurrió un error al verificar el pago.");
        toast.error(err.message || "Ocurrió un error al verificar el pago.");
      } finally {
        setLoading(false);
      }
    };

    if (!verificationInitiated.current) {
      verificationInitiated.current = true;
      verifyPayment();
    }
  }, [searchParams, fetchCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto animate-spin text-emerald-400 mb-4" size={60} />
          <h2 className="text-2xl font-bold text-white">Verificando tu pago...</h2>
          <p className="text-slate-400">Por favor, espera un momento.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-800 border border-red-700 rounded-lg p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto text-red-400 mb-6" size={80} />
          <h2 className="text-3xl font-bold text-white mb-4">Error en el Pago</h2>
          <p className="text-slate-400 text-lg mb-8">{error}</p>
          <Link to="/cart" className="block w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold">
            Volver al Carrito
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-lg p-8 text-center shadow-lg">
        <CheckCircle className="mx-auto text-emerald-400 mb-6" size={80} />
        <h2 className="text-3xl font-bold text-white mb-4">¡Pago Exitoso!</h2>
        <p className="text-slate-400 text-lg mb-8">
          {orderId
            ? `Gracias por tu compra. Tu pedido #${orderId} ha sido procesado correctamente.`
            : "Gracias por tu compra. Tu pedido ha sido procesado correctamente."}
        </p>
        <div className="space-y-4">
          <Link to="/orders" className="block w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold">
            Ver mis Pedidos
          </Link>
          <Link to="/" className="block w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold">
            Seguir Comprando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
