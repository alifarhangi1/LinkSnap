import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, LogOut, LayoutDashboard, Settings } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-xl bg-[#0a0a0f]/80">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          LinkSnap
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <LayoutDashboard size={16} />
                <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
              </Link>
              <Link to="/settings" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <Settings size={16} />
                <span className="text-sm font-medium hidden sm:inline">Settings</span>
              </Link>
              <span className="text-white/30 hidden sm:inline">|</span>
              <span className="text-sm text-white/50 hidden sm:inline">{user.username}</span>
              <button onClick={handleLogout} className="flex items-center gap-2 btn-secondary text-sm py-2 px-4">
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors px-4 py-2">
                Log in
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-5">
                Get started free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
