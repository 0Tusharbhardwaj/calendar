import React, { useState } from 'react';
import { Lock, User, Flame, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginPage: React.FC = () => {
  const { login } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setError('');
    setIsLoading(true);

    const res = await login(username.trim().toLowerCase(), password);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials. Please verify your username and password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF7F0] text-[#2A1812] flex flex-col justify-between selection:bg-[#FC9631]/30 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FF5601]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#FC9631]/10 blur-3xl pointer-events-none" />

      {/* Top minimal header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF5601] to-[#FC9631] flex items-center justify-center text-white shadow-xs">
            <Flame className="w-4.5 h-4.5 fill-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-[#2A1812]">TeamFlow</span>
        </div>
        <span className="text-xs font-semibold text-[#7A6359] bg-[#FAE6CE]/40 px-3 py-1 rounded-full border border-[#E8D0B7]/60">
          Studio Operations
        </span>
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md bg-[#FFFBF7] rounded-3xl border border-[#E8D0B7] shadow-xl p-6 sm:p-8 animate-scaleUp">
          <div className="text-center mb-6">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#FF5601] to-[#FC9631] flex items-center justify-center text-white mx-auto shadow-md mb-3">
              <Flame className="w-7 h-7 fill-white" />
            </div>
            <h1 className="text-2xl font-black text-[#2A1812] tracking-tight">
              Sign In to TeamFlow
            </h1>
            <p className="text-xs text-[#7A6359] mt-1">
              Enter your credentials to access your studio workspace and content calendar.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#7A6359] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                    setError('');
                  }}
                  placeholder="Enter your username"
                  className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-[#2A1812] placeholder-[#7A6359] focus:outline-none focus:border-[#FF5601] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7A6359] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold text-[#2A1812] placeholder-[#7A6359] focus:outline-none focus:border-[#FF5601] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6359] hover:text-[#2A1812] p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#FF5601] to-[#E04800] hover:from-[#E04800] hover:to-[#C83E00] shadow-[0_4px_14px_-2px_rgba(255,86,1,0.35)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E8D0B7]/60 text-center">
            <p className="text-[11px] text-[#7A6359]">
              Team member? Use the username & password issued by your workspace administrator.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom footer */}
      <footer className="w-full py-4 text-center text-[11px] text-[#7A6359] z-10">
        TeamFlow • Centralized Studio Operations & Content Calendar
      </footer>
    </div>
  );
};
