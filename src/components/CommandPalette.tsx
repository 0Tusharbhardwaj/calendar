import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckSquare,
  Calendar,
  Users,
  Flame,
  X,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from './Navigation';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectTask: (taskId: string) => void;
  onOpenCreateTask: () => void;
  onOpenCreateEvent: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  onSelectTask,
  onOpenCreateTask,
  onOpenCreateEvent,
}) => {
  const { tasks, calendarEvents, teams } = useApp();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTasks = query.trim()
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.team?.name.toLowerCase().includes(query.toLowerCase())
      )
    : tasks.slice(0, 4);

  const filteredEvents = query.trim()
    ? calendarEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(query.toLowerCase()) ||
          e.description.toLowerCase().includes(query.toLowerCase())
      )
    : calendarEvents.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#2A1812]/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-xl bg-[#FFFBF7] rounded-3xl border border-[#E8D0B7] shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E8D0B7] gap-3">
          <Search className="w-5 h-5 text-[#FF5601]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a task, event, team or action..."
            className="w-full bg-transparent text-sm font-medium text-[#2A1812] placeholder-[#7A6359] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#7A6359] hover:bg-[#FAE6CE] hover:text-[#2A1812]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-3">
          {/* Quick Actions */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[#7A6359] px-2 mb-1">
              Quick Triggers
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateTask();
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-left bg-[#FAE6CE]/40 hover:bg-[#FAE6CE] text-[#2A1812] transition-colors font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#FF5601]" />
                <span>Create New Task</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateEvent();
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-left bg-[#FAE6CE]/40 hover:bg-[#FAE6CE] text-[#2A1812] transition-colors font-bold text-xs"
              >
                <Calendar className="w-3.5 h-3.5 text-[#FC9631]" />
                <span>Add Calendar Event</span>
              </button>
            </div>
          </div>

          {/* Navigation Shortcuts */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[#7A6359] px-2 mb-1">
              Go to View
            </p>
            <div className="grid grid-cols-3 gap-1 text-xs font-bold text-[#4A352D]">
              <button
                onClick={() => {
                  setActiveTab('calendar');
                  onClose();
                }}
                className="px-2.5 py-1.5 rounded-lg hover:bg-[#FAF1E6] text-left flex items-center gap-1.5"
              >
                <Calendar className="w-3 h-3 text-[#FC9631]" />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('tasks');
                  onClose();
                }}
                className="px-2.5 py-1.5 rounded-lg hover:bg-[#FAF1E6] text-left flex items-center gap-1.5"
              >
                <CheckSquare className="w-3 h-3 text-[#FF5601]" />
                <span>All Tasks</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('teams');
                  onClose();
                }}
                className="px-2.5 py-1.5 rounded-lg hover:bg-[#FAF1E6] text-left flex items-center gap-1.5"
              >
                <Users className="w-3 h-3 text-[#FE75B9]" />
                <span>Teams</span>
              </button>
            </div>
          </div>

          {/* Tasks Results */}
          {filteredTasks.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#7A6359] px-2 mb-1">
                Tasks ({filteredTasks.length})
              </p>
              <div className="space-y-1">
                {filteredTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      onClose();
                      onSelectTask(task.id);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-[#FAF1E6] text-[#2A1812] transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: task.team?.color || '#FF5601' }}
                      />
                      <span className="font-bold text-xs truncate">{task.title}</span>
                      <span className="text-[10px] text-[#7A6359] font-medium hidden sm:inline">
                        Due {task.deadline}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7A6359] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Calendar Events Results */}
          {filteredEvents.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#7A6359] px-2 mb-1">
                Calendar Milestones & Events ({filteredEvents.length})
              </p>
              <div className="space-y-1">
                {filteredEvents.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => {
                      setActiveTab('calendar');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-[#FAF1E6] text-[#2A1812] transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Calendar className="w-3.5 h-3.5 text-[#FC9631]" />
                      <span className="font-bold text-xs truncate">{evt.title}</span>
                      <span className="text-[10px] text-[#7A6359]">{evt.date}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FAE6CE] text-[#A63500] uppercase">
                      {evt.event_type.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#F8EFE4]/60 border-t border-[#E8D0B7] flex justify-between items-center text-[11px] text-[#7A6359]">
          <span>Navigation: ↑ ↓ Enter</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
