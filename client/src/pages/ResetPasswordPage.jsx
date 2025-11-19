import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Lock, ArrowLeft } from "lucide-react";
import useAuthStore from "../store/authStore";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();
  const resetPassword = useAuthStore((state) => state.resetPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      return setError("Ambos campos de contraseña son obligatorios.");
    }
    if (password !== confirmPassword) {
      return setError("Las contraseñas no coinciden.");
    }
    if (password.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres.");
    }

    try {
      await resetPassword(token, password);
      setMessage("Tu contraseña ha sido restablecida con éxito. Serás redirigido a la página de inicio de sesión.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError("El enlace es inválido, ha expirado o ha ocurrido un error. Por favor, solicita un nuevo enlace.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Introduce tu Nueva Contraseña</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            {message && <p className="text-emerald-400 text-sm text-center">{message}</p>}

            {!message && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="text-slate-500" size={20} />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="text-slate-500" size={20} />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/30"
                >
                  Restablecer Contraseña
                </button>
              </>
            )}
          </form>

          {message && (
            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-slate-400 hover:text-emerald-300 flex items-center justify-center gap-2 transition-colors">
                <ArrowLeft size={16} />
                Ir a Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
