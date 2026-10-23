import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  Flame,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, resetDatabase, users } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await login(username, password);
    setIsLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to authenticate.');
    }
  };

  const handleQuickLogin = async (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setIsLoading(true);
    const res = await login(user, pass);
    setIsLoading(false);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1812]/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#FFFBF7] rounded-3xl border border-[#E8D0B7] shadow-2xl overflow-hidden flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand Header */}
        <div className="p-6 bg-gradient-to-r from-[#FAE6CE] via-[#FFF1E4] to-[#FDF7F0] border-b border-[#E8D0B7] text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#7A6359] hover:bg-[#FAE6CE] hover:text-[#2A1812]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-full bg-[#FF5601] flex items-center justify-center text-white mx-auto shadow-md mb-2">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-xl font-black text-[#2A1812]">TeamFlow Studio Ops</h2>
          <p className="text-xs text-[#7A6359] mt-0.5">
            Internal Operations, Team Management & Calendar
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#7A6359] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. tushar or bhoomika"
                  className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7A6359] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-full text-xs font-black text-white bg-[#FF5601] hover:bg-[#E04800] shadow-[0_4px_14px_-2px_rgba(255,86,1,0.4)] transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In to Platform'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Fast Demo One-Click Accounts */}
          <div className="pt-3 border-t border-[#E8D0B7]/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#7A6359]">
                Instant Demo Access
              </span>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset database back to clean demonstration seeds?')) {
                    resetDatabase();
                  }
                }}
                className="text-[10px] text-[#A63500] hover:underline flex items-center gap-1 font-bold"
                title="Reset local database to initial demonstration dataset"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Demo Data</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('tushar', 'admin123')}
                className="p-3 rounded-2xl border border-[#E8D0B7] bg-[#FAE6CE]/30 hover:bg-[#FAE6CE] text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-extrabold text-xs text-[#2A1812]">Tushar Bhardwaj</span>
                  <span className="text-[9px] font-black uppercase px-1.5 rounded bg-[#FF5601] text-white">
                    Admin
                  </span>
                </div>
                <span className="text-[10px] text-[#7A6359]">@tushar • Founder</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('bhoomika', 'admin123')}
                className="p-3 rounded-2xl border border-[#E8D0B7] bg-[#FAE6CE]/30 hover:bg-[#FAE6CE] text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-extrabold text-xs text-[#2A1812]">Bhoomika Chawla</span>
                  <span className="text-[9px] font-black uppercase px-1.5 rounded bg-[#FF5601] text-white">
                    Admin
                  </span>
                </div>
                <span className="text-[10px] text-[#7A6359]">@bhoomika • Co-Founder</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
