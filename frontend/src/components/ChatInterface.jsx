import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Plus, Search, X, Copy, RefreshCw, ExternalLink, MessageSquare, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { chatAPI, documentsAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Charger les conversations au démarrage
  useEffect(() => {
    loadConversations();
  }, []);

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

  const loadConversations = () => {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) return;
    
    const storageKey = `conversations_${userEmail}`;
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setConversations(saved);
  };

  const saveCurrentConversation = () => {
    if (messages.length === 0) return;

    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) return;

    const storageKey = `conversations_${userEmail}`;
    const savedConversations = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const firstUserMessage = messages.find(m => m.type === 'user');
    const title = firstUserMessage
      ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
      : 'Nouvelle conversation';

    const conversationData = {
      id: currentConversationId || Date.now().toString(),
      title,
      messages,
      createdAt: currentConversationId
        ? savedConversations.find(c => c.id === currentConversationId)?.createdAt || Date.now()
        : Date.now(),
      updatedAt: Date.now()
    };

    const existingIndex = savedConversations.findIndex(c => c.id === conversationData.id);
    if (existingIndex !== -1) {
      savedConversations[existingIndex] = conversationData;
    } else {
      savedConversations.unshift(conversationData);
    }

    localStorage.setItem(storageKey, JSON.stringify(savedConversations));
    setConversations(savedConversations);

    if (!currentConversationId) {
      setCurrentConversationId(conversationData.id);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setSearchQuery('');
  };

  const handleSelectConversation = (conversation) => {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
    setSearchQuery('');
  };

  const handleDeleteConversation = (conversationId, e) => {
    e.stopPropagation();
    if (window.confirm('Voulez-vous vraiment supprimer cette conversation ?')) {
      const userEmail = localStorage.getItem('user_email');
      const storageKey = `conversations_${userEmail}`;
      const updated = conversations.filter(c => c.id !== conversationId);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setConversations(updated);
      
      if (currentConversationId === conversationId) {
        handleNewConversation();
      }
    }
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

  const handleCopyMessage = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const handleRegenerateResponse = async () => {
    if (messages.length < 2) return;

    const lastUserMessage = [...messages].reverse().find(msg => msg.type === 'user');
    if (!lastUserMessage) return;

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

  const filteredConversations = searchQuery
    ? conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  return (
    <div className="flex h-[calc(100vh-200px)] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-950/40 via-purple-900/40 to-indigo-900/40 backdrop-blur-sm border border-purple-500/30 shadow-2xl">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarCollapsed ? 'w-0' : 'w-80'
        } bg-gradient-to-b from-indigo-900/60 to-purple-900/60 backdrop-blur-md border-r border-purple-500/30 flex flex-col transition-all duration-300 overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-purple-500/20">
          <button
            onClick={handleNewConversation}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle conversation
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-indigo-900/40 border border-purple-500/20 rounded-lg pl-10 pr-10 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/60 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <MessageSquare className="w-12 h-12 text-purple-400/50 mb-3" />
              <p className="text-sm text-gray-400">
                {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`group p-3 rounded-lg cursor-pointer transition-all hover:bg-purple-500/20 ${
                  currentConversationId === conv.id
                    ? 'bg-purple-500/30 border border-purple-500/50'
                    : 'bg-indigo-900/20 border border-transparent hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate mb-1">
                      {conv.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {new Date(conv.updatedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all p-1 hover:bg-red-500/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-purple-500/90 hover:bg-purple-600 text-white p-2 rounded-r-lg shadow-lg transition-all z-10"
        style={{ left: isSidebarCollapsed ? '0' : '20rem' }}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-gradient-to-br from-purple-400 to-pink-600 p-8 rounded-3xl mb-6 shadow-2xl shadow-purple-500/40">
                <Bot className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Bienvenue sur Chat RAG
              </h2>
              <p className="text-gray-300 max-w-md text-lg">
                Posez des questions sur vos documents. L'IA vous répondra en se basant sur le contenu que vous avez uploadé.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'ai' && (
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : message.type === 'error'
                      ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                      : 'bg-indigo-900/60 backdrop-blur-sm border border-purple-500/30 text-gray-100'
                  }`}
                >
                  {message.type === 'ai' || message.type === 'error' ? (
                    <div className="markdown-content">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-2">{children}</ol>,
                          li: ({ children }) => <li className="ml-4">{children}</li>,
                          code: ({ inline, children }) =>
                            inline ? (
                              <code className="bg-indigo-800/60 px-2 py-1 rounded text-cyan-300 font-mono text-sm">
                                {children}
                              </code>
                            ) : (
                              <code className="block bg-indigo-800/60 p-3 rounded-lg my-3 text-cyan-300 font-mono text-sm overflow-x-auto">
                                {children}
                              </code>
                            ),
                          h1: ({ children }) => <h1 className="text-2xl font-bold mb-3 text-white">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-white">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-white">{children}</h3>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-purple-500 pl-4 my-3 italic text-gray-300">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                  )}

                  {/* Action Buttons for AI messages */}
                  {message.type === 'ai' && (
                    <div className="flex gap-3 mt-4 pt-3 border-t border-purple-500/20">
                      <button
                        onClick={() => handleCopyMessage(message.content, message.id)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-colors"
                        title="Copier la réponse"
                      >
                        {copiedMessageId === message.id ? (
                          <>
                            <span className="text-green-400">✓</span>
                            <span className="text-green-400">Copié!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copier</span>
                          </>
                        )}
                      </button>
                      {messages[messages.length - 1]?.id === message.id && (
                        <button
                          onClick={handleRegenerateResponse}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-400 transition-colors"
                          title="Régénérer la réponse"
                          disabled={isLoading}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                          <span>Régénérer</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Sources */}
                  {message.type === 'ai' && message.sources && message.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-purple-500/20">
                      <p className="text-xs text-purple-300 mb-3 font-semibold flex items-center gap-2">
                        <span className="w-1 h-4 bg-purple-500 rounded"></span>
                        Sources utilisées
                      </p>
                      <div className="space-y-2">
                        {message.sources.map((source, idx) => (
                          <div key={idx} className="text-xs bg-indigo-900/40 rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/40 hover:bg-indigo-900/50 transition-all">
                            <div className="flex items-start gap-2">
                              <span className="text-purple-400 font-bold text-sm">#{source.rank || idx + 1}</span>
                              <div className="flex-1">
                                <p className="text-gray-200 font-medium mb-1.5 flex items-center gap-1">
                                  📄 {source.file_name || source.document_id || 'Document'}
                                </p>
                                {source.text_excerpt && (
                                  <p className="text-gray-400 text-xs italic mb-2 line-clamp-2 leading-relaxed">
                                    "{source.text_excerpt}..."
                                  </p>
                                )}
                                {source.document_id && source.document_id !== 'unknown_document' ? (
                                  <button
                                    onClick={() => handleDocumentClick(source.document_id)}
                                    className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 hover:underline transition-colors mt-1"
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
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-indigo-900/60 backdrop-blur-sm border border-purple-500/30 rounded-2xl px-5 py-4 shadow-lg">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-6 border-t border-purple-500/20 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Posez votre question..."
                className="w-full bg-indigo-900/60 border border-purple-500/30 rounded-xl px-5 py-3.5 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/60 focus:bg-indigo-900/80 transition-all resize-none scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent"
                rows="1"
                style={{ maxHeight: '120px', minHeight: '50px' }}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-purple-500/40 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-3">
            Appuyez sur Entrée pour envoyer, Shift + Entrée pour nouvelle ligne
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;