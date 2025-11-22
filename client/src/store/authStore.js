import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "react-toastify";
import { getCart, addToCart, updateCartItem, removeFromCart } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL;

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      cart: null,

      setUser: (newUser) => set({ user: newUser }),

      fetchCart: async () => {
        if (!get().token) return; // No intentar buscar el carrito si no hay token
        try {
          const data = await getCart();
          if (!data.error) {
            set({ cart: data });
          }
        } catch (error) {
          console.error("Error al obtener el carrito:", error);
        }
      },

      addProductToCart: async (productId, quantity) => {
        try {
          const data = await addToCart(productId, quantity);
          if (!data.error) {
            set({ cart: data.cart });
            toast.success(data.msg || "Producto añadido al carrito");
          } else {
            toast.error(data.msg || "Error al añadir el producto");
          }
        } catch (error) {
          toast.error("Error de red al añadir al carrito.");
        }
      },

      updateProductQuantity: async (productId, quantity) => {
        const originalCart = get().cart;
        const newQuantity = Math.max(0, quantity); // Ensure quantity is not negative

        const updatedCart = {
          ...originalCart,
          CartItems: originalCart.CartItems.map((item) =>
            item.productId === productId ? { ...item, quantity: newQuantity } : item
          ).filter(item => item.quantity > 0), // Filter out items with 0 quantity
        };

        set({ cart: updatedCart }); // Optimistic update

        try {
          if (newQuantity > 0) {
            await updateCartItem(productId, newQuantity);
          } else {
            await removeFromCart(productId);
          }
          // Optionally, you can fetch the cart again to ensure data consistency
          // get().fetchCart(); 
        } catch (error) {
          set({ cart: originalCart }); // Revert on error
          toast.error("Error al actualizar el carrito.");
        }
      },

      removeProductFromCart: async (productId) => {
        const originalCart = get().cart;

        const updatedCart = {
          ...originalCart,
          CartItems: originalCart.CartItems.filter(
            (item) => item.productId !== productId
          ),
        };

        set({ cart: updatedCart }); // Optimistic update

        try {
          await removeFromCart(productId);
          toast.info("Producto eliminado del carrito.");
        } catch (error) {
          set({ cart: originalCart }); // Revert on error
          toast.error("Error al eliminar el producto.");
        }
      },

      login: async (email, password) => {
        try {
          const res = await fetch(`${API_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (res.ok) {
            set({ token: data.token, user: data.user });
            get().fetchCart(); // Cargar el carrito después del login
            toast.success("¡Bienvenido de nuevo!");
          } else {
            toast.error(data.msg || "Error en el inicio de sesión.");
          }
          return data;
        } catch (error) {
          toast.error("Error de red o respuesta inválida del servidor.");
          return { error: true, msg: "Error de red o respuesta inválida del servidor." };
        }
      },

      register: async (userData = {}) => {
        try {
          const res = await fetch(`${API_URL}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });
          const data = await res.json();
          if (res.ok) {
            toast.success(data.msg || "¡Registro exitoso!");
          } else {
            if (data.errors) {
              data.errors.forEach((err) => toast.error(err.msg));
            } else {
              toast.error(data.msg || "Error en el registro.");
            }
          }
          return data;
        } catch (error) {
          toast.error("Error de red o respuesta inválida del servidor.");
          return { error: true, msg: "Error de red o respuesta inválida del servidor." };
        }
      },

      logout: () => {
        set({ token: null, user: null, cart: null });
        toast.info("Has cerrado sesión.");
      },

      validateToken: async () => {
        const { token } = get();

        if (!token) {
          set({ user: null });
          return;
        }

        try {
          const res = await fetch(`${API_URL}/users/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          if (res.ok) {
            set({ user: data });
            get().fetchCart(); // Sincronizar carrito al validar token
            return true;
          } else {
            get().logout();
            return false;
          }
        } catch (error) {
          get().logout();
        }
      },

      forgotPassword: async (email) => {
        try {
          const res = await fetch(`${API_URL}/users/forgotpassword`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          if (res.ok) {
            toast.success(data.data || "Revisa tu correo para el enlace de restablecimiento.");
          } else {
            toast.error(data.msg || "Error al enviar el correo de restablecimiento.");
          }
        } catch (error) {
          toast.error("Error de red o respuesta inválida del servidor.");
        }
      },

      resetPassword: async (token, password) => {
        try {
          const res = await fetch(`${API_URL}/users/resetpassword/${token}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.msg || "No se pudo restablecer la contraseña.");
          }
          toast.success(data.msg || "Contraseña restablecida con éxito.");
        } catch (error) {
          toast.error(error.message);
          throw error; // Re-throw error to be caught in the component
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;

