import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, Key, ShieldCheck, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';

interface UserModalProps {
  userToEdit?: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  userToEdit,
  isOpen,
  onClose,
}) => {
  const { teams, createUser, updateUser, resetPassword } = useApp();

  const [fullName, setFullName] = useState(userToEdit?.full_name || '');
  const [username, setUsername] = useState(userToEdit?.username || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>(userToEdit?.role || 'member');
  const [teamId, setTeamId] = useState(userToEdit?.team_id || teams[0]?.id || 'team-writing');
  const [designation, setDesignation] = useState(userToEdit?.designation || '');
  const [isActive, setIsActive] = useState(userToEdit ? userToEdit.is_active : true);
  const [error, setError] = useState('');
  const [resetPassMode, setResetPassMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !username.trim()) {
      setError('Full name and username are required.');
      return;
    }

    if (!userToEdit) {
      if (!password.trim()) {
        setError('A temporary password is required for account creation.');
        return;
      }
      const res = await createUser({
        full_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        passwordPlain: password.trim(),
        role,
        team_id: teamId,
        designation: designation.trim() || 'Team Specialist',
      });

      if (!res.success) {
        setError(res.error || 'Failed to create user account.');
        return;
      }
    } else {
      updateUser(userToEdit.id, {
        full_name: fullName.trim(),
        role,
        team_id: teamId,
        designation: designation.trim(),
        is_active: isActive,
      });
    }

    onClose();
  };

  const handleAdminResetPassword = async () => {
    if (!userToEdit || !newPassword.trim()) return;
    const ok = await resetPassword(userToEdit.id, newPassword.trim());
    if (ok) {
      setSuccessMsg(`Password successfully reset for @${userToEdit.username}!`);
      setResetPassMode(false);
      setNewPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1812]/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#FFFBF7] rounded-3xl border border-[#E8D0B7] shadow-2xl overflow-hidden flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E8D0B7] flex items-center justify-between bg-[#FAE6CE]/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FF5601] flex items-center justify-center text-white shadow-sm">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#2A1812] text-base">
                {userToEdit ? 'Manage Member Account' : 'Add Team Member'}
              </h3>
              <p className="text-xs text-[#7A6359]">Internal account credentials & role</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7A6359] hover:bg-[#FAE6CE] hover:text-[#2A1812]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs">
              {successMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jordan Lee"
              className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Username *
              </label>
              <input
                type="text"
                required
                disabled={!!userToEdit}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="jordan"
                className="w-full bg-[#FAE6CE]/20 disabled:opacity-60 border border-[#E8D0B7] rounded-xl px-3 py-2 text-xs font-semibold text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Platform Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                className="w-full bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-xl px-3 py-2 text-xs font-bold text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
              >
                <option value="member">Team Member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          {!userToEdit && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Temporary Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl px-3.5 py-2 text-xs text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Primary Team *
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-xl px-3 py-2 text-xs font-bold text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Designation / Title
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Motion Animator"
                className="w-full bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-xl px-3 py-2 text-xs text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
              />
            </div>
          </div>

          {/* If Editing: Toggle Active Status & Password Reset */}
          {userToEdit && (
            <div className="p-3.5 rounded-2xl bg-[#FAE6CE]/30 border border-[#E8D0B7] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#2A1812] block">Account Status</span>
                  <span className="text-[10px] text-[#7A6359]">
                    {isActive ? 'Active and allowed to log in' : 'Deactivated account'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="pt-2 border-t border-[#E8D0B7]/60">
                {!resetPassMode ? (
                  <button
                    type="button"
                    onClick={() => setResetPassMode(true)}
                    className="text-xs font-bold text-[#A63500] hover:text-[#FF5601] flex items-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Reset Member Password</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-[#2A1812]">
                      New Password
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="flex-1 bg-white border border-[#E8D0B7] rounded-xl px-3 py-1.5 text-xs text-[#2A1812]"
                      />
                      <button
                        type="button"
                        onClick={handleAdminResetPassword}
                        className="px-3 py-1.5 rounded-xl bg-[#2A1812] text-white text-xs font-bold hover:bg-[#FF5601]"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetPassMode(false)}
                        className="text-xs text-[#7A6359] hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-[#E8D0B7] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#4A352D] hover:bg-[#FAE6CE]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full text-xs font-black text-white bg-[#FF5601] hover:bg-[#E04800] shadow-sm transition-all"
            >
              {userToEdit ? 'Save Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
