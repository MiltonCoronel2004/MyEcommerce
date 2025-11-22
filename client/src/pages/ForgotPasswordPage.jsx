import React, { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowLeft, LoaderCircle } from "lucide-react";
import useAuthStore from "../store/authStore";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const forgotPassword = useAuthStore((state) => state.forgotPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) return setError("Por favor, introduce tu correo electrónico.");

    setLoading(true);
    try {
      await forgotPassword(email);
      setMessage("Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña.");
    } catch (err) {
      setError("Ha ocurrido un error. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Restablecer Contraseña</h2>
          <p className="text-slate-400 text-center mb-8">Introduce tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            {message && <p className="text-emerald-400 text-sm text-center">{message}</p>}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-slate-500" size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="johndoe@example.com"
                  disabled={!!message || loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center hover:shadow-lg hover:shadow-emerald-500/30 disabled:bg-slate-600 disabled:cursor-not-allowed"
              disabled={!!message || loading}
            >
              {loading ? <LoaderCircle className="animate-spin" size={24} /> : "Enviar Enlace"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-slate-400 hover:text-emerald-300 flex items-center justify-center gap-2 transition-colors">
              <ArrowLeft size={16} />
              Volver a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
