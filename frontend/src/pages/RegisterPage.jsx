import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, UserPlus, User, Phone, Calendar } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    prenom: '',
    nom: '',
    password: '',
    confirmPassword: '',
    numeroTel: '',
    dateNaissance: '',
  });
  const [localError, setLocalError] = useState('');
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Validation du numéro de téléphone (format marocain)
    const phoneRegex = /^(0[5-7])[0-9]{8}$/;
    if (!phoneRegex.test(formData.numeroTel)) {
      setLocalError('Numéro de téléphone invalide (ex: 0612345678)');
      return;
    }

    // Validation de l'âge minimum (18 ans)
    const birthDate = new Date(formData.dateNaissance);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      setLocalError('Vous devez avoir au moins 18 ans');
      return;
    }

    // Préparer les données pour l'API
    const userData = {
      email: formData.email,
      prenom: formData.prenom,
      nom: formData.nom,
      password: formData.password,
      numeroTel: parseInt(formData.numeroTel),
      dateNaissance: formData.dateNaissance,
    };

    const result = await register(userData);
    if (result.success) {
      navigate('/login', { state: { message: 'Compte créé avec succès. Connectez-vous.' } });
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 relative overflow-hidden flex items-center justify-center px-6 py-12">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Inscription</h1>
          <p className="text-gray-300">Créez votre compte CloudRAG</p>
        </div>

        {/* Register Form */}
        <div className="bg-indigo-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Prenom & Nom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Prénom</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="w-full bg-indigo-900/50 border border-purple-500/30 rounded-xl px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/60 transition-colors"
                    placeholder=""
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Nom</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full bg-indigo-900/50 border border-purple-500/30 rounded-xl px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/60 transition-colors"
                    placeholder=""
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-indigo-900/50 border border-purple-500/30 rounded-xl px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/60 transition-colors"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            {/* Row 2: Tel & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="numeroTel"
                    value={formData.numeroTel}
                    onChange={handleChange}
                    className="w-full bg-indigo-900/50 border border-purple-500/30 rounded-xl px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/60 transition-colors"
                    placeholder="06........"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Date de naissance</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleChange}
                    className="w-full bg-indigo-900/50 border border-purple-500/30 rounded-xl px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/60 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-indigo-900/50 border border-purple-500/30 rounded-xl px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/60 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-indigo-900/50 border border-purple-500/30 rounded-xl px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/60 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Error Message */}
            {displayError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
                {displayError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? 'Création...' : 'Créer un compte'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Déjà un compte ?{' '}
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
