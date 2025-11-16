import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, FileText, MessageSquare, Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../stores/authStore';
import './Navbar.css';

function Layout() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { name: 'Accueil', link: '/', icon: Home },
    { name: 'Documents', link: '/documents', icon: FileText },
    { name: 'Chat', link: '/chat', icon: MessageSquare },
    { name: 'Profil', link: '/profile', icon: User },
  ];

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen">  {/* ← ENLEVÉ le bg-gradient */}
      {/* Navbar flottante */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 h-auto bg-white/80 backdrop-blur-xl shadow-2xl w-11/12 max-w-7xl box-border flex items-center justify-between gap-10 rounded-full px-8 py-3 z-50 border border-gray-200/50">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 text-transparent bg-clip-text">
            AI RAG Cloud Privé
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          <ul className="flex items-center gap-8 text-gray-700 font-semibold">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name} className="nav-item">
                  <Link
                    to={item.link}
                    className={`flex items-center gap-2 transition-colors ${
                      isActive(item.link) ? 'text-cyan-600' : 'hover:text-cyan-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg transition-colors font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-semibold"
            >
              <User className="w-4 h-4" />
              Connexion
            </Link>
          )}
        </div>

        {/* Menu Icon (Mobile) */}
        <button
          onClick={toggleMenu}
          className="lg:hidden cursor-pointer hover:opacity-70 hover:scale-110 transition-all duration-300"
        >
          {menuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Overlay pour mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={closeMenu}
        ></div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 max-w-sm w-10/12 bg-white/95 backdrop-blur-xl p-6 rounded-2xl z-40 shadow-2xl border border-gray-200/50">
          <ul className="text-gray-700 font-semibold space-y-4 w-full flex flex-col items-center">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.name}
                  className="w-full border-b border-gray-200 pb-3 last:border-b-0"
                  onClick={closeMenu}
                >
                  <Link
                    to={item.link}
                    className={`flex items-center gap-3 transition-colors ${
                      isActive(item.link) ? 'text-cyan-600' : 'hover:text-cyan-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Contenu des pages */}
      <main className="pt-24">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;