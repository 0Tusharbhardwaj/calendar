import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  FileCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskWithDetails, TaskPriority, AssignmentStatus } from '../../types';

interface TasksViewProps {
  onSelectTask: (taskId: string) => void;
  onOpenCreateTask: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  onSelectTask,
  onOpenCreateTask,
}) => {
  const { tasks, teams, users, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const nowStr = new Date().toISOString().split('T')[0];

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // If member, optionally allow viewing all or default view
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchTeam = t.team?.name.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchTeam) return false;
      }

      if (filterTeam !== 'all' && t.team_id !== filterTeam) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;

      if (filterStatus !== 'all') {
        if (filterStatus === 'overdue') {
          if (!(t.deadline < nowStr && t.overall_status !== 'approved')) return false;
        } else if (t.overall_status !== filterStatus) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, search, filterTeam, filterStatus, filterPriority, nowStr]);

  const getStatusBadge = (status: AssignmentStatus | 'overdue', isOverdue: boolean) => {
    if ((isOverdue || status === 'overdue') && status !== 'approved') {
      return (
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
          ⚠️ Overdue
        </span>
      );
    }
    switch (status) {
      case 'approved':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Approved
          </span>
        );
      case 'submitted':
      case 'resubmitted':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F9CC61]/40 text-[#7A5200]">
            Awaiting Review
          </span>
        );
      case 'revision_required':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FE75B9]/20 text-[#A91F62]">
            Revision Required
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FC9631]/20 text-[#B85B00]">
            In Progress
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAE6CE] text-[#4A352D]">
            Assigned
          </span>
        );
    }
  };

  const getPriorityBadge = (p: TaskPriority) => {
    const map: Record<TaskPriority, string> = {
      low: 'text-[#4A352D] bg-[#FAE6CE]',
      medium: 'text-[#B85B00] bg-[#FC9631]/20',
      high: 'text-[#A91F62] bg-[#FE75B9]/20',
      urgent: 'text-[#A63500] bg-[#FF5601]/20 font-black',
    };
    return (
      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${map[p]}`}>
        {p}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Search, Filter Toolbar & Layout Switcher */}
      <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-5 shadow-warm-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#2A1812]">
              {isAdmin ? 'All Tasks & Production Pipeline' : 'Tasks Directory'}
            </h2>
            <p className="text-xs text-[#7A6359]">
              Search, filter, and inspect deliverables across all creative units
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Layout Toggle */}
            <div className="flex items-center bg-[#FDF7F0] border border-[#E8D0B7] p-1 rounded-full">
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-full transition-colors ${
                  viewLayout === 'grid'
                    ? 'bg-[#2A1812] text-white shadow-xs'
                    : 'text-[#7A6359] hover:text-[#2A1812]'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewLayout('table')}
                className={`p-1.5 rounded-full transition-colors ${
                  viewLayout === 'table'
                    ? 'bg-[#2A1812] text-white shadow-xs'
                    : 'text-[#7A6359] hover:text-[#2A1812]'
                }`}
                title="Table List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={onOpenCreateTask}
                className="bg-[#FF5601] hover:bg-[#E04800] text-white text-xs font-black px-4 py-2 rounded-full shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E8D0B7]/60">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#7A6359] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deliverables..."
              className="w-full bg-[#FDF7F0] border border-[#E8D0B7] rounded-full pl-9 pr-3 py-1.5 text-xs text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
            />
          </div>

          {/* Team Filter */}
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="bg-[#FDF7F0] border border-[#E8D0B7] rounded-full px-3 py-1.5 text-xs font-bold text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
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
            className="bg-[#FDF7F0] border border-[#E8D0B7] rounded-full px-3 py-1.5 text-xs font-bold text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
          >
            <option value="all">All Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted for Review</option>
            <option value="revision_required">Revision Required</option>
            <option value="approved">Approved</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-[#FDF7F0] border border-[#E8D0B7] rounded-full px-3 py-1.5 text-xs font-bold text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task Output Display */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white border border-[#E8D0B7] rounded-3xl p-12 text-center text-[#7A6359] shadow-warm-sm">
          <CheckCircle2 className="w-8 h-8 opacity-40 mx-auto mb-2" />
          <p className="text-xs font-bold text-[#2A1812]">No matching tasks found</p>
          <p className="text-[11px] mt-0.5">Try clearing filters or search queries.</p>
        </div>
      ) : viewLayout === 'grid' ? (
        /* Grid / Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const isOverdue = task.deadline < nowStr && task.overall_status !== 'approved';

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className="bg-[#FFFFFF] border border-[#E8D0B7] hover:border-[#D4B89B] rounded-3xl p-5 shadow-warm-sm hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: task.team?.badge_bg || '#FAE6CE',
                        color: task.team?.badge_text || '#2A1812',
                      }}
                    >
                      {task.team?.name}
                    </span>
                    {getPriorityBadge(task.priority)}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#2A1812] group-hover:text-[#FF5601] transition-colors line-clamp-2">
                      {task.title}
                    </h3>
                    <p className="text-xs text-[#7A6359] mt-1 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E8D0B7]/60 flex items-center justify-between">
                  {/* Assignees stack */}
                  <div className="flex -space-x-1.5">
                    {task.assignments.map((asg) => (
                      <img
                        key={asg.id}
                        src={asg.user?.avatar_url}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover border-2 border-white ring-1 ring-[#E8D0B7]"
                        title={asg.user?.full_name}
                      />
                    ))}
                  </div>

                  {/* Status & Deadline */}
                  <div className="text-right">
                    <span className="text-[11px] font-extrabold text-[#FF5601] block">
                      {task.deadline}
                    </span>
                    <div className="mt-0.5">
                      {getStatusBadge(task.overall_status, isOverdue)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table / List View */
        <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl overflow-hidden shadow-warm-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAE6CE]/40 border-b border-[#E8D0B7] text-[#4A352D] font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Task Deliverable</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assignees</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D0B7]/60">
                {filteredTasks.map((task) => {
                  const isOverdue = task.deadline < nowStr && task.overall_status !== 'approved';

                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task.id)}
                      className="hover:bg-[#FAF1E6]/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-extrabold text-[#2A1812] max-w-xs truncate">
                        {task.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: task.team?.badge_bg || '#FAE6CE',
                            color: task.team?.badge_text || '#2A1812',
                          }}
                        >
                          {task.team?.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getPriorityBadge(task.priority)}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex -space-x-1.5">
                          {task.assignments.map((asg) => (
                            <img
                              key={asg.id}
                              src={asg.user?.avatar_url}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover border border-white"
                              title={asg.user?.full_name}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#FF5601]">{task.deadline}</td>
                      <td className="py-3.5 px-4 text-right">
                        {getStatusBadge(task.overall_status, isOverdue)}
                      </td>
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
