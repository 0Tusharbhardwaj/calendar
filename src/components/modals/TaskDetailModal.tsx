import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  FileCheck,
  Send,
  Trash2,
  Share2,
  Sparkles,
  MessageSquare,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskWithDetails, AssignmentStatus } from '../../types';

interface TaskDetailModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSubmit: (assignmentId: string) => void;
  onOpenReview: (submissionId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  isOpen,
  onClose,
  onOpenSubmit,
  onOpenReview,
}) => {
  const { tasks, currentUser, deleteTask, updateAssignmentStatus } = useApp();

  if (!isOpen || !taskId) return null;

  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  const isAdmin = currentUser?.role === 'admin';
  const myAssignment = task.assignments.find((a) => a.user_id === currentUser?.id);
  const nowStr = new Date().toISOString().split('T')[0];
  const isOverdue = task.deadline < nowStr && task.overall_status !== 'approved';

  const getStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        );
      case 'submitted':
      case 'resubmitted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F9CC61]/40 text-[#7A5200] border border-[#F9CC61]">
            <Clock className="w-3 h-3" />
            {status === 'resubmitted' ? 'Resubmitted' : 'Awaiting Review'}
          </span>
        );
      case 'revision_required':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FE75B9]/20 text-[#A91F62] border border-[#FE75B9]/50">
            <AlertTriangle className="w-3 h-3" />
            Revision Required
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FC9631]/20 text-[#B85B00] border border-[#FC9631]/40">
            <PlayCircle className="w-3 h-3" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAE6CE] text-[#4A352D] border border-[#E8D0B7]">
            Assigned
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: TaskWithDetails['priority']) => {
    const colors: Record<string, string> = {
      low: 'bg-[#FAE6CE] text-[#4A352D]',
      medium: 'bg-[#FC9631]/20 text-[#B85B00]',
      high: 'bg-[#FE75B9]/20 text-[#A91F62]',
      urgent: 'bg-[#FF5601]/20 text-[#A63500]',
    };
    return (
      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#E8D0B7] ${colors[priority]}`}>
        {priority} Priority
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1812]/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-[#FFFBF7] rounded-3xl border border-[#E8D0B7] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E8D0B7] flex items-start justify-between bg-[#FAE6CE]/40">
          <div className="space-y-1.5 flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: task.team?.badge_bg || '#FAE6CE',
                  color: task.team?.badge_text || '#2A1812',
                }}
              >
                {task.team?.name || 'General'}
              </span>
              {getPriorityBadge(task.priority)}
              {isOverdue && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                  ⚠️ Overdue
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-[#2A1812] leading-tight">
              {task.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-[#7A6359]">
              <span>Created by {task.creator?.full_name || 'Admin'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#FC9631]" />
                Start: {task.start_date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-bold text-[#FF5601]">
                <Clock className="w-3.5 h-3.5" />
                Deadline: {task.deadline}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7A6359] hover:bg-[#FAE6CE] hover:text-[#2A1812]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#7A6359] mb-1.5">
                Description & Deliverable
              </h4>
              <p className="text-sm text-[#2A1812] leading-relaxed whitespace-pre-wrap bg-[#FFFFFF] p-3.5 rounded-2xl border border-[#E8D0B7]/80">
                {task.description}
              </p>
            </div>
          )}

          {/* Internal Instructions */}
          {task.internal_instructions && (
            <div className="p-3.5 rounded-2xl bg-[#FAE6CE]/30 border border-[#E8D0B7]">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-[#A63500] mb-1">
                Internal Guidelines
              </h4>
              <p className="text-xs text-[#4A352D] leading-relaxed">
                {task.internal_instructions}
              </p>
            </div>
          )}

          {/* Reference URLs */}
          {task.reference_urls && task.reference_urls.length > 0 && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#7A6359] mb-2">
                Reference Assets & Documentation
              </h4>
              <div className="space-y-1.5">
                {task.reference_urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAE6CE]/40 border border-[#E8D0B7] text-xs font-bold text-[#A63500] hover:text-[#FF5601] transition-all group"
                  >
                    <span className="truncate pr-2">{url}</span>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-[#7A6359] group-hover:text-[#FF5601]" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Member Action Card (If logged in user is assigned) */}
          {myAssignment && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAE6CE] to-[#FFF1E4] border border-[#FC9631]/50 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#B85B00] block">
                    Your Assignment
                  </span>
                  <h4 className="text-sm font-extrabold text-[#2A1812]">
                    Status: {getStatusBadge(myAssignment.status)}
                  </h4>
                </div>

                <div className="flex items-center space-x-2">
                  {myAssignment.status === 'assigned' && (
                    <button
                      onClick={() => updateAssignmentStatus(myAssignment.id, 'in_progress')}
                      className="px-4 py-2 rounded-full text-xs font-bold bg-[#FC9631] text-white hover:bg-[#E57E1E] shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Start Working</span>
                    </button>
                  )}

                  {(myAssignment.status === 'in_progress' ||
                    myAssignment.status === 'revision_required') && (
                    <button
                      onClick={() => onOpenSubmit(myAssignment.id)}
                      className="px-5 py-2 rounded-full text-xs font-black bg-[#FF5601] text-white hover:bg-[#E04800] shadow-[0_4px_14px_-2px_rgba(255,86,1,0.4)] transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {myAssignment.status === 'revision_required' ? 'Resubmit Work URL' : 'Submit Work URL'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {myAssignment.status === 'revision_required' && (
                <div className="p-3 bg-white/80 rounded-xl border border-[#FE75B9]/60 text-xs text-[#A91F62]">
                  <strong>⚠️ Revision Requested:</strong> Please review the feedback below and submit an updated URL.
                </div>
              )}
            </div>
          )}

          {/* Member Assignments & Submissions Timeline */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#7A6359] mb-3">
              Assigned Team Members & Work Submissions ({task.assignments.length})
            </h4>

            <div className="space-y-4">
              {task.assignments.map((asg) => (
                <div
                  key={asg.id}
                  className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8D0B7] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#E8D0B7]/60 pb-2.5">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={asg.user?.avatar_url}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-[#E8D0B7]"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-[#2A1812] block">
                          {asg.user?.full_name || 'Member'}
                        </span>
                        <span className="text-[11px] text-[#7A6359]">
                          @{asg.user?.username} • {asg.user?.designation}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusBadge(asg.status)}
                    </div>
                  </div>

                  {/* Submission History */}
                  {asg.submissions && asg.submissions.length > 0 ? (
                    <div className="space-y-3 pl-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#7A6359] flex items-center gap-1">
                        <History className="w-3 h-3" />
                        Submission Version History ({asg.submissions.length})
                      </p>

                      {asg.submissions.map((sub) => {
                        const isLatest = sub.version_number === asg.submissions![0].version_number;
                        const isPendingReview = isLatest && (asg.status === 'submitted' || asg.status === 'resubmitted');

                        return (
                          <div
                            key={sub.id}
                            className={`p-3 rounded-xl border space-y-2 ${
                              isLatest
                                ? 'bg-[#FAE6CE]/30 border-[#FC9631]/40'
                                : 'bg-[#FAF1E6]/30 border-[#E8D0B7]/50 opacity-80'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#2A1812] text-white">
                                  v{sub.version_number}
                                </span>
                                <span className="text-[11px] text-[#7A6359]">
                                  Submitted {new Date(sub.submitted_at).toLocaleString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>

                              {/* Admin Review Action Button right inside submission */}
                              {isAdmin && isPendingReview && (
                                <button
                                  onClick={() => onOpenReview(sub.id)}
                                  className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#2A1812] text-white hover:bg-[#FF5601] shadow-xs transition-colors flex items-center gap-1"
                                >
                                  <FileCheck className="w-3.5 h-3.5" />
                                  <span>Review Deliverable</span>
                                </button>
                              )}
                            </div>

                            {/* Work URL Link */}
                            <div>
                              <a
                                href={sub.submission_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#A63500] hover:text-[#FF5601] hover:underline bg-white px-2.5 py-1 rounded-lg border border-[#E8D0B7]"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>{sub.submission_url}</span>
                              </a>
                            </div>

                            {/* Submitter comments */}
                            {sub.comments && (
                              <p className="text-xs text-[#2A1812] italic bg-white/70 p-2 rounded-lg border border-[#E8D0B7]/50">
                                "{sub.comments}"
                              </p>
                            )}

                            {/* Reviews history on this submission */}
                            {sub.reviews && sub.reviews.length > 0 && (
                              <div className="pt-2 border-t border-[#E8D0B7]/60 space-y-1.5">
                                {sub.reviews.map((rev) => (
                                  <div
                                    key={rev.id}
                                    className={`p-2.5 rounded-lg text-xs ${
                                      rev.decision === 'approved'
                                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                                        : 'bg-red-50 border border-red-200 text-red-900'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between font-bold mb-1">
                                      <span className="flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" />
                                        Review Decision: {rev.decision.replace('_', ' ').toUpperCase()}
                                      </span>
                                      <span className="text-[10px] opacity-75">
                                        {new Date(rev.reviewed_at).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </span>
                                    </div>
                                    <p className="leading-relaxed">{rev.feedback}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-[#7A6359] italic">
                      No work submitted yet for this assignment.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E8D0B7] bg-[#FAF1E6]/50 flex items-center justify-between">
          <div>
            {isAdmin && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    deleteTask(task.id);
                    onClose();
                  }
                }}
                className="text-xs font-bold text-red-700 hover:text-red-900 hover:bg-red-100/60 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-full text-xs font-bold bg-[#2A1812] text-white hover:bg-[#3F261E] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
