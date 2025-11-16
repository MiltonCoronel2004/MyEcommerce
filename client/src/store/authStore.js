import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiClient from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await apiClient.post('/users/login', {
          email,
          password,
        });
        const { token, user } = response.data;
        set({ token, user, isAuthenticated: true });
        return response.data;
      },

      register: async (userData) => {
        const response = await apiClient.post('/users/register', userData);
        return response.data;
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },

      verifyToken: async () => {
        try {
          const response = await apiClient.get('/users/verify');
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          console.error("Token verification failed, logging out.", error);
          get().logout();
        }
      },

      getProfile: async () => {
        // This can be simplified or removed if verifyToken is used consistently
        const response = await apiClient.get('/users/profile');
        set({ user: response.data });
        return response.data;
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useAuthStore;
