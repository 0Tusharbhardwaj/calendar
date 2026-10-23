import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Users,
  History,
  Bell,
  Search,
  Plus,
  Flame,
  LayoutDashboard,
  CheckSquare,
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
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

  const pendingApprovalsCount = tasks
    .flatMap((t) => t.assignments)
    .filter((a) => a.status === 'submitted' || a.status === 'resubmitted').length;

  return (
    <>
      {/* 1. Sleek Full-Width Top Navigation Bar (Laptop & Desktop) */}
      <header className="sticky top-0 z-40 w-full bg-[#FFFBF7]/90 backdrop-blur-md border-b border-[#E8D0B7]/60 shadow-[0_1px_3px_rgba(42,24,18,0.03)] transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          {/* Left: Brand Identity & Search */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-2.5 text-left focus:outline-none group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF5601] to-[#FC9631] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(255,86,1,0.3)] group-hover:scale-105 transition-transform duration-150">
                <Flame className="w-4.5 h-4.5 fill-white" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-base sm:text-lg font-black text-[#2A1812] tracking-tight leading-none">
                  TeamFlow
                </span>
                <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#FF5601]/10 text-[#FF5601] border border-[#FF5601]/20">
                  Workspace
                </span>
              </div>
            </button>

            {/* Quick Search Shortcut Trigger (Desktop) */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden lg:flex items-center space-x-2.5 bg-[#FAF1E6]/70 hover:bg-[#FAF1E6] border border-[#E8D0B7]/70 rounded-xl px-3 py-1.5 text-xs text-[#7A6359] hover:border-[#FC9631]/50 transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#FF5601]" />
              <span className="text-xs font-medium text-[#6B554B]">Search tasks, events...</span>
              <kbd className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white text-[#7A6359] border border-[#E8D0B7]/70 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Center: Refined Navigation Tabs (Laptop & Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#F4ECE1]/80 border border-[#E8D0B7]/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#2A1812] shadow-xs border border-[#E8D0B7]/50'
                  : 'text-[#6B554B] hover:text-[#2A1812] hover:bg-white/40'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#FF5601]" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'calendar'
                  ? 'bg-white text-[#2A1812] shadow-xs border border-[#E8D0B7]/50'
                  : 'text-[#6B554B] hover:text-[#2A1812] hover:bg-white/40'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#FC9631]" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'tasks'
                  ? 'bg-white text-[#2A1812] shadow-xs border border-[#E8D0B7]/50'
                  : 'text-[#6B554B] hover:text-[#2A1812] hover:bg-white/40'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#FF5601]" />
              <span>Tasks</span>
            </button>

            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'approvals'
                  ? 'bg-white text-[#2A1812] shadow-xs border border-[#E8D0B7]/50'
                  : 'text-[#6B554B] hover:text-[#2A1812] hover:bg-white/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FE75B9]" />
              <span>Approvals</span>
              {pendingApprovalsCount > 0 && (
                <span className="bg-[#FE75B9] text-[#2A1812] font-black text-[10px] px-1.5 rounded-full ml-0.5">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('teams')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'teams'
                  ? 'bg-white text-[#2A1812] shadow-xs border border-[#E8D0B7]/50'
                  : 'text-[#6B554B] hover:text-[#2A1812] hover:bg-white/40'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#FC9631]" />
              <span>Teams & Members</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'activity'
                  ? 'bg-white text-[#2A1812] shadow-xs border border-[#E8D0B7]/50'
                  : 'text-[#6B554B] hover:text-[#2A1812] hover:bg-white/40'
              }`}
            >
              <History className="w-3.5 h-3.5 text-[#7A6359]" />
              <span>Activity</span>
            </button>
          </nav>

          {/* Right Controls: Actions, Search, Notifications, User Profile */}
          <div className="flex items-center space-x-2">
            {/* Mobile / Tablet search icon */}
            <button
              onClick={onOpenCommandPalette}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#4A352D] hover:bg-[#FAF1E6] transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative w-8 h-8 rounded-lg flex items-center justify-center text-[#4A352D] hover:bg-[#FAF1E6] transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF5601] ring-2 ring-[#FFFBF7]" />
              )}
            </button>

            {/* Create Action Button (Dropdown for Task / Event) */}
            <div className="relative">
              <button
                onClick={() => setCreateMenuOpen(!createMenuOpen)}
                className="bg-gradient-to-r from-[#FF5601] to-[#E04800] hover:from-[#E04800] hover:to-[#C83E00] text-white font-extrabold text-xs px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-[0_2px_8px_rgba(255,86,1,0.25)] flex items-center gap-1 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Create</span>
                <ChevronDown className="w-3 h-3 opacity-80" />
              </button>

              {createMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-[#FFFBF7] border border-[#E8D0B7] rounded-2xl shadow-xl py-1.5 z-50 text-xs animate-scaleUp"
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

            {/* User Profile / Admin Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-1.5 p-1 rounded-xl hover:bg-[#FAF1E6] transition-all"
              >
                <img
                  src={currentUser?.avatar_url}
                  alt={currentUser?.full_name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-[#E8D0B7] bg-[#FAE6CE]"
                />
                <span className="hidden lg:block text-xs font-bold text-[#2A1812] max-w-[100px] truncate">
                  {currentUser?.full_name?.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-[#7A6359] hidden sm:block opacity-70" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#FFFBF7] border border-[#E8D0B7] rounded-2xl shadow-xl py-2 z-50 text-xs animate-scaleUp">
                  {/* Current Active Account Card */}
                  <div className="px-4 py-2.5 border-b border-[#E8D0B7]/60">
                    <p className="font-extrabold text-[#2A1812] text-sm leading-tight">
                      {currentUser?.full_name}
                    </p>
                    <p className="text-[#7A6359] text-[11px] font-medium mt-0.5">
                      @{currentUser?.username} • {currentUser?.designation}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAE6CE] text-[#A63500]">
                      <ShieldCheck className="w-3 h-3 text-[#FF5601]" />
                      Administrator
                    </span>
                  </div>

                  {/* Switch Between Tushar & Bhoomika */}
                  <div className="px-3 py-2 border-b border-[#E8D0B7]/60">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#7A6359] mb-1.5 px-1">
                      Active Workspace Admins
                    </p>
                    <div className="space-y-1">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors ${
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
                            <span className="truncate text-xs font-extrabold">{u.full_name}</span>
                          </div>
                          <span className="text-[10px] text-[#A63500] font-black uppercase">
                            Admin
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Account options */}
                  <div className="pt-1 px-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenLogin();
                      }}
                      className="w-full px-3 py-2 text-left font-bold text-[#4A352D] hover:bg-[#FAF1E6] rounded-xl flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-[#FC9631]" />
                      <span>Switch / Log In</span>
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
        </div>
      </header>

      {/* 2. Native-Grade Mobile Bottom Navigation Bar (Phone viewport < 768px) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FFFBF7]/95 backdrop-blur-md border-t border-[#E8D0B7] py-2 px-2 shadow-[0_-4px_20px_rgba(42,24,18,0.05)]">
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'text-[#FF5601] font-black'
                : 'text-[#7A6359] hover:text-[#2A1812]'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'dashboard' ? 'bg-[#FF5601]/15 text-[#FF5601]' : ''}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center py-1 rounded-xl transition-all ${
              activeTab === 'calendar'
                ? 'text-[#FF5601] font-black'
                : 'text-[#7A6359] hover:text-[#2A1812]'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'calendar' ? 'bg-[#FF5601]/15 text-[#FF5601]' : ''}`}>
              <CalendarIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center py-1 rounded-xl transition-all ${
              activeTab === 'tasks'
                ? 'text-[#FF5601] font-black'
                : 'text-[#7A6359] hover:text-[#2A1812]'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'tasks' ? 'bg-[#FF5601]/15 text-[#FF5601]' : ''}`}>
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex flex-col items-center py-1 rounded-xl transition-all relative ${
              activeTab === 'approvals'
                ? 'text-[#FF5601] font-black'
                : 'text-[#7A6359] hover:text-[#2A1812]'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'approvals' ? 'bg-[#FF5601]/15 text-[#FF5601]' : ''}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Approvals</span>
            {pendingApprovalsCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#FE75B9]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`flex flex-col items-center py-1 rounded-xl transition-all ${
              activeTab === 'teams'
                ? 'text-[#FF5601] font-black'
                : 'text-[#7A6359] hover:text-[#2A1812]'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'teams' ? 'bg-[#FF5601]/15 text-[#FF5601]' : ''}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Teams</span>
          </button>
        </div>
      </nav>
    </>
  );
};
