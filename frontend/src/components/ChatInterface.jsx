import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Menu, ExternalLink, Trash2, Copy, RefreshCw, Search, X } from 'lucide-react';
import { chatAPI, documentsAPI } from '../services/api';
import ConversationSidebar from './ConversationSidebar';
import ReactMarkdown from 'react-markdown';

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sauvegarder la conversation à chaque changement de messages
  useEffect(() => {
    if (messages.length > 0) {
      saveCurrentConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, currentConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sauvegarder la conversation actuelle
  const saveCurrentConversation = () => {
    if (messages.length === 0) return;

    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) return; // Ne pas sauvegarder si pas d'utilisateur connecté

    const storageKey = `conversations_${userEmail}`;
    const conversations = JSON.parse(localStorage.getItem(storageKey) || '[]');

    // Générer un titre basé sur la première question
    const firstUserMessage = messages.find(m => m.type === 'user');
    const title = firstUserMessage
      ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
      : 'Nouvelle conversation';

    // Aperçu de la dernière réponse
    const lastAIMessage = [...messages].reverse().find(m => m.type === 'ai');
    const preview = lastAIMessage
      ? lastAIMessage.content.substring(0, 60) + '...'
      : 'Pas de réponse encore';

    const conversationData = {
      id: currentConversationId || Date.now().toString(),
      title,
      preview,
      messages,
      createdAt: currentConversationId
        ? conversations.find(c => c.id === currentConversationId)?.createdAt || Date.now()
        : Date.now(),
      updatedAt: Date.now()
    };

    // Mettre à jour ou ajouter
    const existingIndex = conversations.findIndex(c => c.id === conversationData.id);
    if (existingIndex !== -1) {
      conversations[existingIndex] = conversationData;
    } else {
      conversations.unshift(conversationData);
    }

    localStorage.setItem(storageKey, JSON.stringify(conversations));

    if (!currentConversationId) {
      setCurrentConversationId(conversationData.id);
    }
  };

  // Nouvelle conversation
  const handleNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  // Charger une conversation
  const handleSelectConversation = (conversation) => {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleDocumentClick = async (documentId) => {
    try {
      const response = await documentsAPI.getDocumentFile(documentId);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du document:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatAPI.askQuestion(input.trim());
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response.answer || response.data.response,
        sources: response.data.response.ranked_documents || [],
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: error.response?.data?.error || 'Une erreur est survenue. Assurez-vous d\'avoir uploadé des documents.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Voulez-vous vraiment effacer la conversation actuelle ?')) {
      // Supprimer la conversation du localStorage
      if (currentConversationId) {
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        const updated = conversations.filter(c => c.id !== currentConversationId);
        localStorage.setItem('conversations', JSON.stringify(updated));
      }
      handleNewConversation();
    }
  };

  // Copier le contenu d'un message
  const handleCopyMessage = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  // Régénérer la dernière réponse
  const handleRegenerateResponse = async () => {
    if (messages.length < 2) return;

    // Trouver le dernier message utilisateur
    const lastUserMessage = [...messages].reverse().find(msg => msg.type === 'user');
    if (!lastUserMessage) return;

    // Supprimer la dernière réponse AI
    const messagesWithoutLastAI = messages.filter((msg, idx) => {
      if (idx === messages.length - 1 && msg.type === 'ai') {
        return false;
      }
      return true;
    });

    setMessages(messagesWithoutLastAI);
    setIsLoading(true);

    try {
      const response = await chatAPI.askQuestion(lastUserMessage.content);
      const aiMessage = {
        id: Date.now(),
        type: 'ai',
        content: response.data.response.answer || response.data.response,
        sources: response.data.response.ranked_documents || [],
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now(),
        type: 'error',
        content: error.response?.data?.error || 'Une erreur est survenue.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les messages selon la recherche
  const filteredMessages = searchQuery
    ? messages.filter(msg =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="flex flex-col h-[600px]">
      {/* Search Bar */}
      {isSearchOpen && (
        <div className="mb-3 flex gap-2 items-center bg-indigo-900/30 p-3 rounded-xl border border-purple-500/30">
          <Search className="w-4 h-4 text-purple-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans la conversation..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {filteredMessages.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-400">Aucun message trouvé pour "{searchQuery}"</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gradient-to-br from-purple-400 to-pink-600 p-6 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
              <Bot className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Commencez une conversation
            </h3>
            <p className="text-gray-400 max-w-md">
              Posez des questions sur vos documents. L'IA vous répondra en se basant sur le contenu que vous avez uploadé.
            </p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'ai' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : message.type === 'error'
                    ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                    : 'bg-indigo-900/50 border border-purple-500/30 text-gray-200'
                }`}
              >
                {message.type === 'ai' || message.type === 'error' ? (
                  <div className="markdown-content">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="ml-2">{children}</li>,
                        code: ({ inline, children }) =>
                          inline ? (
                            <code className="bg-indigo-800/50 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-xs">
                              {children}
                            </code>
                          ) : (
                            <code className="block bg-indigo-800/50 p-2 rounded my-2 text-cyan-300 font-mono text-xs overflow-x-auto">
                              {children}
                            </code>
                          ),
                        h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-white">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-white">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-bold mb-2 text-white">{children}</h3>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-purple-500 pl-3 my-2 italic text-gray-300">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                )}

                {/* Action Buttons for AI messages */}
                {message.type === 'ai' && (
                  <div className="flex gap-2 mt-3 pt-2 border-t border-purple-500/10">
                    <button
                      onClick={() => handleCopyMessage(message.content, message.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-cyan-400 transition-colors"
                      title="Copier la réponse"
                    >
                      {copiedMessageId === message.id ? (
                        <>
                          <span className="text-green-400">✓</span>
                          <span className="text-green-400">Copié!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                    {messages[messages.length - 1]?.id === message.id && (
                      <button
                        onClick={handleRegenerateResponse}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-400 transition-colors"
                        title="Régénérer la réponse"
                        disabled={isLoading}
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Régénérer</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Sources */}
                {message.type === 'ai' && message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-purple-500/20">
                    <p className="text-xs text-purple-300 mb-2 font-semibold">Sources utilisées:</p>
                    <div className="space-y-2">
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="text-xs bg-indigo-900/30 rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                          <div className="flex items-start gap-2">
                            <span className="text-purple-400 font-bold">#{source.rank || idx + 1}</span>
                            <div className="flex-1">
                              <p className="text-gray-300 font-medium mb-1">
                                📄 {source.file_name || source.document_id || 'Document'}
                              </p>
                              {source.text_excerpt && (
                                <p className="text-gray-400 text-xs italic mb-2 line-clamp-2">
                                  "{source.text_excerpt}..."
                                </p>
                              )}
                              {source.document_id && source.document_id !== 'unknown_document' ? (
                                <button
                                  onClick={() => handleDocumentClick(source.document_id)}
                                  className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline transition-colors mt-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Consulter le document</span>
                                </button>
                              ) : (
                                <span className="text-gray-500 text-xs">Document non disponible</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {message.type === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-indigo-900/50 border border-purple-500/30 rounded-2xl px-4 py-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`bg-indigo-900/50 border px-4 py-3 rounded-xl transition-all ${
            isSidebarOpen
              ? 'border-cyan-500/60 text-cyan-400'
              : 'border-purple-500/30 hover:border-purple-500/60 text-purple-400'
          }`}
          title="Conversations"
        >
          <Menu className="w-5 h-5" />
        </button>
        {messages.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`bg-indigo-900/50 border border-purple-500/30 hover:border-purple-500/60 px-4 py-3 rounded-xl transition-all ${
                isSearchOpen ? 'text-cyan-400 border-cyan-500/60' : 'text-purple-400'
              }`}
              title="Rechercher dans la conversation"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleClearChat}
              className="bg-indigo-900/50 border border-purple-500/30 hover:border-red-500/60 text-red-400 px-4 py-3 rounded-xl transition-all"
              title="Effacer la conversation"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question..."
          className="flex-1 bg-indigo-900/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/60 transition-colors"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* Conversation Sidebar */}
      <ConversationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        currentConversationId={currentConversationId}
      />
    </div>
  );
}

export default ChatInterface;
