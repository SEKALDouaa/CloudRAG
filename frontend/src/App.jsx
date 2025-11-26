import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import DocumentsPage from './pages/DocumentsPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import LLMSettingsModal from './components/LLMSettingsModal';
import useAuthStore from './stores/authStore';

function App() {
  const { isAuthenticated, fetchLLMSettings, llmSettings } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  // Vérifier les settings au chargement si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated) {
      fetchLLMSettings().then(data => {
        // Afficher le modal si pas de clé API configurée
        if (data && !data.has_api_key) {
          setShowModal(true);
        }
      });
    }
  }, [isAuthenticated, fetchLLMSettings]);

  return (
    <BrowserRouter>
      {/* Modal obligatoire pour la configuration API */}
      <LLMSettingsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      <Routes>
        {/* Public routes without layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Routes with layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;