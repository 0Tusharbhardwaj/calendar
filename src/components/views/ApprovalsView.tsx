import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Clock,
  Sparkles,
  FileCheck,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ApprovalsViewProps {
  onSelectTask: (taskId: string) => void;
  onOpenReview: (submissionId: string) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  onSelectTask,
  onOpenReview,
}) => {
  const { tasks, currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  if (!isAdmin) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-12 text-center shadow-warm-sm max-w-xl mx-auto my-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FF5601]/10 text-[#FF5601] flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-[#2A1812]">
            Administrator Approval Required
          </h2>
          <p className="text-xs text-[#7A6359] max-w-md mx-auto leading-relaxed">
            Reviewing and approving submitted deliverables is strictly reserved for Workspace Administrators (Tushar Bhardwaj & Bhoomika Chawla). As a team specialist, please track your assigned tasks and submit your work URLs from your personal workspace.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => onSelectTask('')}
            className="px-5 py-2.5 rounded-full text-xs font-black bg-[#2A1812] text-white hover:bg-[#FF5601] transition-all cursor-pointer"
          >
            Go to My Tasks
          </button>
        </div>
      </div>
    );
  }

  // Extract all submissions that require review: status is 'submitted' or 'resubmitted'
  const pendingItems: {
    task: any;
    assignment: any;
    submission: any;
  }[] = [];

  // Also collect reviewed archive
  const reviewedItems: {
    task: any;
    assignment: any;
    submission: any;
    review: any;
  }[] = [];

  tasks.forEach((t) => {
    t.assignments.forEach((a) => {
      a.submissions?.forEach((s) => {
        if (s.reviews && s.reviews.length > 0) {
          reviewedItems.push({
            task: t,
            assignment: a,
            submission: s,
            review: s.reviews[0],
          });
        } else if (a.status === 'submitted' || a.status === 'resubmitted') {
          pendingItems.push({
            task: t,
            assignment: a,
            submission: s,
          });
        }
      });
    });
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-6 shadow-warm-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#A91F62] bg-[#FE75B9]/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
            Sign-Off Command
          </span>
          <h2 className="text-xl font-black text-[#2A1812]">
            Submission Approvals & Deliverable Reviews
          </h2>
          <p className="text-xs text-[#7A6359] mt-0.5">
            Evaluate submitted work URLs, give structured feedback, or grant official approval
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-[#FE75B9] text-[#2A1812] shadow-xs">
            {pendingItems.length} Awaiting Review
          </span>
        </div>
      </div>

      {/* Active Pending Queue */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#7A6359] px-1">
          Awaiting Action ({pendingItems.length})
        </h3>

        {pendingItems.length === 0 ? (
          <div className="bg-white border border-[#E8D0B7] rounded-3xl p-12 text-center text-[#7A6359] shadow-warm-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-extrabold text-[#2A1812]">All Caught Up!</h4>
            <p className="text-xs mt-1">
              There are no pending submissions awaiting administrative approval.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingItems.map(({ task, assignment, submission }) => (
              <div
                key={submission.id}
                className="bg-[#FFFFFF] border border-[#FE75B9]/60 hover:border-[#FE75B9] rounded-3xl p-5 shadow-warm-sm space-y-4 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: task.team?.badge_bg || '#FAE6CE',
                        color: task.team?.badge_text || '#2A1812',
                      }}
                    >
                      {task.team?.name}
                    </span>
                    <h4
                      onClick={() => onSelectTask(task.id)}
                      className="text-sm font-black text-[#2A1812] hover:text-[#FF5601] cursor-pointer mt-1"
                    >
                      {task.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#2A1812] text-white">
                    v{submission.version_number}
                  </span>
                </div>

                {/* Submitter Info */}
                <div className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#FAE6CE]/20 border border-[#E8D0B7]/60">
                  <img
                    src={assignment.user?.avatar_url}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-[#E8D0B7]"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-[#2A1812] block truncate">
                      {assignment.user?.full_name}
                    </span>
                    <span className="text-[10px] text-[#7A6359]">
                      Submitted {new Date(submission.submitted_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Deliverable URL */}
                <a
                  href={submission.submission_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFBF7] hover:bg-[#FAE6CE]/40 border border-[#E8D0B7] text-xs font-bold text-[#A63500] hover:text-[#FF5601] transition-all group"
                >
                  <span className="truncate pr-2">{submission.submission_url}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#7A6359] group-hover:text-[#FF5601]" />
                </a>

                {/* Comments */}
                {submission.comments && (
                  <p className="text-xs text-[#2A1812] italic bg-[#FAE6CE]/30 p-2.5 rounded-xl">
                    "{submission.comments}"
                  </p>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-[#E8D0B7]/60 flex items-center gap-2">
                  <button
                    onClick={() => onOpenReview(submission.id)}
                    className="flex-1 bg-[#2A1812] hover:bg-[#FF5601] text-white py-2 px-3 rounded-full text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Review Deliverable</span>
                  </button>
                  <button
                    onClick={() => onSelectTask(task.id)}
                    className="bg-[#FAE6CE]/60 hover:bg-[#FAE6CE] text-[#2A1812] py-2 px-3 rounded-full text-xs font-bold transition-colors"
                  >
                    Task Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review History Archive */}
      {reviewedItems.length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-6 shadow-warm-sm space-y-4">
          <div className="pb-3 border-b border-[#E8D0B7]/60">
            <h3 className="font-extrabold text-[#2A1812] text-sm">Recently Reviewed Deliverables</h3>
            <p className="text-[11px] text-[#7A6359]">Audit trail of prior review decisions</p>
          </div>

          <div className="divide-y divide-[#E8D0B7]/60 space-y-3">
            {reviewedItems.slice(0, 6).map(({ task, assignment, submission, review }) => (
              <div
                key={review.id}
                onClick={() => onSelectTask(task.id)}
                className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FAF1E6]/40 p-2 rounded-xl cursor-pointer transition-colors"
              >
                <div>
                  <h4 className="font-bold text-xs text-[#2A1812]">{task.title}</h4>
                  <p className="text-[11px] text-[#7A6359]">
                    Submitted by {assignment.user?.full_name} • Feedback: "{review.feedback}"
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      review.decision === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {review.decision.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-[#7A6359]">
                    {new Date(review.reviewed_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
