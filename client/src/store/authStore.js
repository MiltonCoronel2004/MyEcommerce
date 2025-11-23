import { handleApiError } from "../utils/errorHandler";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "react-toastify";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  login as apiLogin,
  register as apiRegister,
  getProfile,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
} from "../services/api";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // --- ESTADO ---
      token: null, // Almacena el JWT del usuario.
      user: null, // Almacena los datos del perfil del usuario.
      cart: null, // Almacena el estado del carrito de compras.

      // --- ACCIONES ---

      /** Actualiza el estado del usuario. */
      setUser: (newUser) => set({ user: newUser }),

      /** Obtiene el carrito del usuario desde el backend. */
      fetchCart: async () => {
        if (!get().token) return; // No hacer nada si no hay token.
        try {
          const { data, ok } = await getCart();
          if (ok) set({ cart: data });
        } catch (error) {
          console.error("Error al obtener el carrito:", error);
        }
      },

      /** Añade un producto al carrito llamando a la API. */
      addProductToCart: async (productId, quantity) => {
        try {
          const { data, ok } = await addToCart(productId, quantity);
          if (ok) {
            set({ cart: data.cart }); // Actualiza el estado del carrito con la respuesta.
            toast.success(data.msg || "Producto añadido al carrito");
          } else {
            handleApiError(data);
          }
        } catch (error) {
          toast.error("Error de red al añadir al carrito.");
        }
      },

      /**
       * Actualiza la cantidad de un producto en el carrito.
       * Utiliza una "actualización optimista" para una mejor experiencia de usuario:
       * 1. La UI se actualiza inmediatamente de forma local.
       * 2. Se realiza la llamada a la API.
       * 3. Si la API falla, el estado se revierte a su estado original.
       */
      updateProductQuantity: async (productId, quantity) => {
        const originalCart = get().cart;
        const newQuantity = Math.max(0, quantity); // Asegura que la cantidad no sea negativa.

        // Actualización optimista: se modifica el estado localmente.
        const updatedCart = {
          ...originalCart,
          CartItems: originalCart.CartItems.map((item) => (item.productId === productId ? { ...item, quantity: newQuantity } : item)).filter(
            (item) => item.quantity > 0
          ), // Elimina items si la cantidad es 0.
        };
        set({ cart: updatedCart });

        try {
          // Llamada a la API correspondiente.
          if (newQuantity > 0) await updateCartItem(productId, newQuantity);
          else await removeFromCart(productId);
        } catch (error) {
          set({ cart: originalCart }); // Revierte el cambio en caso de error.
          toast.error("Error al actualizar el carrito.");
        }
      },

      /**
       * Elimina un producto del carrito.
       * También utiliza una "actualización optimista".
       */
      removeProductFromCart: async (productId) => {
        const originalCart = get().cart;

        // Actualización optimista.
        const updatedCart = {
          ...originalCart,
          CartItems: originalCart.CartItems.filter((item) => item.productId !== productId),
        };
        set({ cart: updatedCart });

        try {
          await removeFromCart(productId);
          toast.info("Producto eliminado del carrito.");
        } catch (error) {
          set({ cart: originalCart }); // Reversión en caso de error.
          toast.error("Error al eliminar el producto.");
        }
      },

      /** Realiza el proceso de inicio de sesión. */
      login: async (email, password) => {
        try {
          const { data, ok } = await apiLogin(email, password);
          if (ok) {
            set({ token: data.token, user: data.user });
            get().fetchCart(); // Carga el carrito del usuario tras un login exitoso.
            toast.success("¡Bienvenido de nuevo!");
          } else {
            handleApiError(data);
          }
          return { data, ok };
        } catch (error) {
          toast.error("Error de red o respuesta inválida del servidor.");
          return { error: true, msg: "Error de red o respuesta inválida del servidor." };
        }
      },

      /** Realiza el proceso de registro de un nuevo usuario. */
      register: async (userData = {}) => {
        try {
          const { data, ok } = await apiRegister(userData);
          if (ok) {
            toast.success(data.msg || "¡Registro exitoso!");
          } else {
            handleApiError(data);
          }
          return { data, ok };
        } catch (error) {
          toast.error("Error de red o respuesta inválida del servidor.");
          return { error: true, msg: "Error de red o respuesta inválida del servidor." };
        }
      },

      /** Cierra la sesión del usuario, limpiando el estado. */
      logout: () => {
        set({ token: null, user: null, cart: null });
        toast.info("Has cerrado sesión.");
      },

      /**
       * Valida el token almacenado al cargar la aplicación.
       * Permite mantener al usuario logueado entre sesiones.
       */
      validateToken: async () => {
        const { token } = get();
        if (!token) {
          set({ user: null, token: null });
          return;
        }

        try {
          const { data, ok } = await getProfile();
          if (ok) {
            set({ user: data });
            get().fetchCart(); // Sincroniza el carrito al validar la sesión.
            return true;
          } else {
            get().logout(); // Si el token es inválido o expiró, cierra la sesión.
            return false;
          }
        } catch (error) {
          get().logout();
        }
      },

      /** Envía la solicitud para restablecer la contraseña. */
      forgotPassword: async (email) => {
        try {
          const { data, ok } = await apiForgotPassword(email);
          if (ok) {
            toast.success(data.data || "Revisa tu correo para el enlace de restablecimiento.");
          } else {
            handleApiError(data);
          }
        } catch (error) {
          toast.error("Error de red o respuesta inválida del servidor.");
        }
      },

      /** Restablece la contraseña usando el token y la nueva contraseña. */
      resetPassword: async (token, password) => {
        try {
          const { data, ok } = await apiResetPassword(token, password);
          if (!ok) {
            throw new Error(data.msg || "No se pudo restablecer la contraseña.");
          }
          toast.success(data.msg || "Contraseña restablecida con éxito.");
        } catch (error) {
          toast.error(error.message);
          throw error; // Re-lanza el error para que pueda ser manejado en el componente.
        }
      },
    }),
    {
      name: "auth-storage", // Nombre de la clave en localStorage.
      storage: createJSONStorage(() => localStorage), // Usa localStorage para la persistencia.
    }
  )
);

export default useAuthStore;
