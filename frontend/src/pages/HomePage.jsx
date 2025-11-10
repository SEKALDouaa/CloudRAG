import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Shield, Lock, Cloud } from 'lucide-react';
import useAuthStore from '../stores/authStore';

function HomePage() {
  const { isAuthenticated } = useAuthStore();
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 relative overflow-hidden -mt-24 pt-24">
      {/* Decorative Elements / Effets visuels */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

      {/* Grille de fond tech */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        <div className="absolute bottom-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Left Side - Illustration 3D style */}
          <div className="relative order-2 lg:order-1">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-[3rem] transform -rotate-6 scale-95"></div>
            
            {/* Main container */}
            <div className="relative bg-indigo-900/40 backdrop-blur-md border border-cyan-500/20 rounded-[3rem] p-12 shadow-2xl transform hover:scale-105 transition-transform duration-500">
              
              {/* Isometric platform base */}
              <div className="relative">
                {/* Platform layers */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-4 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-full blur-sm"></div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-56 h-3 bg-gradient-to-r from-indigo-700 to-indigo-800 rounded-full blur-sm"></div>
                
                {/* Central lock/security visual */}
                <div className="relative flex items-center justify-center mb-8">
                  <div className="relative group">
                    {/* Main lock card */}
                    <div className="bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 p-12 rounded-3xl shadow-2xl shadow-cyan-500/50 transform perspective-1000 group-hover:rotate-y-12 transition-transform duration-500">
                      <Lock className="w-24 h-24 text-white" />
                    </div>
                    
                    {/* Floating document icon - top right */}
                    <div className="absolute -top-6 -right-6 bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl shadow-xl animate-bounce">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Floating cloud icon - bottom left */}
                    <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-cyan-400 to-cyan-500 p-4 rounded-2xl shadow-xl animate-pulse">
                      <Cloud className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Fingerprint/security icon - top left */}
                    <div className="absolute -top-4 -left-8 bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl shadow-xl">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                      </svg>
                    </div>

                    {/* Small cube decoration */}
                    <div className="absolute -bottom-8 right-4 w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-600 transform rotate-45 shadow-lg"></div>
                  </div>
                </div>

                {/* Tech grid decoration */}
                <div className="absolute -bottom-12 -right-8 opacity-40">
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-cyan-500/30 rounded-sm backdrop-blur-sm"></div>
                    ))}
                  </div>
                </div>

                {/* Decorative lines */}
                <div className="grid grid-cols-4 gap-3 mt-8 opacity-40">
                  <div className="h-2 bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full"></div>
                  <div className="h-2 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"></div>
                  <div className="h-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
                  <div className="h-2 bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Floating tech circles */}
            <div className="absolute top-10 -right-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm border border-cyan-500/30 flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 rounded-full bg-cyan-500"></div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-8 order-1 lg:order-2">

            <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight">
              AI RAG
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-transparent bg-clip-text">
                CLOUD PRIVÉ
              </span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
              Uploadez vos documents et posez des questions. 
              L'IA vous répond avec des sources précises et sécurisées.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/documents"
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold shadow-xl shadow-cyan-500/30 transition-all transform hover:scale-105"
                  >
                    Mes Documents
                    <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                  </Link>

                  <Link
                    to="/chat"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold border border-cyan-500/30 backdrop-blur-sm transition-all"
                  >
                    Aller au Chat
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold shadow-xl shadow-cyan-500/30 transition-all transform hover:scale-105"
                  >
                    Commencer gratuitement
                    <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold border border-cyan-500/30 backdrop-blur-sm transition-all"
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid - en bas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {/* Feature 1 */}
          <div className="group bg-indigo-900/30 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-500/50 transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Upload Documents</h3>
            <p className="text-gray-300 leading-relaxed">
              Importez vos fichiers PDF, DOCX et TXT en toute sécurité
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-indigo-900/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/50 transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
            <div className="bg-gradient-to-br from-purple-400 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Chat Intelligent</h3>
            <p className="text-gray-300 leading-relaxed">
              Posez vos questions en langage naturel
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-indigo-900/30 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/50 transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20">
            <div className="bg-gradient-to-br from-blue-400 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">100% Privé</h3>
            <p className="text-gray-300 leading-relaxed">
              Vos données restent sur votre machine locale
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;