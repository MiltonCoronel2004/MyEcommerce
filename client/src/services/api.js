import useAuthStore from "../store/authStore";

const BASE_URL = "http://localhost:3000/api";

const api = async (url, options = {}) => {
  const { token } = useAuthStore.getState();

  const headers = {
    ...options.headers,
  };

  // Solo asignar JSON. Si el body es FormData, no tocar Content-Type.
  // El navegador debe generar el multipart/form-data con su boundary.
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";

  // Si hay un token, se añade el header de autorización.
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = {
    ...options,
    headers,
  };

  const res = await fetch(`${BASE_URL}${url}`, config);
  const data = await res.json();

  // Devuelve un objeto unificado que incluye los datos, el estado 'ok' y el código de estado.
  // Esto permite un manejo de errores más robusto en el store o componente que llama.
  return { data, ok: res.ok, status: res.status };
};

export const getCategories = () => api("/categories");

export const getCart = () => api("/cart");

export const addToCart = (productId, quantity) =>
  api("/cart/add", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
export const updateCartItem = (productId, quantity) =>
  api(`/cart/update/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
export const removeFromCart = (productId) =>
  api(`/cart/remove/${productId}`, {
    method: "DELETE",
  });

// --- Funciones de API de Usuario ---
export const login = (email, password) =>
  api("/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const register = (userData) =>
  api("/users/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

export const getProfile = () => api("/users/profile");

export const forgotPassword = (email) =>
  api("/users/forgotpassword", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const resetPassword = (token, password) =>
  api(`/users/resetpassword/${token}`, {
    method: "PUT",
    body: JSON.stringify({ password }),
  });

export default api;
