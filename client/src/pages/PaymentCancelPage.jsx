import { Link } from "react-router";
import { XCircle } from "lucide-react";

const PaymentCancelPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-lg p-8 text-center shadow-lg">
        <XCircle className="mx-auto text-red-400 mb-6" size={80} />
        <h2 className="text-3xl font-bold text-white mb-4">Pago Cancelado</h2>
        <p className="text-slate-400 text-lg mb-8">
          Tu pago ha sido cancelado. Puedes volver a tu carrito e intentarlo de nuevo.
        </p>
        <Link
          to="/cart"
          className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
        >
          Volver al Carrito
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
