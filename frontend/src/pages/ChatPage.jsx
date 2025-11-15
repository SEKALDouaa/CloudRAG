import ChatInterface from '../components/ChatInterface';

function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 relative overflow-hidden -mt-24 pt-24">
      {/* Decorative Elements */}
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-20 right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <h1 className="text-5xl font-bold text-white mb-4">
          Chat RAG
        </h1>
        <p className="text-gray-300 text-lg mb-12">
          Posez vos questions sur vos documents
        </p>

        <div className="bg-indigo-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 shadow-xl">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}

export default ChatPage;