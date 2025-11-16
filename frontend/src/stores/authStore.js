import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      const { access_token, email: userEmail, prenom, nom } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_email', userEmail);

      // Sauvegarder le nom complet si disponible
      if (prenom || nom) {
        const fullName = `${prenom || ''} ${nom || ''}`.trim();
        localStorage.setItem(`user_name_${userEmail}`, fullName);
      }

      // Enregistrer la date de première connexion si elle n'existe pas
      const memberSinceKey = `member_since_${userEmail}`;
      if (!localStorage.getItem(memberSinceKey)) {
        localStorage.setItem(memberSinceKey, new Date().toISOString());
      }

      set({
        user: { email: userEmail, name: `${prenom || ''} ${nom || ''}`.trim() },
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.register(userData);

      // Stocker le nom complet de l'utilisateur
      if (userData.email && (userData.nom || userData.prenom)) {
        const fullName = `${userData.prenom || ''} ${userData.nom || ''}`.trim();
        localStorage.setItem(`user_name_${userData.email}`, fullName);
      }

      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur d'inscription";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  updateLLM: async (llmModel, apiKey) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.updateLLM({ llm_model: llmModel, api_key: apiKey });
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de mise à jour';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
