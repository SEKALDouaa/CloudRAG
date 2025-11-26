import { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import LLMSettingsForm from '../components/LLMSettingsForm';

function ChatPage() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 relative overflow-hidden -mt-24 pt-24">
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col" style={{ minHeight: 'calc(100vh - 96px)' }}>
        {/* Header */}
        <div className="px-8 pt-6 pb-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              Chat RAG
            </h1>
            <p className="text-gray-300">
              Posez vos questions sur vos documents
            </p>

            {/* Bouton pour afficher/masquer les paramètres */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {showSettings ? '✕ Masquer les paramètres' : '⚙️ Paramètres API'}
            </button>
          </div>

          {/* Formulaire de configuration (collapsible) */}
          {showSettings && (
            <div className="mt-6 max-w-2xl mx-auto">
              <LLMSettingsForm
                compact={true}
                onSuccess={() => setShowSettings(false)}
              />
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <div className="flex-1 px-4 pb-4 overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}

export default ChatPage;