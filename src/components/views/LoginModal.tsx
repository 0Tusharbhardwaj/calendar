import React, { useState } from 'react';
import { X, Lock, User, Flame, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canClose?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  canClose = true,
}) => {
  const { login } = useApp();

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
      if (onClose) onClose();
    } else {
      setError(res.error || 'Failed to authenticate.');
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
          {canClose && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#7A6359] hover:bg-[#FAE6CE] hover:text-[#2A1812] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5601] to-[#FC9631] flex items-center justify-center text-white mx-auto shadow-md mb-2">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-xl font-black text-[#2A1812]">TeamFlow Workspace</h2>
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
                  autoFocus
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your username"
                  className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold text-[#2A1812] focus:outline-none focus:border-[#FF5601] transition-colors"
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
                  className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold text-[#2A1812] focus:outline-none focus:border-[#FF5601] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#FF5601] to-[#E04800] hover:from-[#E04800] hover:to-[#C83E00] shadow-[0_4px_14px_-2px_rgba(255,86,1,0.35)] transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-center text-[#7A6359] pt-2 border-t border-[#E8D0B7]/60">
            Account access and credentials are managed by workspace administrators.
          </p>
        </div>
      </div>
    </div>
  );
};
