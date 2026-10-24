import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Plus,
  Edit2,
  Trash2,
  Key,
  Shield,
  User,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Team, UserProfile } from '../../types';

interface TeamsMembersViewProps {
  onOpenCreateTeam: () => void;
  onOpenEditTeam: (team: Team) => void;
  onOpenCreateUser: () => void;
  onOpenEditUser: (user: UserProfile) => void;
  onOpenEditUserPassword?: (user: UserProfile) => void;
}

export const TeamsMembersView: React.FC<TeamsMembersViewProps> = ({
  onOpenCreateTeam,
  onOpenEditTeam,
  onOpenCreateUser,
  onOpenEditUser,
  onOpenEditUserPassword,
}) => {
  const { teams, users, tasks, currentUser, deleteTeam, updateUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'teams' | 'members'>('teams');

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-6 shadow-warm-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5601] bg-[#FF5601]/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
            Organization Directory
          </span>
          <h2 className="text-xl font-black text-[#2A1812]">
            Teams & Member Operations
          </h2>
          <p className="text-xs text-[#7A6359] mt-0.5">
            Manage operational creative departments, member roles, and account security
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab Switcher */}
          <div className="flex items-center bg-[#FDF7F0] border border-[#E8D0B7] p-1 rounded-full text-xs font-bold">
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'teams'
                  ? 'bg-[#2A1812] text-white shadow-xs'
                  : 'text-[#7A6359] hover:text-[#2A1812]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Teams ({teams.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'members'
                  ? 'bg-[#2A1812] text-white shadow-xs'
                  : 'text-[#7A6359] hover:text-[#2A1812]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Members ({users.length})</span>
            </button>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenCreateTeam}
                className="bg-[#FC9631] hover:bg-[#E57E1E] text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Team</span>
              </button>
              <button
                onClick={onOpenCreateUser}
                className="bg-[#FF5601] hover:bg-[#E04800] text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-xs flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 1. Teams Grid Section */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {teams.map((team) => {
            const teamMembers = users.filter((u) => u.team_id === team.id);
            const teamTasks = tasks.filter((t) => t.team_id === team.id);
            const completedTasks = teamTasks.filter((t) => t.overall_status === 'approved');
            const activeTasks = teamTasks.filter((t) => t.overall_status !== 'approved');

            return (
              <div
                key={team.id}
                className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-6 shadow-warm-sm space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: team.color }}
                      >
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-[#2A1812]">
                          {team.name}
                        </h3>
                        <span className="text-[10px] font-bold text-[#7A6359] uppercase tracking-wider">
                          {teamMembers.length} active members
                        </span>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onOpenEditTeam(team)}
                          className="p-1.5 rounded-lg text-[#7A6359] hover:bg-[#FAE6CE] hover:text-[#2A1812]"
                          title="Edit Team"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {teams.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete team "${team.name}"?`)) {
                                deleteTeam(team.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                            title="Delete Team"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-[#7A6359] leading-relaxed">
                    {team.description}
                  </p>

                  {/* Operational Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-[#FAE6CE]/30 border border-[#E8D0B7]/60 p-2.5 rounded-2xl">
                      <span className="text-[10px] font-bold text-[#7A6359] block">
                        Active Tasks
                      </span>
                      <span className="text-lg font-black text-[#2A1812]">
                        {activeTasks.length}
                      </span>
                    </div>
                    <div className="bg-[#FAE6CE]/30 border border-[#E8D0B7]/60 p-2.5 rounded-2xl">
                      <span className="text-[10px] font-bold text-[#7A6359] block">
                        Completed
                      </span>
                      <span className="text-lg font-black text-emerald-800">
                        {completedTasks.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="pt-4 border-t border-[#E8D0B7]/60 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#7A6359] block">
                    Department Roster
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => isAdmin && onOpenEditUser(m)}
                        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#FAF1E6] border border-[#E8D0B7] text-xs font-bold text-[#2A1812] ${
                          isAdmin ? 'hover:border-[#FF5601] cursor-pointer' : ''
                        }`}
                      >
                        <img
                          src={m.avatar_url}
                          alt=""
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span>{m.full_name}</span>
                        {m.role === 'admin' && (
                          <span className="text-[9px] text-[#FF5601] font-black uppercase">
                            Admin
                          </span>
                        )}
                      </div>
                    ))}
                    {teamMembers.length === 0 && (
                      <span className="text-xs text-[#7A6359] italic">
                        No members assigned yet.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Members Directory Section */}
      {activeTab === 'members' && (
        <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl overflow-hidden shadow-warm-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAE6CE]/40 border-b border-[#E8D0B7] text-[#4A352D] font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Member</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Primary Team</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Status</th>
                  {isAdmin && <th className="py-3.5 px-5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D0B7]/60">
                {users.map((user) => {
                  const team = teams.find((t) => t.id === user.team_id);

                  return (
                    <tr key={user.id} className="hover:bg-[#FAF1E6]/40 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#E8D0B7]"
                          />
                          <div>
                            <span className="font-extrabold text-[#2A1812] block">
                              {user.full_name}
                            </span>
                            <span className="text-[11px] text-[#7A6359]">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            user.role === 'admin'
                              ? 'bg-[#FF5601]/20 text-[#A63500]'
                              : 'bg-[#FAE6CE] text-[#4A352D]'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: team?.badge_bg || '#FAE6CE',
                            color: team?.badge_text || '#2A1812',
                          }}
                        >
                          {team?.name || 'Unassigned'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#4A352D] font-medium">
                        {user.designation}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            user.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {isAdmin && (
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenEditUser(user)}
                              className="px-2.5 py-1 rounded-lg bg-[#FAF1E6] hover:bg-[#FAE6CE] text-[#2A1812] text-xs font-bold border border-[#E8D0B7] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Edit profile & permissions"
                            >
                              <Edit2 className="w-3 h-3 text-[#FF5601]" />
                              <span>Edit Profile</span>
                            </button>

                            <button
                              onClick={() =>
                                onOpenEditUserPassword
                                  ? onOpenEditUserPassword(user)
                                  : onOpenEditUser(user)
                              }
                              className="px-2.5 py-1 rounded-lg bg-[#FAF1E6] hover:bg-[#FAE6CE] text-[#2A1812] text-xs font-bold border border-[#E8D0B7] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Change password"
                            >
                              <Key className="w-3 h-3 text-[#FC9631]" />
                              <span>Password</span>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
