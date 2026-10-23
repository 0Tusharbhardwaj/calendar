import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Users,
  History,
  Bell,
  Search,
  Plus,
  Sparkles,
  Shield,
  User,
  LogOut,
  ChevronDown,
  Layers,
  Flame,
  LayoutDashboard,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type ActiveTab = 'dashboard' | 'calendar' | 'tasks' | 'approvals' | 'teams' | 'activity';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCreateTask: () => void;
  onOpenCreateEvent: () => void;
  onOpenCommandPalette: () => void;
  onOpenNotifications: () => void;
  onOpenLogin: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateTask,
  onOpenCreateEvent,
  onOpenCommandPalette,
  onOpenNotifications,
  onOpenLogin,
}) => {
  const { currentUser, users, switchUser, logout, unreadCount, tasks } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  // Count pending submissions awaiting review
  const pendingApprovalsCount = tasks.flatMap((t) => t.assignments).filter((a) => a.status === 'submitted' || a.status === 'resubmitted').length;

  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      {/* 1. Floating Top Navigation Capsule */}
      <header className="sticky top-3 z-40 px-3 sm:px-6 max-w-7xl mx-auto">
        <nav className="bg-[#FDF7F0]/92 backdrop-blur-md rounded-full border border-[#E8D0B7] shadow-[0_12px_32px_-4px_rgba(71,50,41,0.09),0_4px_12px_-2px_rgba(71,50,41,0.04)] px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-200">
          {/* Brand & Global Search Trigger */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-2.5 group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-full bg-[#FF5601] flex items-center justify-center text-white shadow-[0_4px_12px_-1px_rgba(255,86,1,0.4)] group-hover:scale-105 transition-transform duration-200">
                <Flame className="w-5 h-5 fill-white" />
              </div>
              <div className="text-left">
                <span className="text-xl font-extrabold text-[#2A1812] tracking-tight leading-none block">
                  TeamFlow
                </span>
                <span className="text-[10px] font-bold text-[#FC9631] tracking-widest uppercase block">
                  Studio Ops
                </span>
              </div>
            </button>

            {/* Quick Search Shortcut Trigger */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden md:flex items-center space-x-2 bg-[#FAE6CE]/40 hover:bg-[#FAE6CE]/75 border border-[#E8D0B7] rounded-full px-3.5 py-1.5 text-xs text-[#7A6359] transition-all duration-150 group"
            >
              <Search className="w-3.5 h-3.5 text-[#A63500]" />
              <span className="text-xs font-medium text-[#4A352D]">Search tasks, events...</span>
              <kbd className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FDF7F0] text-[#7A6359] border border-[#E8D0B7]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 sm:space-x-2 bg-[#F5E6D4]/50 border border-[#E8D0B7]/60 p-1 rounded-full">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-[#2A1812] text-white shadow-sm'
                  : 'text-[#4A352D] hover:text-[#2A1812] hover:bg-[#FAE6CE]/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Overview' : 'My Dashboard'}</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'calendar'
                  ? 'bg-[#2A1812] text-white shadow-sm'
                  : 'text-[#4A352D] hover:text-[#2A1812] hover:bg-[#FAE6CE]/60'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'tasks'
                  ? 'bg-[#2A1812] text-white shadow-sm'
                  : 'text-[#4A352D] hover:text-[#2A1812] hover:bg-[#FAE6CE]/60'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'All Tasks' : 'My Tasks'}</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('approvals')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                  activeTab === 'approvals'
                    ? 'bg-[#2A1812] text-white shadow-sm'
                    : 'text-[#4A352D] hover:text-[#2A1812] hover:bg-[#FAE6CE]/60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FE75B9]" />
                <span>Approvals</span>
                {pendingApprovalsCount > 0 && (
                  <span className="bg-[#FE75B9] text-[#2A1812] font-black text-[10px] px-1.5 py-0.2 rounded-full shadow-sm animate-pulse">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab('teams')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'teams'
                  ? 'bg-[#2A1812] text-white shadow-sm'
                  : 'text-[#4A352D] hover:text-[#2A1812] hover:bg-[#FAE6CE]/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Teams & Members' : 'Team Hub'}</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'activity'
                  ? 'bg-[#2A1812] text-white shadow-sm'
                  : 'text-[#4A352D] hover:text-[#2A1812] hover:bg-[#FAE6CE]/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Activity</span>
            </button>
          </div>

          {/* Right Controls: Role Pill, Notifications, User Menu, Action */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Role indicator pill */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-[#FAF1E6] border border-[#E8D0B7] px-2.5 py-1 rounded-full text-[11px] font-bold text-[#4A352D]">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAdmin ? 'bg-emerald-400' : 'bg-[#FC9631]'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isAdmin ? 'bg-emerald-500' : 'bg-[#FC9631]'}`}></span>
              </span>
              <span>{isAdmin ? 'Admin Mode' : 'Member Mode'}</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#4A352D] hover:bg-[#FAE6CE] hover:text-[#2A1812] transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#FF5601] ring-2 ring-[#FDF7F0]" />
              )}
            </button>

            {/* Create Action Menu (Admin only or member submit) */}
            {isAdmin ? (
              <div className="relative">
                <button
                  onClick={() => setCreateMenuOpen(!createMenuOpen)}
                  className="bg-[#FF5601] hover:bg-[#E04800] text-white font-bold text-xs px-3.5 py-2 rounded-full shadow-[0_4px_14px_-2px_rgba(255,86,1,0.4)] flex items-center gap-1.5 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span className="hidden sm:inline">Create</span>
                  <ChevronDown className="w-3 h-3 opacity-80" />
                </button>

                {createMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-[#FFFBF7] border border-[#E8D0B7] rounded-2xl shadow-xl py-1.5 z-50 text-xs"
                    onClick={() => setCreateMenuOpen(false)}
                  >
                    <button
                      onClick={onOpenCreateTask}
                      className="w-full px-3.5 py-2.5 text-left font-bold text-[#2A1812] hover:bg-[#FAE6CE]/60 flex items-center gap-2"
                    >
                      <CheckSquare className="w-4 h-4 text-[#FF5601]" />
                      <span>New Task</span>
                    </button>
                    <button
                      onClick={onOpenCreateEvent}
                      className="w-full px-3.5 py-2.5 text-left font-bold text-[#2A1812] hover:bg-[#FAE6CE]/60 flex items-center gap-2"
                    >
                      <CalendarIcon className="w-4 h-4 text-[#FC9631]" />
                      <span>New Calendar Event</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('tasks')}
                className="bg-[#FF5601] hover:bg-[#E04800] text-white font-bold text-xs px-3.5 py-2 rounded-full shadow-[0_4px_14px_-2px_rgba(255,86,1,0.4)] flex items-center gap-1.5 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>My Work</span>
              </button>
            )}

            {/* User Profile / Fast Perspective Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-[#E8D0B7] transition-all"
              >
                {currentUser?.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[#E8D0B7]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#FAE6CE] text-[#2A1812] flex items-center justify-center font-bold text-xs">
                    {currentUser?.full_name?.charAt(0) || 'U'}
                  </div>
                )}
                <ChevronDown className="w-3 h-3 text-[#7A6359] hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#FFFBF7] border border-[#E8D0B7] rounded-2xl shadow-xl py-2 z-50 text-xs">
                  {/* Current User Card */}
                  <div className="px-4 py-2.5 border-b border-[#E8D0B7]/60">
                    <p className="font-extrabold text-[#2A1812] text-sm leading-tight">
                      {currentUser?.full_name}
                    </p>
                    <p className="text-[#7A6359] text-[11px] font-medium mt-0.5">
                      @{currentUser?.username} • {currentUser?.designation}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAE6CE] text-[#A63500]">
                      {currentUser?.role === 'admin' ? 'Administrator' : 'Team Member'}
                    </span>
                  </div>

                  {/* Fast Perspective Switcher */}
                  <div className="px-3 py-2 border-b border-[#E8D0B7]/60">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#7A6359] mb-1.5 px-1">
                      Switch Active User (Demo)
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors ${
                            u.id === currentUser?.id
                              ? 'bg-[#FAE6CE] font-bold text-[#2A1812]'
                              : 'hover:bg-[#FAF1E6] text-[#4A352D]'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <img
                              src={u.avatar_url}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="truncate text-xs">{u.full_name}</span>
                          </div>
                          <span className="text-[10px] text-[#A63500] font-bold uppercase">
                            {u.role === 'admin' ? 'Admin' : 'Member'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sign Out / Re-login */}
                  <div className="pt-1 px-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenLogin();
                      }}
                      className="w-full px-3 py-2 text-left font-bold text-[#4A352D] hover:bg-[#FAF1E6] rounded-xl flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-[#FC9631]" />
                      <span>Log In As Different User</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-3 py-2 text-left font-bold text-red-700 hover:bg-red-50 rounded-xl flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* 2. Sleek Floating Bottom Dock for Mobile & Tablet (No intrusive rigid sidebar!) */}
      <div className="lg:hidden fixed bottom-4 inset-x-0 z-40 px-4 flex justify-center pointer-events-none">
        <div className="bg-[#2A1812]/95 backdrop-blur-md text-white rounded-full px-3 py-2 shadow-2xl flex items-center space-x-2 pointer-events-auto border border-[#E8D0B7]/20">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`p-2 rounded-full transition-colors ${
              activeTab === 'dashboard' ? 'bg-[#FF5601] text-white' : 'text-[#FAF1E6]/70 hover:text-white'
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`p-2 rounded-full transition-colors ${
              activeTab === 'calendar' ? 'bg-[#FF5601] text-white' : 'text-[#FAF1E6]/70 hover:text-white'
            }`}
            title="Calendar"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`p-2 rounded-full transition-colors ${
              activeTab === 'tasks' ? 'bg-[#FF5601] text-white' : 'text-[#FAF1E6]/70 hover:text-white'
            }`}
            title="Tasks"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('approvals')}
              className={`p-2 rounded-full transition-colors relative ${
                activeTab === 'approvals' ? 'bg-[#FF5601] text-white' : 'text-[#FAF1E6]/70 hover:text-white'
              }`}
              title="Approvals"
            >
              <CheckCircle2 className="w-4 h-4" />
              {pendingApprovalsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FE75B9]" />
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTab('teams')}
            className={`p-2 rounded-full transition-colors ${
              activeTab === 'teams' ? 'bg-[#FF5601] text-white' : 'text-[#FAF1E6]/70 hover:text-white'
            }`}
            title="Teams"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenCommandPalette}
            className="p-2 rounded-full bg-[#3F261E] text-[#FAF1E6] hover:bg-[#523328]"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};
