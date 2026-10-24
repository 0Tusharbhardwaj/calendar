import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReviewDecision } from '../../types';

interface ReviewModalProps {
  submissionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  submissionId,
  isOpen,
  onClose,
}) => {
  const { tasks, currentUser, reviewSubmission } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const [decision, setDecision] = useState<ReviewDecision>('approved');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !submissionId) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1812]/50 backdrop-blur-xs animate-fadeIn">
        <div className="w-full max-w-sm bg-[#FFFBF7] rounded-3xl border border-[#E8D0B7] shadow-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h3 className="font-black text-base text-[#2A1812]">Administrator Approval Required</h3>
          <p className="text-xs text-[#7A6359] leading-relaxed">
            Only workspace administrators (Tushar Bhardwaj & Bhoomika Chawla) have authority to grant official approval or request revisions on work deliverables.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#2A1812] text-white text-xs font-bold hover:bg-[#FF5601] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Find corresponding task, assignment, and submission
  let foundTask = null;
  let foundAssignment = null;
  let foundSubmission = null;

  for (const t of tasks) {
    for (const a of t.assignments) {
      const sub = a.submissions?.find((s) => s.id === submissionId);
      if (sub) {
        foundTask = t;
        foundAssignment = a;
        foundSubmission = sub;
        break;
      }
    }
  }

  if (!foundSubmission || !foundAssignment || !foundTask) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      setError('Unauthorized: Only administrators can approve or review submissions.');
      return;
    }

    if ((decision === 'changes_requested' || decision === 'rejected') && !feedback.trim()) {
      setError('An explanation is mandatory when requesting changes or rejecting work.');
      return;
    }

    setIsSubmitting(true);
    const finalFeedback = feedback.trim() || 'Work deliverable approved. Great job!';

    const success = await reviewSubmission({
      submission_id: submissionId,
      decision,
      feedback: finalFeedback,
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    } else {
      setError('Failed to record review decision.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1812]/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-lg bg-[#FFFBF7] rounded-3xl border border-[#E8D0B7] shadow-2xl overflow-hidden flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E8D0B7] flex items-center justify-between bg-[#FAE6CE]/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-[#2A1812] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4 text-[#F9CC61]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#2A1812] text-base">Review Work Deliverable</h3>
              <p className="text-xs text-[#7A6359] truncate max-w-xs">
                {foundTask.title} (v{foundSubmission.version_number})
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submitter & URL preview */}
          <div className="p-3.5 rounded-2xl bg-[#FAE6CE]/30 border border-[#E8D0B7] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <img
                  src={foundAssignment.user?.avatar_url}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="font-bold text-[#2A1812]">
                  {foundAssignment.user?.full_name}
                </span>
                <span className="text-[#7A6359]">
                  (@{foundAssignment.user?.username})
                </span>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#2A1812] text-white">
                Version v{foundSubmission.version_number}
              </span>
            </div>

            <div>
              <a
                href={foundSubmission.submission_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A63500] hover:text-[#FF5601] hover:underline bg-white px-2.5 py-1 rounded-lg border border-[#E8D0B7]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="truncate max-w-xs">{foundSubmission.submission_url}</span>
              </a>
            </div>

            {foundSubmission.comments && (
              <p className="text-xs text-[#4A352D] italic bg-white/60 p-2 rounded-lg">
                "{foundSubmission.comments}"
              </p>
            )}
          </div>

          {/* Decision Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
              Review Decision *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setDecision('approved');
                  setError('');
                }}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  decision === 'approved'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30'
                    : 'border-[#E8D0B7] bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 text-[#4A352D]'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <p className="font-extrabold text-xs">Approve</p>
                <p className="text-[10px] text-[#7A6359]">Mark complete</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDecision('changes_requested');
                  setError('');
                }}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  decision === 'changes_requested'
                    ? 'border-[#FE75B9] bg-[#FE75B9]/15 text-[#A91F62] ring-2 ring-[#FE75B9]/30'
                    : 'border-[#E8D0B7] bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 text-[#4A352D]'
                }`}
              >
                <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-[#FE75B9]" />
                <p className="font-extrabold text-xs">Request Changes</p>
                <p className="text-[10px] text-[#7A6359]">Need revisions</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDecision('rejected');
                  setError('');
                }}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  decision === 'rejected'
                    ? 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-500/30'
                    : 'border-[#E8D0B7] bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 text-[#4A352D]'
                }`}
              >
                <XCircle className="w-5 h-5 mx-auto mb-1 text-red-600" />
                <p className="font-extrabold text-xs">Reject</p>
                <p className="text-[10px] text-[#7A6359]">Restart task</p>
              </button>
            </div>
          </div>

          {/* Feedback Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#2A1812]">
                Feedback & Instructions {decision !== 'approved' && '*'}
              </label>
              {decision === 'approved' && (
                <span className="text-[10px] text-[#7A6359]">(Optional for approval)</span>
              )}
            </div>
            <textarea
              rows={3}
              required={decision !== 'approved'}
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                setError('');
              }}
              placeholder={
                decision === 'approved'
                  ? 'Great work! Ready for distribution.'
                  : 'Please specify the exact revisions required...'
              }
              className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl px-3.5 py-2 text-xs text-[#2A1812] placeholder-[#7A6359] focus:outline-none focus:border-[#2A1812]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E8D0B7] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#4A352D] hover:bg-[#FAE6CE]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-full text-xs font-black text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${
                decision === 'approved'
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : decision === 'changes_requested'
                  ? 'bg-[#FE75B9] text-[#2A1812] hover:bg-[#FD5DAE]'
                  : 'bg-red-700 hover:bg-red-800'
              }`}
            >
              {isSubmitting
                ? 'Recording...'
                : decision === 'approved'
                ? 'Approve & Mark Complete'
                : decision === 'changes_requested'
                ? 'Request Changes'
                : 'Reject Deliverable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
