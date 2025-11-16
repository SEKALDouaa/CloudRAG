import { useState, useEffect } from 'react';
import { User, Mail, Calendar, FileText, MessageSquare, Clock } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { documentsAPI } from '../services/api';

function ProfilePage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalConversations: 0,
    memberSince: null
  });

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      // Récupérer le nombre de documents
      let totalDocuments = 0;
      try {
        const docsResponse = await documentsAPI.getDocumentsMetadata();
        console.log('Documents response:', docsResponse);

        // Vérifier différents formats de réponse possibles
        if (Array.isArray(docsResponse.data)) {
          totalDocuments = docsResponse.data.length;
        } else if (docsResponse.data?.documents && Array.isArray(docsResponse.data.documents)) {
          totalDocuments = docsResponse.data.documents.length;
        } else if (docsResponse.data?.data && Array.isArray(docsResponse.data.data)) {
          totalDocuments = docsResponse.data.data.length;
        } else if (typeof docsResponse.data === 'object' && docsResponse.data !== null) {
          // Si c'est un objet, compter les clés
          totalDocuments = Object.keys(docsResponse.data).length;
        }
      } catch (docError) {
        console.error('Erreur lors de la récupération des documents:', docError);
      }

      // Récupérer le nombre de conversations depuis localStorage
      const userEmail = localStorage.getItem('user_email');
      console.log('User email:', userEmail);

      const storageKey = `conversations_${userEmail}`;
      const conversationsData = localStorage.getItem(storageKey);
      console.log('Conversations data from localStorage:', conversationsData);

      const conversations = JSON.parse(conversationsData || '[]');
      const totalConversations = conversations.length;
      console.log('Total conversations:', totalConversations);

      // Date d'inscription - chercher dans plusieurs clés possibles
      const userEmailKey = `member_since_${userEmail}`;
      let memberSince = localStorage.getItem(userEmailKey) || localStorage.getItem('member_since');

      if (!memberSince) {
        // Si pas de date, utiliser la date actuelle (première visite du profil)
        memberSince = new Date().toISOString();
        localStorage.setItem(userEmailKey, memberSince);
      }

      console.log('Stats:', { totalDocuments, totalConversations, memberSince });

      setStats({
        totalDocuments,
        totalConversations,
        memberSince: new Date(memberSince)
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  // Récupérer le nom complet de l'utilisateur
  const getFullName = () => {
    const userEmail = localStorage.getItem('user_email');
    const storedName = localStorage.getItem(`user_name_${userEmail}`);
    return storedName || user?.name || 'Utilisateur';
  };

  // Générer les initiales pour l'avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 relative overflow-hidden -mt-24 pt-24">
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <h1 className="text-5xl font-bold text-white mb-4">
          Mon Profil
        </h1>
        <p className="text-gray-300 text-lg mb-12">
          Informations de votre compte et statistiques
        </p>

        {/* Profile Card */}
        <div className="bg-indigo-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 shadow-xl mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/40">
                <span className="text-5xl font-bold text-white">
                  {getInitials(getFullName())}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">
                {getFullName()}
              </h2>
              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-3 text-gray-300 justify-center md:justify-start">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <Mail className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-lg">{user?.email || localStorage.getItem('user_email')}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 justify-center md:justify-start">
                  <div className="bg-cyan-500/20 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-lg">
                    Membre depuis {stats.memberSince?.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Documents */}
          <div className="bg-indigo-900/30 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 shadow-xl hover:border-cyan-500/50 transition-all transform hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-4 rounded-xl shadow-lg shadow-cyan-500/30">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Documents</p>
                <p className="text-4xl font-bold text-white">{stats.totalDocuments}</p>
              </div>
            </div>
          </div>

          {/* Total Conversations */}
          <div className="bg-indigo-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-xl hover:border-purple-500/50 transition-all transform hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-400 to-pink-600 p-4 rounded-xl shadow-lg shadow-purple-500/30">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Conversations</p>
                <p className="text-4xl font-bold text-white">{stats.totalConversations}</p>
              </div>
            </div>
          </div>

          {/* Days Active */}
          <div className="bg-indigo-900/30 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 shadow-xl hover:border-blue-500/50 transition-all transform hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-400 to-cyan-600 p-4 rounded-xl shadow-lg shadow-blue-500/30">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Jours actif</p>
                <p className="text-4xl font-bold text-white">
                  {stats.memberSince ? Math.floor((new Date() - stats.memberSince) / (1000 * 60 * 60 * 24)) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-indigo-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 shadow-xl mt-6">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <User className="w-6 h-6 text-purple-400" />
            Informations du compte
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-900/20 rounded-xl p-4 border border-purple-500/20">
              <p className="text-gray-400 text-sm mb-1">Nom complet</p>
              <p className="text-white text-lg font-semibold">{getFullName()}</p>
            </div>
            <div className="bg-indigo-900/20 rounded-xl p-4 border border-purple-500/20">
              <p className="text-gray-400 text-sm mb-1">Adresse email</p>
              <p className="text-white text-lg font-semibold">{user?.email || localStorage.getItem('user_email')}</p>
            </div>
            <div className="bg-indigo-900/20 rounded-xl p-4 border border-purple-500/20">
              <p className="text-gray-400 text-sm mb-1">Statut du compte</p>
              <span className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm font-semibold">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Actif
              </span>
            </div>
            <div className="bg-indigo-900/20 rounded-xl p-4 border border-purple-500/20">
              <p className="text-gray-400 text-sm mb-1">Type de compte</p>
              <p className="text-white text-lg font-semibold">Standard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
