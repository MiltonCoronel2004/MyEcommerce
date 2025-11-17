import React, { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
// import apiClient from "../services/api";
import { User, Phone, MapPin, Mail, AlertCircle, CheckCircle, Save } from "lucide-react";

const ProfilePage = () => {
  const { user, token, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        addressLine1: user.addressLine1 || "",
        addressLine2: user.addressLine2 || "",
        city: user.city || "",
        state: user.state || "",
        postalCode: user.postalCode || "",
        country: user.country || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      setUser(formData);
      setSuccess("¡Perfil actualizado con éxito!");
    } catch (err) {
      console.log(err);
      const errorMessage = err.res?.data?.message || "Ocurrió un error desconocido.";
      setError(errorMessage);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold text-white mb-8 tracking-tight">Mi Perfil</h2>

        {/* <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <Mail className="text-emerald-400" size={20} />
            <div>
              <p className="text-sm text-slate-400">Dirección de Correo Electrónico</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
          </div>
        </div> */}

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-emerald-400 text-sm">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-slate-500" size={20} />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Nombre"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">
                  Apellido
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-slate-500" size={20} />
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Apellido"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-slate-500" size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="johndoe@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="text-slate-500" size={20} />
                </div>
                <input
                  id="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="text-emerald-400" size={20} />
                Dirección de Envío
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="addressLine1" className="block text-sm font-medium text-slate-300 mb-2">
                    Línea de Dirección 1
                  </label>
                  <input
                    id="addressLine1"
                    type="text"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Dirección"
                  />
                </div>

                <div>
                  <label htmlFor="addressLine2" className="block text-sm font-medium text-slate-300 mb-2">
                    Línea de Dirección 2
                  </label>
                  <input
                    id="addressLine2"
                    type="text"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Apartamento, suite, etc. (opcional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-slate-300 mb-2">
                      Ciudad
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Ciudad"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-slate-300 mb-2">
                      Estado / Provincia
                    </label>
                    <input
                      id="state"
                      type="text"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Estado / Provincia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-slate-300 mb-2">
                      Código Postal
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Código Postal"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-slate-300 mb-2">
                      País
                    </label>
                    <input
                      id="country"
                      type="text"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="País"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Actualizar Perfil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
