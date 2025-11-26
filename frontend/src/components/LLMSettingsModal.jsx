import { useState, useEffect } from 'react';
import useAuthStore from '../stores/authStore';

export default function LLMSettingsModal({ isOpen, onClose }) {
  const { llmSettings, fetchLLMSettings, updateLLM, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    llm_model: 'models/gemini-2.5-flash',
    api_key: ''
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Récupère les settings au chargement
  useEffect(() => {
    if (isOpen) {
      fetchLLMSettings().then(data => {
        if (data && data.api_key) {
          setFormData({
            llm_model: data.llm_model || 'models/gemini-2.5-flash',
            api_key: data.api_key || ''
          });
        }
      });
    }
  }, [isOpen, fetchLLMSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!formData.api_key.trim()) {
      setErrorMessage('La clé API est obligatoire');
      return;
    }

    if (!formData.llm_model.trim()) {
      setErrorMessage('Le modèle LLM est obligatoire');
      return;
    }

    const result = await updateLLM(formData.llm_model, formData.api_key);

    if (result.success) {
      // Ferme le modal après succès
      onClose();
    } else {
      setErrorMessage(result.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Configuration requise</h2>
          {/* Pas de bouton de fermeture car la configuration est obligatoire */}
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Vous devez configurer votre clé API Google Gemini pour utiliser CloudRAG.
                Cette clé est nécessaire pour analyser les documents et répondre à vos questions.
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            ✗ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champ Modèle LLM */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modèle LLM
            </label>
            <select
              name="llm_model"
              value={formData.llm_model}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="models/gemini-2.5-flash">Gemini 2.5 Flash (Recommandé)</option>
              <option value="models/gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="models/gemini-1.5-flash">Gemini 1.5 Flash</option>
            </select>
          </div>

          {/* Champ API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clé API Google Gemini
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                name="api_key"
                value={formData.api_key}
                onChange={handleChange}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                {showApiKey ? '🙈 Masquer' : '👁️ Afficher'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              <strong>Comment obtenir votre clé :</strong>
            </p>
            <ol className="text-sm text-gray-600 mt-1 ml-4 list-decimal">
              <li>Visitez <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></li>
              <li>Connectez-vous avec votre compte Google</li>
              <li>Cliquez sur "Create API Key"</li>
              <li>Copiez la clé et collez-la ici</li>
            </ol>
          </div>

          {/* Bouton Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer et continuer'}
          </button>
        </form>
      </div>
    </div>
  );
}
