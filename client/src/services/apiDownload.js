import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const apiDownload = async (url) => {
  const { token } = useAuthStore.getState();

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${url}`, { headers });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.msg || "Error al descargar el archivo.");
  }

  const blob = await res.blob();
  const contentDisposition = res.headers.get("content-disposition");
  
  // Debugging toast
  toast.info(`Content-Disposition header: ${contentDisposition}`);

  let filename = "report.txt"; // Default filename
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
    if (filenameMatch && filenameMatch.length > 1) {
      filename = filenameMatch[1];
    }
  }

  return { blob, filename };
};

export default apiDownload;
