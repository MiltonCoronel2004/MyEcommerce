import { toast } from "react-toastify";

/**
 * Maneja y muestra errores de API de forma consistente.
 *
 * Esta función centraliza la lógica para interpretar los objetos de error
 * que vienen del backend y mostrarlos al usuario con `react-toastify`.
 * Puede manejar tanto un array de errores (de express-validator) como
 * un único mensaje de error.
 *
 * @param {object} data - El objeto 'data' de la respuesta de la API, que puede contener el error.
 */
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
