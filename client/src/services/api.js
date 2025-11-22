import useAuthStore from "../store/authStore";

const BASE_URL = "http://localhost:3000/api";

const api = async (url, options = {}) => {
  const { token } = useAuthStore.getState();

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = {
    ...options,
    headers,
  };

  const res = await fetch(`${BASE_URL}${url}`, config);
  const data = await res.json();
  console.log(data);

  return data;
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

export default api;
