import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setUser: (newUser) => set({ user: newUser }),

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
        set({ token: null, user: null });
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
            return true;
          } else {
            get().logout();
            return false;
          }
        } catch (error) {
          get().logout();
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
