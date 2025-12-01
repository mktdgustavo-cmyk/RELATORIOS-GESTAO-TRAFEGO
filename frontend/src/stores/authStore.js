import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      // Login
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
          });

          const { user, token } = response.data.data;

          // Configurar axios com token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            user,
            token,
            loading: false,
            error: null
          });

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Erro ao fazer login';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      // Register
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/register`, userData);

          const { user, token } = response.data.data;

          // Configurar axios com token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            user,
            token,
            loading: false,
            error: null
          });

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Erro ao registrar';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      // Logout
      logout: () => {
        delete axios.defaults.headers.common['Authorization'];
        set({ user: null, token: null });
      },

      // Update Profile
      updateProfile: async (updates) => {
        const user = get().user;
        set({ user: { ...user, ...updates } });
      },

      // Initialize
      initialize: () => {
        const token = get().token;
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token
      })
    }
  )
);

// Inicializar axios com token ao carregar
useAuthStore.getState().initialize();
