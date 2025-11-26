import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import useAuthStore from '../stores/authStore';

export default function LLMSettingsForm({ compact = false, onSuccess }) {
  const { llmSettings, fetchLLMSettings, updateLLM, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    llm_model: '',
    api_key: ''
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Récupère les settings au chargement du composant
  useEffect(() => {
    fetchLLMSettings().then(data => {
      if (data) {
        setFormData({
          llm_model: data.llm_model || 'models/gemini-2.5-flash',
          api_key: data.api_key || ''
        });
      }
    });
  }, [fetchLLMSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
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
      setSuccessMessage('Paramètres mis à jour avec succès !');
      if (onSuccess) {
        onSuccess();
      }
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

  // Mode compact pour ChatPage (style violet cohérent)
  if (compact) {
    return (
      <div className="bg-indigo-900/40 backdrop-blur-sm border border-purple-500/40 rounded-2xl p-6 shadow-xl">
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 mb-4">
            <p className="text-green-300 text-sm">✓ {successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4">
            <p className="text-red-300 text-sm">✗ {errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Modèle LLM
            </label>
            <select
              name="llm_model"
              value={formData.llm_model}
              onChange={handleChange}
              className="w-full bg-indigo-900/40 text-white px-4 py-2 rounded-lg border border-purple-500/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="" className="bg-indigo-900 text-gray-400">-- Sélectionnez un modèle --</option>
              <option value="models/gemini-2.5-flash" className="bg-indigo-900">Gemini 2.5 Flash (Recommandé)</option>
              <option value="models/gemini-1.5-pro" className="bg-indigo-900">Gemini 1.5 Pro</option>
              <option value="models/gemini-1.5-flash" className="bg-indigo-900">Gemini 1.5 Flash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Clé API Google Gemini
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                name="api_key"
                value={formData.api_key}
                onChange={handleChange}
                placeholder="AIzaSy..."
                className="w-full bg-indigo-900/40 text-white px-4 py-2 pr-24 rounded-lg border border-purple-500/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-purple-400 hover:text-purple-300 font-medium"
              >
                {showApiKey ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </button>
        </form>
      </div>
    );
  }

  
  return (
    <div className="bg-indigo-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 shadow-xl">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Settings className="w-6 h-6 text-purple-400" />
        Configuration LLM
      </h3>

      {/* Alerte si pas de clé */}
      {llmSettings && !llmSettings.has_api_key && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-6">
          <p className="text-yellow-300 font-bold text-sm">⚠️ Configuration requise</p>
          <p className="text-yellow-200 text-sm mt-1">
            Vous devez configurer votre clé API Google Gemini pour utiliser l'application.
          </p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 mb-6">
          <p className="text-green-300 text-sm">✓ {successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
          <p className="text-red-300 text-sm">✗ {errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grid avec 2 colonnes comme "Informations du compte" */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Champ Modèle LLM */}
          <div className="bg-indigo-900/20 rounded-xl p-4 border border-purple-500/20">
            <label className="block text-gray-400 text-sm mb-2">
              Modèle LLM
            </label>
            <select
              name="llm_model"
              value={formData.llm_model}
              onChange={handleChange}
              className="w-full bg-indigo-900/30 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="" className="bg-indigo-900 text-gray-400">-- Sélectionnez un modèle --</option>
              <option value="models/gemini-2.5-flash" className="bg-indigo-900">Gemini 2.5 Flash (Recommandé)</option>
              <option value="models/gemini-1.5-pro" className="bg-indigo-900">Gemini 1.5 Pro</option>
              <option value="models/gemini-1.5-flash" className="bg-indigo-900">Gemini 1.5 Flash</option>
            </select>
          </div>

          {/* Champ API Key */}
          <div className="bg-indigo-900/20 rounded-xl p-4 border border-purple-500/20">
            <label className="block text-gray-400 text-sm mb-2">
              Clé API Google Gemini
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                name="api_key"
                value={formData.api_key}
                onChange={handleChange}
                placeholder="AIzaSy..."
                className="w-full bg-indigo-900/30 text-white px-4 py-2 pr-24 rounded-lg border border-purple-500/30 focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-purple-400 hover:text-purple-300 font-medium"
              >
                {showApiKey ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>
        </div>

        {/* Lien vers Google AI Studio */}
        <p className="text-sm text-gray-400">
          Obtenez votre clé sur{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Google AI Studio
          </a>
        </p>

        {/* Bouton Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </form>
    </div>
  );
}
