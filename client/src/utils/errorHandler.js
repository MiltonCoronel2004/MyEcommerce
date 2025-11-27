import { toast } from "react-toastify";

export const handleApiError = (data) => {
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    // Caso para errores de validación de express-validator (devuelve un array)
    data.errors.forEach((err) => {
      const errorMessage = typeof err === "string" ? err : err.msg || "Error de validación desconocido.";
      toast.error(errorMessage);
    });
  } else if (data?.msg) {
    // Caso para errores generales con una propiedad 'msg'
    toast.error(data.msg);
  } else if (data?.message) {
    // Fallback para errores con una propiedad 'message'
    toast.error(data.message);
  } else {
    // Fallback para errores inesperados o desconocidos
    toast.error("Ocurrió un error desconocido.");
  }
};
