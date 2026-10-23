import React from 'react';
import {
  ClipboardList,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlayCircle,
  FileCheck,
  Send,
  Plus,
  Users,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../Navigation';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCreateTask: () => void;
  onOpenCreateEvent: () => void;
  onSelectTask: (taskId: string) => void;
  onOpenReview: (submissionId: string) => void;
  onOpenSubmit: (assignmentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenCreateTask,
  onOpenCreateEvent,
  onSelectTask,
  onOpenReview,
  onOpenSubmit,
}) => {
  const { currentUser, tasks, teams, users, activityLogs } = useApp();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const nowStr = new Date().toISOString().split('T')[0];

  // 1. Calculate Real Admin Metrics
  const totalTasksCount = tasks.length;
  const inProgressCount = tasks.filter((t) => t.overall_status === 'in_progress').length;
  const awaitingReviewCount = tasks.flatMap((t) => t.assignments).filter((a) => a.status === 'submitted' || a.status === 'resubmitted').length;
  const approvedCount = tasks.filter((t) => t.overall_status === 'approved').length;
  const overdueCount = tasks.filter((t) => t.deadline < nowStr && t.overall_status !== 'approved').length;

  // Pending Submissions Queue
  const pendingSubmissions: {
    task: any;
    assignment: any;
    submission: any;
  }[] = [];

  tasks.forEach((t) => {
    t.assignments.forEach((a) => {
      if ((a.status === 'submitted' || a.status === 'resubmitted') && a.submissions && a.submissions.length > 0) {
        pendingSubmissions.push({
          task: t,
          assignment: a,
          submission: a.submissions[0],
        });
      }
    });
  });

  // Upcoming Deadlines (next 7 days, not approved)
  const upcomingDeadlines = tasks
    .filter((t) => t.overall_status !== 'approved')
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 5);

  // 2. Calculate Member Metrics
  const myAssignments = tasks
    .flatMap((t) =>
      t.assignments
        .filter((a) => a.user_id === currentUser?.id)
        .map((a) => ({ task: t, assignment: a }))
    );

  const myTotalAssigned = myAssignments.length;
  const myInProgress = myAssignments.filter((m) => m.assignment.status === 'in_progress').length;
  const myDueToday = myAssignments.filter((m) => m.task.deadline === nowStr && m.assignment.status !== 'approved').length;
  const myAwaitingReview = myAssignments.filter((m) => m.assignment.status === 'submitted' || m.assignment.status === 'resubmitted').length;
  const myRevisionsRequired = myAssignments.filter((m) => m.assignment.status === 'revision_required');
  const myApproved = myAssignments.filter((m) => m.assignment.status === 'approved').length;

  const myPriorityTasks = [...myAssignments]
    .filter((m) => m.assignment.status !== 'approved')
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.task.priority] - priorityOrder[a.task.priority];
    });

  // Render Admin Dashboard
  if (isAdmin) {
    return (
      <div className="space-y-6">
        {/* Top Banner & Quick Shortcuts */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#FAE6CE] via-[#FFF1E4] to-[#FDF7F0] p-6 rounded-3xl border border-[#E8D0B7] shadow-xs">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#FF5601] flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Operational Command Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A1812] tracking-tight">
              Welcome back, {currentUser.full_name.split(' ')[0]}
            </h1>
            <p className="text-xs text-[#7A6359] mt-0.5">
              Here is your centralized studio production cadence and content pipeline status for today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenCreateTask}
              className="bg-[#FF5601] hover:bg-[#E04800] text-white text-xs font-black px-4 py-2.5 rounded-full shadow-[0_4px_14px_-2px_rgba(255,86,1,0.4)] flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
            <button
              onClick={onOpenCreateEvent}
              className="bg-[#FAE6CE] hover:bg-[#F5DCBD] border border-[#E8D0B7] text-[#2A1812] text-xs font-bold px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5"
            >
              <CalendarIcon className="w-4 h-4 text-[#FC9631]" />
              <span>Schedule Event</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className="bg-white hover:bg-[#FAF1E6] border border-[#E8D0B7] text-[#4A352D] text-xs font-bold px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5"
            >
              <span>Open Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 5 Real-Time Operational KPI Cards */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {/* Total Tasks */}
          <div
            onClick={() => setActiveTab('tasks')}
            className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-2xl p-4 shadow-warm-sm hover:-translate-y-0.5 hover:border-[#D4B89B] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[#7A6359] mb-1.5">
              <span className="text-xs font-bold">Total Tasks</span>
              <span className="text-[#A63500] font-black text-xs">All</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-black text-[#2A1812]">
                {totalTasksCount}
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[#7A6359] mt-1">Full production backlog</p>
          </div>

          {/* In Progress */}
          <div
            onClick={() => setActiveTab('tasks')}
            className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-2xl p-4 shadow-warm-sm hover:-translate-y-0.5 hover:border-[#D4B89B] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#7A6359] mb-1.5">
              <span className="text-xs font-bold">In Progress</span>
              <PlayCircle className="w-4 h-4 text-[#FC9631]" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-black text-[#2A1812]">
                {inProgressCount}
              </span>
              <span className="text-[10px] font-bold text-[#B85B00] bg-[#FC9631]/20 px-1.5 py-0.5 rounded-full">
                Producing
              </span>
            </div>
            <p className="text-[11px] text-[#7A6359] mt-1">Live in member sprints</p>
          </div>

          {/* Awaiting Review */}
          <div
            onClick={() => setActiveTab('approvals')}
            className="bg-[#FFF9F2] border border-[#FE75B9]/60 rounded-2xl p-4 shadow-warm-sm hover:-translate-y-0.5 hover:border-[#FE75B9] transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-14 h-14 bg-[#FE75B9]/20 rounded-full blur-md" />
            <div className="flex items-center justify-between text-[#7A6359] mb-1.5">
              <span className="text-xs font-bold text-[#A91F62]">Awaiting Review</span>
              <FileCheck className="w-4 h-4 text-[#FE75B9]" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-black text-[#2A1812]">
                {awaitingReviewCount}
              </span>
              {awaitingReviewCount > 0 && (
                <span className="text-[10px] font-black text-[#A91F62] bg-[#FE75B9]/30 px-1.5 py-0.5 rounded-full animate-pulse">
                  Action Needed
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#7A6359] mt-1">Pending sign-off</p>
          </div>

          {/* Approved */}
          <div
            onClick={() => setActiveTab('tasks')}
            className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-2xl p-4 shadow-warm-sm hover:-translate-y-0.5 hover:border-[#D4B89B] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#7A6359] mb-1.5">
              <span className="text-xs font-bold">Approved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-black text-[#2A1812]">
                {approvedCount}
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                Ready
              </span>
            </div>
            <p className="text-[11px] text-[#7A6359] mt-1">Ready for publishing</p>
          </div>

          {/* Overdue */}
          <div
            onClick={() => setActiveTab('tasks')}
            className="col-span-2 md:col-span-1 bg-[#FFF5F5] border border-red-200 rounded-2xl p-4 shadow-warm-sm hover:-translate-y-0.5 hover:border-red-400 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#7A6359] mb-1.5">
              <span className="text-xs font-bold text-red-800">Overdue</span>
              <Clock className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-black text-red-700">
                {overdueCount}
              </span>
              {overdueCount > 0 && (
                <span className="text-[10px] font-black text-[#473229] bg-[#F9CC61] px-1.5 py-0.5 rounded-full">
                  Follow up
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#7A6359] mt-1">Past deadline date</p>
          </div>
        </section>

        {/* Main Grid: Pending Approvals Queue & Team Workload */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Submissions Awaiting Review & Upcoming Deadlines (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pending Approvals Tray */}
            <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-5 shadow-warm-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8D0B7]/60">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#FE75B9]/20 flex items-center justify-center text-[#A91F62]">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#2A1812] text-sm">
                      Submissions Awaiting Review
                    </h3>
                    <p className="text-[11px] text-[#7A6359]">
                      Direct administrative signoff queue
                    </p>
                  </div>
                </div>

                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#FE75B9]/20 text-[#A91F62]">
                  {pendingSubmissions.length} Pending
                </span>
              </div>

              {pendingSubmissions.length === 0 ? (
                <div className="py-8 text-center text-[#7A6359]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-[#2A1812]">No pending submissions!</p>
                  <p className="text-[11px]">All deliverables are reviewed and up to date.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E8D0B7]/60 space-y-3">
                  {pendingSubmissions.map(({ task, assignment, submission }) => (
                    <div key={submission.id} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4
                            onClick={() => onSelectTask(task.id)}
                            className="font-extrabold text-xs text-[#2A1812] hover:text-[#FF5601] transition-colors cursor-pointer"
                          >
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-[#7A6359] flex items-center gap-1.5 mt-0.5">
                            <span
                              className="font-bold text-[10px] px-1.5 py-0.2 rounded"
                              style={{
                                backgroundColor: task.team?.badge_bg || '#FAE6CE',
                                color: task.team?.badge_text || '#2A1812',
                              }}
                            >
                              {task.team?.name}
                            </span>
                            <span>•</span>
                            <span>by {assignment.user?.full_name}</span>
                            <span>•</span>
                            <span className="font-bold">v{submission.version_number}</span>
                          </p>
                        </div>

                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#F9CC61]/30 text-[#7A5200]">
                          Needs Review
                        </span>
                      </div>

                      {/* Work URL Link */}
                      <a
                        href={submission.submission_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A63500] hover:underline bg-[#FAE6CE]/30 px-2.5 py-1 rounded-lg border border-[#E8D0B7]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="truncate max-w-xs">{submission.submission_url}</span>
                      </a>

                      {/* Quick Review Action */}
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => onOpenReview(submission.id)}
                          className="flex-1 bg-[#2A1812] hover:bg-[#FF5601] text-white py-1.5 px-3 rounded-full text-xs font-bold transition-all shadow-xs text-center flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve / Review</span>
                        </button>
                        <button
                          onClick={() => onSelectTask(task.id)}
                          className="bg-[#FAE6CE]/60 hover:bg-[#FAE6CE] text-[#2A1812] py-1.5 px-3 rounded-full text-xs font-bold transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-5 shadow-warm-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8D0B7]/60">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#FF5601]" />
                  <h3 className="font-extrabold text-[#2A1812] text-sm">Upcoming Deadlines</h3>
                </div>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="text-xs font-bold text-[#FF5601] hover:underline flex items-center gap-1"
                >
                  <span>Full Schedule</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {upcomingDeadlines.length === 0 ? (
                  <div className="py-8 text-center text-[#7A6359]">
                    <Clock className="w-7 h-7 opacity-30 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-[#2A1812]">No upcoming deadlines</p>
                    <p className="text-[11px] mt-0.5">Your schedule is currently clear. Click "New Task" to begin.</p>
                  </div>
                ) : (
                  upcomingDeadlines.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task.id)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/50 border border-[#E8D0B7]/70 cursor-pointer transition-all"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: task.team?.color || '#FF5601' }}
                        />
                        <div className="truncate">
                          <h4 className="text-xs font-extrabold text-[#2A1812] truncate">
                            {task.title}
                          </h4>
                          <span className="text-[10px] text-[#7A6359]">
                            {task.team?.name} • {task.assignments.length} assigned
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 ml-2">
                        <span className="text-xs font-black text-[#FF5601] block">
                          {task.deadline}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-[#7A6359]">
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Team Workload Capacity & Recent Activity Feed (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Team Workload */}
            <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-5 shadow-warm-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8D0B7]/60">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#FC9631]" />
                  <h3 className="font-extrabold text-[#2A1812] text-sm">Team Workload Capacity</h3>
                </div>
                <button
                  onClick={() => setActiveTab('teams')}
                  className="text-xs font-bold text-[#FC9631] hover:underline"
                >
                  Manage
                </button>
              </div>

              <div className="space-y-4">
                {teams.map((team) => {
                  const teamMembers = users.filter((u) => u.team_id === team.id && u.is_active);
                  const teamTasks = tasks.filter((t) => t.team_id === team.id);
                  const activeTeamTasks = teamTasks.filter((t) => t.overall_status !== 'approved');
                  // Rough capacity estimate based on active tasks vs members
                  const capacityPct = Math.min(
                    100,
                    Math.round((activeTeamTasks.length / Math.max(teamMembers.length * 4, 1)) * 100)
                  );

                  return (
                    <div key={team.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="font-extrabold text-[#2A1812]">{team.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[11px]">
                          <span className="text-[#7A6359]">{activeTeamTasks.length} active tasks</span>
                          <span className="font-bold text-[#2A1812]">{capacityPct}%</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#FAE6CE]/40 h-2.5 rounded-full overflow-hidden border border-[#E8D0B7]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${capacityPct}%`,
                            backgroundColor: team.color,
                          }}
                        />
                      </div>

                      {/* Members Avatars */}
                      <div className="flex items-center justify-between text-[10px] text-[#7A6359] pt-0.5">
                        <span>{teamMembers.length} members</span>
                        <div className="flex -space-x-1.5">
                          {teamMembers.slice(0, 4).map((m) => (
                            <img
                              key={m.id}
                              src={m.avatar_url}
                              alt=""
                              className="w-4 h-4 rounded-full object-cover border border-white"
                              title={m.full_name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity Audit Feed */}
            <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-5 shadow-warm-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8D0B7]/60">
                <h3 className="font-extrabold text-[#2A1812] text-sm">Recent Operational Activity</h3>
                <button
                  onClick={() => setActiveTab('activity')}
                  className="text-xs font-bold text-[#FF5601] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {activityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 text-xs">
                    {log.actor_avatar ? (
                      <img
                        src={log.actor_avatar}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#FAE6CE] text-[#2A1812] flex items-center justify-center font-bold text-[10px]">
                        {log.actor_name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#2A1812] leading-snug">
                        <strong className="font-bold">{log.actor_name}</strong> {log.action}
                      </p>
                      <span className="text-[10px] text-[#7A6359]">
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Personalized Member Dashboard
  return (
    <div className="space-y-6">
      {/* 1. "What do I need to do?" Welcome Hero */}
      <div className="bg-gradient-to-r from-[#FAE6CE] via-[#FFF1E4] to-[#FDF7F0] p-6 rounded-3xl border border-[#E8D0B7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser.avatar_url}
            alt=""
            className="w-16 h-16 rounded-full object-cover ring-4 ring-[#E8D0B7] shadow-sm"
          />
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#FF5601]">
              Personal Workspace
            </span>
            <h1 className="text-2xl font-black text-[#2A1812]">
              Hey, {currentUser.full_name} 👋
            </h1>
            <p className="text-xs text-[#7A6359]">
              {currentUser.designation} • {teams.find((t) => t.id === currentUser.team_id)?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className="bg-[#FF5601] hover:bg-[#E04800] text-white text-xs font-black px-5 py-2.5 rounded-full shadow-[0_4px_14px_-2px_rgba(255,86,1,0.4)] transition-all flex items-center gap-1.5"
          >
            <span>My Tasks ({myAssignments.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className="bg-[#FAE6CE] hover:bg-[#F5DCBD] border border-[#E8D0B7] text-[#2A1812] text-xs font-bold px-4 py-2.5 rounded-full transition-all"
          >
            View Calendar
          </button>
        </div>
      </div>

      {/* 2. Member Task Summary Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-2xl p-3.5 shadow-warm-sm">
          <span className="text-[11px] font-bold text-[#7A6359] block mb-1">Total Assigned</span>
          <span className="text-2xl font-black text-[#2A1812]">{myTotalAssigned}</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-2xl p-3.5 shadow-warm-sm">
          <span className="text-[11px] font-bold text-[#B85B00] block mb-1">In Progress</span>
          <span className="text-2xl font-black text-[#2A1812]">{myInProgress}</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-2xl p-3.5 shadow-warm-sm">
          <span className="text-[11px] font-bold text-red-700 block mb-1">Due Today</span>
          <span className="text-2xl font-black text-red-700">{myDueToday}</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-2xl p-3.5 shadow-warm-sm">
          <span className="text-[11px] font-bold text-[#7A5200] block mb-1">Awaiting Review</span>
          <span className="text-2xl font-black text-[#2A1812]">{myAwaitingReview}</span>
        </div>
        <div className="bg-[#FFF5F8] border border-[#FE75B9]/60 rounded-2xl p-3.5 shadow-warm-sm">
          <span className="text-[11px] font-black text-[#A91F62] block mb-1">Revision Required</span>
          <span className="text-2xl font-black text-[#A91F62]">{myRevisionsRequired.length}</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-2xl p-3.5 shadow-warm-sm">
          <span className="text-[11px] font-bold text-emerald-700 block mb-1">Approved</span>
          <span className="text-2xl font-black text-emerald-800">{myApproved}</span>
        </div>
      </section>

      {/* 3. Needs Attention Section (Revision Required) */}
      {myRevisionsRequired.length > 0 && (
        <div className="bg-[#FFF5F8] border-2 border-[#FE75B9]/80 rounded-3xl p-5 shadow-warm-md space-y-3">
          <div className="flex items-center space-x-2 text-[#A91F62]">
            <AlertTriangle className="w-5 h-5 text-[#FE75B9]" />
            <h3 className="font-black text-base">Needs Attention — Revision Requested</h3>
          </div>
          <p className="text-xs text-[#7A6359]">
            The following deliverable(s) need modifications per administrative review. Please update and resubmit.
          </p>

          <div className="space-y-3">
            {myRevisionsRequired.map(({ task, assignment }) => {
              const latestSub = assignment.submissions?.[0];
              const latestReview = latestSub?.reviews?.[0];

              return (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-2xl border border-[#FE75B9]/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-[#2A1812]">{task.title}</h4>
                    {latestReview && (
                      <p className="text-xs text-[#A91F62] italic bg-[#FE75B9]/10 p-2 rounded-xl">
                        Feedback: "{latestReview.feedback}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onOpenSubmit(assignment.id)}
                      className="bg-[#FF5601] hover:bg-[#E04800] text-white text-xs font-black px-4 py-2 rounded-full shadow-sm flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Resubmit Work URL</span>
                    </button>
                    <button
                      onClick={() => onSelectTask(task.id)}
                      className="bg-[#FAE6CE]/60 hover:bg-[#FAE6CE] text-[#2A1812] text-xs font-bold px-3 py-2 rounded-full"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. My Priority Tasks */}
      <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-5 shadow-warm-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8D0B7]/60">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#FF5601]" />
            <h3 className="font-extrabold text-[#2A1812] text-sm">My Active Tasks</h3>
          </div>
          <span className="text-xs font-bold text-[#7A6359]">
            {myPriorityTasks.length} active assignments
          </span>
        </div>

        {myPriorityTasks.length === 0 ? (
          <div className="py-8 text-center text-[#7A6359]">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-[#2A1812]">You are all clear!</p>
            <p className="text-[11px]">No pending tasks assigned right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myPriorityTasks.map(({ task, assignment }) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 border border-[#E8D0B7] transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
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
                    <span className="text-[10px] font-black uppercase text-[#FF5601]">
                      {task.priority} Priority
                    </span>
                  </div>
                  <h4
                    onClick={() => onSelectTask(task.id)}
                    className="font-extrabold text-sm text-[#2A1812] hover:text-[#FF5601] transition-colors cursor-pointer"
                  >
                    {task.title}
                  </h4>
                  <p className="text-xs text-[#7A6359] line-clamp-1">
                    {task.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="text-right mr-2">
                    <span className="text-xs font-bold text-[#2A1812] block">
                      Due: {task.deadline}
                    </span>
                    <span className="text-[10px] text-[#7A6359] capitalize">
                      Status: {assignment.status.replace('_', ' ')}
                    </span>
                  </div>

                  {(assignment.status === 'in_progress' || assignment.status === 'assigned') && (
                    <button
                      onClick={() => onOpenSubmit(assignment.id)}
                      className="bg-[#FF5601] hover:bg-[#E04800] text-white text-xs font-black px-4 py-2 rounded-full shadow-xs flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Work</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectTask(task.id)}
                    className="bg-white hover:bg-[#FAF1E6] border border-[#E8D0B7] text-[#2A1812] text-xs font-bold px-3 py-2 rounded-full"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
