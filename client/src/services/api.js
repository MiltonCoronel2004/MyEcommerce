import useAuthStore from "../store/authStore";

const BASE_URL = "http://localhost:3000/api";

/**
 * Wrapper personalizado para la API `fetch`.
 * Simplifica las llamadas a la API del backend al automatizar tareas comunes:
 *  - Prefija todas las URLs con la URL base de la API.
 *  - Obtiene el token de autenticación del `authStore` y lo inyecta en los headers.
 *  - Establece el `Content-Type` a `application/json` por defecto.
 *  - Parsea la respuesta JSON.
 */
const api = async (url, options = {}) => {
  // Accede al estado de Zustand fuera de un componente de React.
  // Es útil para obtener el token de forma síncrona justo antes de una llamada a la API.
  const { token } = useAuthStore.getState();

  const headers = {
    ...options.headers,
  };

  // No se establece 'Content-Type' si se está subiendo un archivo,
  // ya que el navegador lo manejará automáticamente con el 'boundary' correcto.
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Si hay un token, se añade el header de autorización.
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

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

// --- Funciones de API específicas ---
// Son atajos para realizar llamadas comunes a la API, haciendo el código más legible.

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
