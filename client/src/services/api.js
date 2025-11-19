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

  return data;
};

export const getCategories = () => api("/categories");

export default api;
