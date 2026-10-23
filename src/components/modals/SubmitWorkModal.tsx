import React, { useState } from 'react';
import {
  X,
  Send,
  Link,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SubmitWorkModalProps {
  assignmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitWorkModal: React.FC<SubmitWorkModalProps> = ({
  assignmentId,
  isOpen,
  onClose,
}) => {
  const { tasks, submitWork } = useApp();

  const [url, setUrl] = useState('');
  const [comments, setComments] = useState('');
  const [supportingLinks, setSupportingLinks] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !assignmentId) return null;

  // Find task title
  const currentTask = tasks.find((t) => t.assignments.some((a) => a.id === assignmentId));
  const currentAssignment = currentTask?.assignments.find((a) => a.id === assignmentId);
  const versionNum = (currentAssignment?.submissions?.length || 0) + 1;

  const handleAddLink = () => {
    setSupportingLinks([...supportingLinks, '']);
  };

  const handleUpdateLink = (index: number, val: string) => {
    const updated = [...supportingLinks];
    updated[index] = val;
    setSupportingLinks(updated);
  };

  const handleRemoveLink = (index: number) => {
    setSupportingLinks(supportingLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a valid deliverable URL.');
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URL must start with http:// or https://');
      return;
    }

    setIsSubmitting(true);
    const cleanSupporting = supportingLinks.map((s) => s.trim()).filter(Boolean);

    const success = await submitWork({
      task_assignment_id: assignmentId,
      submission_url: url.trim(),
      comments: comments.trim(),
      supporting_links: cleanSupporting,
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    } else {
      setError('Failed to submit work. Please try again.');
    }
  };

  // Quick helper buttons for testing
  const setQuickUrl = (preset: string) => {
    setUrl(preset);
    setError('');
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
            <div className="w-9 h-9 rounded-full bg-[#FF5601] flex items-center justify-center text-white shadow-sm">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#2A1812] text-base">
                Submit Deliverable ({versionNum > 1 ? `Version v${versionNum}` : 'Version v1'})
              </h3>
              <p className="text-xs text-[#7A6359] truncate max-w-xs">
                {currentTask?.title}
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Deliverable URL */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
              Work / Deliverable URL *
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder="https://figma.com/..., https://notion.so/..., etc."
              className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl px-3.5 py-2.5 text-xs text-[#2A1812] placeholder-[#7A6359] focus:outline-none focus:border-[#FF5601] font-semibold"
            />
          </div>

          {/* Submission Notes & Comments */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
              Submission Notes & Comments
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Describe what was accomplished, what changes were made, or specific review requests..."
              className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl px-3.5 py-2 text-xs text-[#2A1812] placeholder-[#7A6359] focus:outline-none focus:border-[#FF5601]"
            />
          </div>

          {/* Supporting Links */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#2A1812]">
                Additional Supporting Assets (Optional)
              </label>
              <button
                type="button"
                onClick={handleAddLink}
                className="text-xs font-bold text-[#FF5601] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>
            {supportingLinks.length > 0 && (
              <div className="space-y-1.5">
                {supportingLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handleUpdateLink(i, e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="flex-1 bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-xl px-3 py-1.5 text-xs text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(i)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              className="px-6 py-2 rounded-full text-xs font-black text-white bg-[#FF5601] hover:bg-[#E04800] shadow-[0_4px_14px_-2px_rgba(255,86,1,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Work for Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
