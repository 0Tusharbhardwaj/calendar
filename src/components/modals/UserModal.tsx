import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UserPlus,
  AlertCircle,
  Key,
  ShieldCheck,
  User,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserRole } from '../../types';

interface UserModalProps {
  userToEdit?: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  initialFocusPassword?: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({
  userToEdit,
  isOpen,
  onClose,
  initialFocusPassword = false,
}) => {
  const { teams, users, currentUser, createUser, updateUser, resetPassword } = useApp();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [role, setRole] = useState<UserRole>('member');
  const [teamId, setTeamId] = useState('');
  const [designation, setDesignation] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Password editing for existing users
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResettingPass, setIsResettingPass] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  const editingUserId = userToEdit?.id;

  // Synchronize state when modal opens or target user changes
  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setFullName(userToEdit.full_name || '');
        setUsername(userToEdit.username || '');
        setRole(userToEdit.role || 'member');
        setTeamId(userToEdit.team_id || teams[0]?.id || 'team-writing');
        setDesignation(userToEdit.designation || '');
        setDescription(userToEdit.description || '');
        setIsActive(userToEdit.is_active !== false);
        setPassword('');
        setNewPassword('');
        setShowPassword(false);
        setShowNewPassword(false);
        setError('');
        setSuccessMsg('');
      } else {
        setFullName('');
        setUsername('');
        setPassword('');
        setNewPassword('');
        setRole('member');
        setTeamId(teams[0]?.id || 'team-writing');
        setDesignation('');
        setDescription('');
        setIsActive(true);
        setShowPassword(false);
        setShowNewPassword(false);
        setError('');
        setSuccessMsg('');
      }

      if (initialFocusPassword) {
        setTimeout(() => {
          passwordInputRef.current?.focus();
        }, 150);
      }
    }
  }, [isOpen, editingUserId]);

  if (!isOpen) return null;

  const isSelf = currentUser && userToEdit && currentUser.id === userToEdit.id;
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isTargetSuperAdmin = userToEdit?.role === 'super_admin';
  const canEditThisUser = isSuperAdmin || !isTargetSuperAdmin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!canEditThisUser) {
      setError('Only Super Administrator can modify a Super Admin profile.');
      return;
    }

    const cleanFullName = fullName.trim();
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanFullName || !cleanUsername) {
      setError('Both full name and username are required.');
      return;
    }

    // Check for username conflicts
    const conflict = users.find(
      (u) =>
        u.id !== userToEdit?.id &&
        u.username.toLowerCase() === cleanUsername
    );
    if (conflict) {
      setError(`The username "@${cleanUsername}" is already taken by another team member.`);
      return;
    }

    setIsSaving(true);

    try {
      if (!userToEdit) {
        // Create new account
        if (!password.trim()) {
          setError('A password is required for this new account.');
          setIsSaving(false);
          return;
        }

        const res = await createUser({
          full_name: cleanFullName,
          username: cleanUsername,
          passwordPlain: password.trim(),
          role,
          team_id: teamId || teams[0]?.id || 'team-writing',
          designation: designation.trim() || 'Team Specialist',
          description: description.trim(),
        });

        if (!res.success) {
          setError(res.error || 'Failed to create user account.');
          setIsSaving(false);
          return;
        }
      } else {
        // Update existing user profile
        await updateUser(userToEdit.id, {
          full_name: cleanFullName,
          username: cleanUsername,
          role,
          team_id: teamId,
          designation: designation.trim(),
          description: description.trim(),
          is_active: isActive,
        });

        // If a new password was provided, reset it immediately
        if (newPassword.trim()) {
          const passOk = await resetPassword(userToEdit.id, newPassword.trim());
          if (!passOk) {
            setError('Profile updated, but password reset encountered an error.');
            setIsSaving(false);
            return;
          }
        }
      }

      setIsSaving(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred while saving.');
      setIsSaving(false);
    }
  };

  // Quick reset password handler
  const handleQuickPasswordReset = async () => {
    if (!userToEdit) return;
    if (!newPassword.trim()) {
      setError('Please type a new password in the field before clicking update.');
      return;
    }

    setError('');
    setIsResettingPass(true);

    try {
      const ok = await resetPassword(userToEdit.id, newPassword.trim());
      setIsResettingPass(false);
      if (ok) {
        setSuccessMsg(`✓ Password for @${userToEdit.username} was updated successfully!`);
        setNewPassword('');
      } else {
        setError('Failed to update password. Please try again.');
      }
    } catch (err: any) {
      setIsResettingPass(false);
      setError(err?.message || 'Failed to update password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2A1812]/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-lg bg-[#FFFBF7] rounded-3xl border border-[#E8D0B7] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8D0B7] flex items-center justify-between bg-[#FAE6CE]/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5601] to-[#FC9631] flex items-center justify-center text-white shadow-xs">
              {userToEdit ? <Key className="w-4.5 h-4.5" /> : <UserPlus className="w-4.5 h-4.5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-[#2A1812] text-base leading-tight">
                {userToEdit
                  ? isSelf
                    ? 'My Profile & Security'
                    : `Edit Profile: ${userToEdit.full_name}`
                  : 'Add New Team Member'}
              </h3>
              <p className="text-xs text-[#7A6359] mt-0.5">
                {userToEdit
                  ? 'Update member details, departmental role, and login password'
                  : 'Provision account credentials for a new team member'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7A6359] hover:bg-[#FAE6CE] hover:text-[#2A1812] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} autoComplete="off" className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Anti-autofill decoys to prevent aggressive browser password managers from pre-filling fields */}
          <input type="text" name="fake_user_remember" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <input type="password" name="fake_pass_remember" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          {error && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Full Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                name="new_member_full_name"
                autoComplete="off"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2A1812] focus:outline-none focus:border-[#FF5601] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Username (@login) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A6359]">
                  @
                </span>
                <input
                  type="text"
                  required
                  name="new_member_username"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="username"
                  className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl pl-7 pr-3.5 py-2.5 text-xs font-bold text-[#2A1812] focus:outline-none focus:border-[#FF5601] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Protected Super Admin Banner if target is super_admin and currentUser is not super_admin */}
          {!canEditThisUser && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
              <span className="text-base">👑</span>
              <span>
                <strong>Super Administrator Protected:</strong> Only Super Administrators have permissions to reassign or modify this account.
              </span>
            </div>
          )}

          {/* Platform Role & Primary Team */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5 flex items-center justify-between">
                <span>Platform Role *</span>
                {role === 'super_admin' && (
                  <span className="text-[10px] text-amber-700 font-extrabold flex items-center gap-0.5">
                    👑 Super Admin
                  </span>
                )}
              </label>
              <select
                value={role}
                disabled={!canEditThisUser}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2A1812] focus:outline-none focus:border-[#FF5601] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="member">Team Member</option>
                <option value="admin">Administrator (Assign Roles & Approvals)</option>
                {isSuperAdmin && (
                  <option value="super_admin">👑 Super Administrator (Full Control)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Primary Department *
              </label>
              <select
                value={teamId}
                disabled={!canEditThisUser}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2A1812] focus:outline-none focus:border-[#FF5601] disabled:opacity-60"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Designation & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Designation / Role Title *
              </label>
              <input
                type="text"
                required
                name="new_member_designation"
                autoComplete="off"
                disabled={!canEditThisUser}
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. HR, Social Media Manager"
                className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#2A1812] focus:outline-none focus:border-[#FF5601] transition-colors disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Role Description / Tagline
              </label>
              <input
                type="text"
                name="new_member_description"
                autoComplete="off"
                disabled={!canEditThisUser}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Core Team Member, Lead Admin"
                className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#2A1812] focus:outline-none focus:border-[#FF5601] transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          {/* New User: Temporary Password */}
          {!userToEdit && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Initial Account Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7A6359] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  name="new_member_password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Temporary login password"
                  className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl pl-9 pr-10 py-2.5 text-xs font-semibold text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6359] hover:text-[#2A1812] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#7A6359] mt-1">
                Provide these credentials to your team member so they can log in.
              </p>
            </div>
          )}

          {/* Existing User: Password Reset & Account Status Card */}
          {userToEdit && (
            <div className="bg-[#FAE6CE]/25 border border-[#E8D0B7] rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8D0B7]/60">
                <div>
                  <span className="text-xs font-black text-[#2A1812] block">Account Status</span>
                  <span className="text-[11px] text-[#7A6359]">
                    {isActive ? 'Account active and allowed to log in' : 'Account deactivated'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`px-3 py-1 rounded-full text-xs font-black transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                  }`}
                >
                  {isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* Password Edit Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-[#2A1812] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#FF5601]" />
                    <span>Change / Reset Password</span>
                  </label>
                  <span className="text-[10px] text-[#7A6359] font-medium">
                    (Leave blank to keep unchanged)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={passwordInputRef}
                      type={showNewPassword ? 'text' : 'password'}
                      name="member_password_reset"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError('');
                        setSuccessMsg('');
                      }}
                      placeholder="Type new password..."
                      className="w-full bg-white border border-[#E8D0B7] rounded-xl pl-3.5 pr-10 py-2 text-xs font-semibold text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6359] hover:text-[#2A1812] cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={!newPassword.trim() || isResettingPass || !canEditThisUser}
                    onClick={handleQuickPasswordReset}
                    className="px-3.5 py-2 rounded-xl bg-[#2A1812] hover:bg-[#FF5601] text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex-shrink-0"
                    title="Update password immediately without modifying other fields"
                  >
                    {isResettingPass ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
                <p className="text-[11px] text-[#7A6359]">
                  Admins can reset this password at any moment. Saving changes will immediately update credentials across all devices.
                </p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E8D0B7] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#7A6359] hover:text-[#2A1812] hover:bg-[#FAE6CE]/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !canEditThisUser}
              className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#FF5601] to-[#E04800] hover:from-[#E04800] hover:to-[#C83E00] shadow-[0_4px_14px_-2px_rgba(255,86,1,0.35)] transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isSaving
                ? 'Saving...'
                : userToEdit
                ? 'Save Account Changes'
                : 'Create Member Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
