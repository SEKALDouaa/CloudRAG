import { useState, useEffect } from 'react';
import { History, Trash2, Clock, X } from 'lucide-react';
import { chatAPI } from '../services/api';

function ChatHistory({ onLoadConversation, isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await chatAPI.getChatHistory();
      setHistory(response.data);
    } catch (err) {
      setError('Erreur de chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const handleDelete = async (historyId) => {
    if (!window.confirm('Supprimer cette conversation ?')) return;

    try {
      await chatAPI.deleteChatHistory(historyId);
      setHistory(history.filter(h => h.id !== historyId));
    } catch (err) {
      alert('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Supprimer tout l\'historique ?')) return;

    try {
      await chatAPI.clearChatHistory();
      setHistory([]);
    } catch (err) {
      alert('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const handleLoadConversation = (item) => {
    onLoadConversation({
      question: item.question,
      answer: item.answer,
      sources: item.sources
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-96 bg-indigo-950/95 backdrop-blur-xl border-l border-cyan-500/30 z-50 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Historique</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Tout supprimer
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Chargement...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-red-400">{error}</p>
              <button
                onClick={fetchHistory}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <History className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400">Aucun historique</p>
              <p className="text-sm text-gray-500 mt-2">
                Vos conversations apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="group bg-indigo-900/40 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-500/40 transition-all cursor-pointer"
                  onClick={() => handleLoadConversation(item)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.created_at)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>

                  <p className="text-white font-medium text-sm mb-2 line-clamp-2">
                    {item.question}
                  </p>
                  <p className="text-gray-400 text-xs line-clamp-2">
                    {item.answer}
                  </p>

                  {item.sources && item.sources.length > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-xs text-cyan-400">
                        {item.sources.length} source{item.sources.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatHistory;
