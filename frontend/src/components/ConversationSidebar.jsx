import { useState, useEffect } from 'react';
import { MessageSquare, Search, Plus, Trash2, X, Clock } from 'lucide-react';

function ConversationSidebar({ isOpen, onClose, onSelectConversation, onNewConversation, currentConversationId }) {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  // Recharger les conversations quand le sidebar s'ouvre
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = () => {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) {
      setConversations([]);
      return;
    }

    const storageKey = `conversations_${userEmail}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setConversations(parsed.sort((a, b) => b.updatedAt - a.updatedAt));
    }
  };

  const deleteConversation = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Voulez-vous vraiment supprimer cette conversation ?')) {
      const userEmail = localStorage.getItem('user_email');
      if (!userEmail) return;

      const storageKey = `conversations_${userEmail}`;
      const updated = conversations.filter(c => c.id !== id);
      setConversations(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));

      // Si c'est la conversation actuelle, commencer une nouvelle
      if (id === currentConversationId) {
        onNewConversation();
      }
    }
  };

  const filteredConversations = searchQuery
    ? conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : conversations;

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  // Grouper les conversations par date
  const groupedConversations = filteredConversations.reduce((groups, conv) => {
    const dateLabel = formatDate(conv.updatedAt);
    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(conv);
    return groups;
  }, {});

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 rounded-r-3xl border-r border-purple-500/30 shadow-2xl shadow-purple-500/20 z-[110] transform transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full rounded-r-3xl overflow-hidden">
          {/* Header avec gradient */}
          <div className="p-6 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-b border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Conversations
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-purple-500/20 p-2 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={() => {
                onNewConversation();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nouvelle conversation</span>
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-purple-500/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full bg-indigo-900/50 border border-purple-500/30 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/60 focus:bg-indigo-900/70 transition-all"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="bg-gradient-to-br from-purple-400/20 to-pink-600/20 p-6 rounded-2xl mb-4 shadow-lg shadow-purple-500/10">
                  <MessageSquare className="w-12 h-12 text-purple-400" />
                </div>
                <p className="text-gray-400 text-sm">
                  {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {!searchQuery && 'Commencez une nouvelle conversation'}
                </p>
              </div>
            ) : (
              Object.entries(groupedConversations).map(([dateLabel, convs]) => (
                <div key={dateLabel} className="space-y-2">
                  {/* Date Label */}
                  <div className="flex items-center gap-2 px-2 py-1">
                    <Clock className="w-3 h-3 text-purple-400" />
                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                      {dateLabel}
                    </span>
                  </div>

                  {/* Conversations for this date */}
                  {convs.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectConversation(conv);
                        onClose();
                      }}
                      className={`group p-3 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] ${
                        conv.id === currentConversationId
                          ? 'bg-gradient-to-r from-purple-500/30 to-pink-600/30 border-2 border-purple-500/60 shadow-lg shadow-purple-500/20'
                          : 'bg-indigo-900/30 border border-purple-500/20 hover:border-purple-500/50 hover:bg-indigo-900/50 hover:shadow-md hover:shadow-purple-500/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm truncate mb-1.5 group-hover:text-purple-300 transition-colors">
                            {conv.title}
                          </h3>
                          <p className="text-gray-400 text-xs truncate leading-relaxed">
                            {conv.preview}
                          </p>
                        </div>
                        <button
                          onClick={(e) => deleteConversation(conv.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(99, 102, 241, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }
      `}</style>
    </>
  );
}

export default ConversationSidebar;
