import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Flag,
  Sparkles,
  ExternalLink,
  Users,
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { useApp } from '../../context/AppContext';
import { TaskWithDetails, CalendarEvent, AssignmentStatus } from '../../types';

type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

interface CalendarViewProps {
  onSelectTask: (taskId: string) => void;
  onOpenCreateTask: (date?: string) => void;
  onOpenCreateEvent: (date?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onSelectTask,
  onOpenCreateTask,
  onOpenCreateEvent,
}) => {
  const { tasks, calendarEvents, teams, users } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Filters
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all'); // 'all' | 'tasks' | 'events'

  // Selected event popup details
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<CalendarEvent | null>(null);

  // Month navigation
  const nextPeriod = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
  };

  const prevPeriod = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    if (filterType === 'events') return [];
    return tasks.filter((t) => {
      if (filterTeam !== 'all' && t.team_id !== filterTeam) return false;
      if (filterStatus !== 'all') {
        if (filterStatus === 'overdue') {
          const nowStr = new Date().toISOString().split('T')[0];
          if (!(t.deadline < nowStr && t.overall_status !== 'approved')) return false;
        } else if (t.overall_status !== filterStatus) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, filterTeam, filterStatus, filterType]);

  // Filtered Independent Events
  const filteredEvents = useMemo(() => {
    if (filterType === 'tasks') return [];
    return calendarEvents.filter((e) => {
      if (filterTeam !== 'all' && e.team_id && e.team_id !== filterTeam) return false;
      return true;
    });
  }, [calendarEvents, filterTeam, filterType]);

  // Status Color Mapper
  const getStatusColor = (status: AssignmentStatus | 'overdue', isPastDeadline: boolean) => {
    if (isPastDeadline && status !== 'approved') {
      return {
        bg: '#FFF0F0',
        border: '#F87171',
        text: '#991B1B',
        badge: '#EF4444',
      };
    }
    switch (status) {
      case 'approved':
        return {
          bg: '#F0FDF4',
          border: '#86EFAC',
          text: '#166534',
          badge: '#22C55E',
        };
      case 'submitted':
      case 'resubmitted':
        return {
          bg: '#FEF9C3',
          border: '#FDE047',
          text: '#854D0E',
          badge: '#EAB308',
        };
      case 'revision_required':
        return {
          bg: '#FDF2F8',
          border: '#F472B6',
          text: '#9D174D',
          badge: '#EC4899',
        };
      case 'in_progress':
        return {
          bg: '#EFF6FF',
          border: '#93C5FD',
          text: '#1E40AF',
          badge: '#3B82F6',
        };
      default:
        return {
          bg: '#FDF7F0',
          border: '#E8D0B7',
          text: '#4A352D',
          badge: '#A89284',
        };
    }
  };

  // Month grid dates
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Week view dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar: Date Navigator, View Switcher & Filters */}
      <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-5 shadow-warm-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Month / Period Heading & Nav Controls */}
          <div className="flex items-center space-x-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#2A1812] flex items-center gap-2">
              <span>{format(currentDate, viewMode === 'day' ? 'MMMM d, yyyy' : 'MMMM yyyy')}</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAE6CE] text-[#8C4B00] border border-[#E8D0B7] hidden sm:inline">
                Org Calendar
              </span>
            </h2>

            <div className="flex items-center bg-[#FDF7F0] border border-[#E8D0B7] rounded-full p-0.5">
              <button
                onClick={prevPeriod}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#FAE6CE] text-[#4A352D] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextPeriod}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#FAE6CE] text-[#4A352D] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={goToToday}
              className="px-3.5 py-1 bg-[#FDF7F0] hover:bg-[#FAE6CE] border border-[#E8D0B7] rounded-full text-xs font-bold text-[#2A1812] transition-colors"
            >
              Today
            </button>
          </div>

          {/* View Mode Tabs & Add Triggers */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#FDF7F0] border border-[#E8D0B7] p-1 rounded-full text-xs font-bold">
              {(['month', 'week', 'day', 'agenda'] as CalendarViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-full capitalize transition-all ${
                    viewMode === mode
                      ? 'bg-[#2A1812] text-white shadow-xs'
                      : 'text-[#7A6359] hover:text-[#2A1812]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              onClick={() => onOpenCreateTask(format(currentDate, 'yyyy-MM-dd'))}
              className="bg-[#FF5601] hover:bg-[#E04800] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Task</span>
            </button>

            <button
              onClick={() => onOpenCreateEvent(format(currentDate, 'yyyy-MM-dd'))}
              className="bg-[#FC9631] hover:bg-[#E57E1E] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Event</span>
            </button>
          </div>
        </div>

        {/* Filters Bar & Category Legend */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-[#E8D0B7]/60 text-xs">
          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 text-[#7A6359] font-bold mr-1">
              <Filter className="w-3.5 h-3.5 text-[#FF5601]" />
              <span>Filter:</span>
            </div>

            {/* Team Filter */}
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="bg-[#FDF7F0] border border-[#E8D0B7] rounded-full px-3 py-1 text-xs font-bold text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
            >
              <option value="all">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#FDF7F0] border border-[#E8D0B7] rounded-full px-3 py-1 text-xs font-bold text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
            >
              <option value="all">All Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted for Review</option>
              <option value="revision_required">Revision Required</option>
              <option value="approved">Approved</option>
              <option value="overdue">Overdue</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#FDF7F0] border border-[#E8D0B7] rounded-full px-3 py-1 text-xs font-bold text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
            >
              <option value="all">Tasks & Events</option>
              <option value="tasks">Only Tasks</option>
              <option value="events">Only Independent Events</option>
            </select>
          </div>

          {/* Color Status Legend */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#7A6359]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#A89284]" /> Assigned
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> In Progress
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#EAB308]" /> Review
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#EC4899]" /> Revisions
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" /> Approved
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Overdue
            </span>
          </div>
        </div>
      </div>

      {/* 2. Calendar View Switcher Output */}

      {/* --- MONTH VIEW --- */}
      {viewMode === 'month' && (
        <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl overflow-hidden shadow-warm-sm">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center font-bold text-xs py-3 bg-[#FAE6CE]/40 border-b border-[#E8D0B7] text-[#4A352D]">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span className="text-[#8C4B00]">Sat</span>
            <span className="text-[#8C4B00]">Sun</span>
          </div>

          {/* Grid Matrix */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#E8D0B7]">
            {calendarDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);

              // Tasks on this day (by deadline)
              const dayTasks = filteredTasks.filter((t) => t.deadline === dateStr);
              // Events on this day
              const dayEvents = filteredEvents.filter((e) => e.date === dateStr);

              const totalItems = dayTasks.length + dayEvents.length;

              return (
                <div
                  key={dateStr}
                  className={`min-h-[135px] p-2 transition-colors group relative ${
                    isToday
                      ? 'bg-[#FFF8F2] border-2 border-[#FF5601]/40 rounded-sm'
                      : isCurrentMonth
                      ? 'bg-white hover:bg-[#FAF1E6]/40'
                      : 'bg-[#FDF7F0]/40 text-[#A89284]'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-[#FF5601] text-white shadow-xs'
                          : isCurrentMonth
                          ? 'text-[#2A1812]'
                          : 'text-[#A89284]'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>

                    {/* Quick Add Button on Hover */}
                    <button
                      onClick={() => onOpenCreateTask(dateStr)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-[#FAE6CE] text-[#FF5601] transition-opacity"
                      title="Add task on this date"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Entries inside day cell */}
                  <div className="space-y-1.5 overflow-hidden">
                    {/* Independent Events (Milestones, Campaigns) */}
                    {dayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedCalendarEvent(evt)}
                        className="p-1.5 rounded-lg bg-[#F9CC61]/35 border border-[#F9CC61] text-[11px] font-bold text-[#473229] hover:shadow-xs cursor-pointer transition-transform hover:-translate-y-0.5 truncate flex items-center gap-1"
                        title={`${evt.title} (${evt.event_type})`}
                      >
                        <Flag className="w-3 h-3 text-[#B85B00] flex-shrink-0" />
                        <span className="truncate">{evt.title}</span>
                      </div>
                    ))}

                    {/* Task Deliverables */}
                    {dayTasks.slice(0, 3).map((task) => {
                      const nowStr = new Date().toISOString().split('T')[0];
                      const isPast = task.deadline < nowStr;
                      const style = getStatusColor(task.overall_status, isPast);

                      return (
                        <div
                          key={task.id}
                          onClick={() => onSelectTask(task.id)}
                          className="p-1.5 rounded-lg border text-[11px] cursor-pointer transition-transform hover:-translate-y-0.5 shadow-xs truncate"
                          style={{
                            backgroundColor: style.bg,
                            borderColor: style.border,
                            color: style.text,
                          }}
                          title={`${task.title} - ${task.team?.name}`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: style.badge }}
                            />
                            <span className="text-[9px] font-black uppercase tracking-wider truncate">
                              {task.team?.name?.split(' ')[0]}
                            </span>
                          </div>
                          <p className="font-extrabold truncate text-xs">{task.title}</p>
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <button
                        onClick={() => {
                          setCurrentDate(day);
                          setViewMode('day');
                        }}
                        className="w-full text-center text-[10px] font-bold text-[#FF5601] hover:underline"
                      >
                        +{dayTasks.length - 3} more items
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- WEEK VIEW --- */}
      {viewMode === 'week' && (
        <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl overflow-hidden shadow-warm-sm">
          <div className="grid grid-cols-7 text-center font-bold text-xs py-3 bg-[#FAE6CE]/40 border-b border-[#E8D0B7] text-[#4A352D]">
            {weekDays.map((d) => (
              <span key={d.toString()}>
                {format(d, 'EEE d MMM')}
                {isSameDay(d, new Date()) && ' (Today)'}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-[#E8D0B7] min-h-[400px]">
            {weekDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayTasks = filteredTasks.filter((t) => t.deadline === dateStr);
              const dayEvents = filteredEvents.filter((e) => e.date === dateStr);

              return (
                <div key={dateStr} className="p-3 space-y-2 hover:bg-[#FAF1E6]/30 transition-colors">
                  <div className="text-right">
                    <button
                      onClick={() => onOpenCreateTask(dateStr)}
                      className="text-[10px] font-bold text-[#FF5601] hover:underline"
                    >
                      + Add
                    </button>
                  </div>

                  {dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedCalendarEvent(evt)}
                      className="p-2 rounded-xl bg-[#F9CC61]/35 border border-[#F9CC61] text-xs font-bold text-[#473229] cursor-pointer hover:shadow-xs"
                    >
                      <span className="text-[10px] uppercase font-black text-[#A63500] block">
                        {evt.start_time || 'All Day'} • {evt.event_type}
                      </span>
                      <p className="mt-0.5">{evt.title}</p>
                    </div>
                  ))}

                  {dayTasks.map((task) => {
                    const nowStr = new Date().toISOString().split('T')[0];
                    const isPast = task.deadline < nowStr;
                    const style = getStatusColor(task.overall_status, isPast);

                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task.id)}
                        className="p-2.5 rounded-xl border text-xs cursor-pointer hover:shadow-xs space-y-1"
                        style={{
                          backgroundColor: style.bg,
                          borderColor: style.border,
                          color: style.text,
                        }}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">
                          {task.team?.name}
                        </span>
                        <h4 className="font-extrabold text-xs">{task.title}</h4>
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-black/10">
                          <span>{task.assignments.length} assigned</span>
                          <span className="capitalize font-bold">{task.overall_status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- DAY VIEW --- */}
      {viewMode === 'day' && (
        <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-6 shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8D0B7]/60">
            <div>
              <h3 className="text-lg font-black text-[#2A1812]">
                Schedule for {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <p className="text-xs text-[#7A6359]">
                All deadlines and synchronized milestones for this date
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenCreateTask(format(currentDate, 'yyyy-MM-dd'))}
                className="bg-[#FF5601] text-white text-xs font-bold px-3.5 py-1.5 rounded-full"
              >
                + New Task
              </button>
              <button
                onClick={() => onOpenCreateEvent(format(currentDate, 'yyyy-MM-dd'))}
                className="bg-[#FC9631] text-white text-xs font-bold px-3.5 py-1.5 rounded-full"
              >
                + New Event
              </button>
            </div>
          </div>

          {(() => {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const dayTasks = filteredTasks.filter((t) => t.deadline === dateStr);
            const dayEvents = filteredEvents.filter((e) => e.date === dateStr);

            if (dayTasks.length === 0 && dayEvents.length === 0) {
              return (
                <div className="py-12 text-center text-[#7A6359]">
                  <CalendarIcon className="w-8 h-8 opacity-40 mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#2A1812]">No deadlines or events scheduled</p>
                  <p className="text-[11px]">Enjoy an open production window or add a new deliverable.</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {dayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedCalendarEvent(evt)}
                    className="p-4 rounded-2xl bg-[#F9CC61]/30 border border-[#F9CC61] flex items-center justify-between cursor-pointer hover:shadow-xs"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-[#B85B00] block">
                        Milestone • {evt.start_time || 'All Day'} - {evt.end_time || ''}
                      </span>
                      <h4 className="font-extrabold text-sm text-[#2A1812]">{evt.title}</h4>
                      {evt.description && (
                        <p className="text-xs text-[#4A352D]">{evt.description}</p>
                      )}
                    </div>
                    {evt.reference_url && (
                      <a
                        href={evt.reference_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#FF5601] font-bold hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Link</span>
                      </a>
                    )}
                  </div>
                ))}

                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    className="p-4 rounded-2xl bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 border border-[#E8D0B7] flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: task.team?.badge_bg || '#FAE6CE',
                            color: task.team?.badge_text || '#2A1812',
                          }}
                        >
                          {task.team?.name}
                        </span>
                        <span className="text-[10px] font-black uppercase text-[#FF5601]">
                          {task.priority} Priority
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-[#2A1812]">{task.title}</h4>
                      <p className="text-xs text-[#7A6359] line-clamp-1">{task.description}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#FF5601] block">
                        Due {task.deadline}
                      </span>
                      <span className="text-[11px] text-[#7A6359] capitalize">
                        {task.overall_status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* --- AGENDA / LIST VIEW --- */}
      {viewMode === 'agenda' && (
        <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-6 shadow-warm-sm space-y-4">
          <div className="pb-3 border-b border-[#E8D0B7]/60">
            <h3 className="text-lg font-black text-[#2A1812]">Chronological Content Agenda</h3>
            <p className="text-xs text-[#7A6359]">All upcoming scheduled tasks and milestones sorted by date</p>
          </div>

          <div className="divide-y divide-[#E8D0B7]/60 space-y-3">
            {[...filteredTasks]
              .sort((a, b) => a.deadline.localeCompare(b.deadline))
              .map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  className="pt-3 first:pt-0 flex items-center justify-between p-3 rounded-2xl hover:bg-[#FAF1E6]/40 cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: task.team?.badge_bg || '#FAE6CE',
                          color: task.team?.badge_text || '#2A1812',
                        }}
                      >
                        {task.team?.name}
                      </span>
                      <span className="text-xs font-black text-[#FF5601]">{task.deadline}</span>
                    </div>
                    <h4 className="font-extrabold text-xs text-[#2A1812]">{task.title}</h4>
                    <p className="text-[11px] text-[#7A6359]">{task.description}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold capitalize block text-[#2A1812]">
                      {task.overall_status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-[#7A6359]">
                      {task.assignments.length} assigned
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 3. Independent Calendar Event Details Modal */}
      {selectedCalendarEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1812]/50 backdrop-blur-xs animate-fadeIn">
          <div
            className="w-full max-w-md bg-[#FFFBF7] rounded-3xl border border-[#E8D0B7] shadow-2xl p-6 space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#A63500] px-2 py-0.5 rounded-full bg-[#FAE6CE]">
                  {selectedCalendarEvent.event_type.replace('_', ' ')}
                </span>
                <h3 className="text-lg font-extrabold text-[#2A1812] mt-1">
                  {selectedCalendarEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCalendarEvent(null)}
                className="p-1 rounded-full text-[#7A6359] hover:bg-[#FAE6CE]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#4A352D]">
              <p className="flex items-center gap-1.5 font-bold text-[#FF5601]">
                <CalendarIcon className="w-4 h-4" />
                <span>Date: {selectedCalendarEvent.date}</span>
                {selectedCalendarEvent.start_time && (
                  <span>
                    ({selectedCalendarEvent.start_time} - {selectedCalendarEvent.end_time || 'Wrap'})
                  </span>
                )}
              </p>

              {selectedCalendarEvent.description && (
                <p className="bg-[#FAE6CE]/20 p-3 rounded-xl border border-[#E8D0B7] leading-relaxed">
                  {selectedCalendarEvent.description}
                </p>
              )}

              {selectedCalendarEvent.reference_url && (
                <a
                  href={selectedCalendarEvent.reference_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-[#FF5601] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{selectedCalendarEvent.reference_url}</span>
                </a>
              )}
            </div>

            <div className="pt-3 border-t border-[#E8D0B7] flex justify-end">
              <button
                onClick={() => setSelectedCalendarEvent(null)}
                className="px-5 py-1.5 rounded-full bg-[#2A1812] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
