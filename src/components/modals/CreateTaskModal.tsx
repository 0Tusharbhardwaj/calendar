import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Users,
  User,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AssignmentType, TaskPriority } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  initialDate,
}) => {
  const { teams, users, createTask } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState(teams[0]?.id || 'team-writing');
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('individual');
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState(
    initialDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [referenceUrls, setReferenceUrls] = useState<string[]>(['']);
  const [internalInstructions, setInternalInstructions] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Active members sorted with team priority: members of currently selected team appear first!
  const sortedMembers = [...users]
    .filter((u) => u.is_active)
    .sort((a, b) => {
      const aInTeam = a.team_id === teamId ? -1 : 1;
      const bInTeam = b.team_id === teamId ? -1 : 1;
      return aInTeam - bInTeam;
    });

  const handleAddUrl = () => {
    setReferenceUrls([...referenceUrls, '']);
  };

  const handleUpdateUrl = (index: number, val: string) => {
    const updated = [...referenceUrls];
    updated[index] = val;
    setReferenceUrls(updated);
  };

  const handleRemoveUrl = (index: number) => {
    setReferenceUrls(referenceUrls.filter((_, i) => i !== index));
  };

  const handleToggleMember = (userId: string) => {
    if (assignmentType === 'individual') {
      setSelectedAssigneeIds([userId]);
    } else {
      if (selectedAssigneeIds.includes(userId)) {
        setSelectedAssigneeIds(selectedAssigneeIds.filter((id) => id !== userId));
      } else {
        setSelectedAssigneeIds([...selectedAssigneeIds, userId]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }
    if (assignmentType !== 'team' && selectedAssigneeIds.length === 0) {
      setError('Please select at least one assignee for this task.');
      return;
    }
    if (deadline < startDate) {
      setError('Deadline cannot be earlier than start date.');
      return;
    }

    const cleanUrls = referenceUrls.map((u) => u.trim()).filter(Boolean);

    await createTask({
      title: title.trim(),
      description: description.trim(),
      team_id: teamId,
      start_date: startDate,
      deadline,
      priority,
      assignment_type: assignmentType,
      assignee_ids: selectedAssigneeIds,
      reference_urls: cleanUrls,
      internal_instructions: internalInstructions.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1812]/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-[#FFFBF7] rounded-3xl border border-[#E8D0B7] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E8D0B7] flex items-center justify-between bg-[#FAE6CE]/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FF5601] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#2A1812] text-base">Create New Task</h3>
              <p className="text-xs text-[#7A6359]">Assign deliverable and track on calendar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7A6359] hover:bg-[#FAE6CE] hover:text-[#2A1812]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="e.g. Q4 Product Launch Video Reel"
              className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl px-3.5 py-2 text-sm text-[#2A1812] placeholder-[#7A6359] focus:outline-none focus:border-[#FF5601] focus:ring-2 focus:ring-[#FF5601]/20 transition-all font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
              Description & Objective
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline what needs to be created, key messages, target formats..."
              className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl px-3.5 py-2 text-xs text-[#2A1812] placeholder-[#7A6359] focus:outline-none focus:border-[#FF5601] focus:ring-2 focus:ring-[#FF5601]/20 transition-all leading-relaxed"
            />
          </div>

          {/* Team / Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Category / Team *
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-xl px-3 py-2 text-xs text-[#2A1812] font-bold focus:outline-none focus:border-[#FF5601]"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => {
                  const colors: Record<TaskPriority, string> = {
                    low: 'bg-[#FAE6CE] text-[#4A352D]',
                    medium: 'bg-[#FC9631]/20 text-[#B85B00]',
                    high: 'bg-[#FE75B9]/20 text-[#A91F62]',
                    urgent: 'bg-[#FF5601]/20 text-[#A63500]',
                  };
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider border transition-all ${
                        priority === p
                          ? 'border-[#2A1812] bg-[#2A1812] text-white shadow-xs'
                          : `border-[#E8D0B7] ${colors[p]} hover:border-[#2A1812]/50`
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dates: Start Date & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-xl px-3 py-2 text-xs text-[#2A1812] font-semibold focus:outline-none focus:border-[#FF5601]"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Deadline *
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-xl px-3 py-2 text-xs text-[#2A1812] font-semibold focus:outline-none focus:border-[#FF5601]"
              />
            </div>
          </div>

          {/* Assignment Mode */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
              Assignment Mode *
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setAssignmentType('individual');
                  setSelectedAssigneeIds(selectedAssigneeIds.slice(0, 1));
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  assignmentType === 'individual'
                    ? 'border-[#FF5601] bg-[#FF5601]/10 text-[#2A1812]'
                    : 'border-[#E8D0B7] bg-[#FAE6CE]/20 text-[#4A352D] hover:bg-[#FAE6CE]/40'
                }`}
              >
                <User className="w-4 h-4 mb-1 text-[#FF5601]" />
                <p className="font-bold text-xs">Individual</p>
                <p className="text-[10px] text-[#7A6359]">Single team member</p>
              </button>

              <button
                type="button"
                onClick={() => setAssignmentType('multiple')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  assignmentType === 'multiple'
                    ? 'border-[#FF5601] bg-[#FF5601]/10 text-[#2A1812]'
                    : 'border-[#E8D0B7] bg-[#FAE6CE]/20 text-[#4A352D] hover:bg-[#FAE6CE]/40'
                }`}
              >
                <Users className="w-4 h-4 mb-1 text-[#FE75B9]" />
                <p className="font-bold text-xs">Multiple Members</p>
                <p className="text-[10px] text-[#7A6359]">Independent tracking</p>
              </button>

              <button
                type="button"
                onClick={() => setAssignmentType('team')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  assignmentType === 'team'
                    ? 'border-[#FF5601] bg-[#FF5601]/10 text-[#2A1812]'
                    : 'border-[#E8D0B7] bg-[#FAE6CE]/20 text-[#4A352D] hover:bg-[#FAE6CE]/40'
                }`}
              >
                <Layers className="w-4 h-4 mb-1 text-[#FC9631]" />
                <p className="font-bold text-xs">Entire Team</p>
                <p className="text-[10px] text-[#7A6359]">All team members</p>
              </button>
            </div>

            {/* Member Selector (Prioritizes selected team) */}
            {assignmentType !== 'team' && (
              <div className="bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-2xl p-3">
                <p className="text-[10px] font-bold text-[#7A6359] uppercase tracking-wider mb-2">
                  Select Assignee(s) — Priority team members highlighted
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {sortedMembers.map((member) => {
                    const isSelected = selectedAssigneeIds.includes(member.id);
                    const isInTeam = member.team_id === teamId;
                    return (
                      <div
                        key={member.id}
                        onClick={() => handleToggleMember(member.id)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer border transition-all ${
                          isSelected
                            ? 'bg-[#FF5601]/15 border-[#FF5601]'
                            : 'bg-white border-[#E8D0B7]/70 hover:border-[#FF5601]/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={member.avatar_url}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#2A1812] block">
                              {member.full_name}
                            </span>
                            <span className="text-[10px] text-[#7A6359]">
                              @{member.username} • {member.designation}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isInTeam && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#FC9631]/20 text-[#B85B00]">
                              Team Member
                            </span>
                          )}
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#FF5601] border-[#FF5601] text-white'
                                : 'border-[#E8D0B7]'
                            }`}
                          >
                            {isSelected && <span className="text-[10px] font-bold">✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {assignmentType === 'team' && (
              <div className="p-3 bg-[#FAE6CE]/30 border border-[#E8D0B7] rounded-xl text-xs text-[#4A352D]">
                💡 This task will be automatically assigned to all active members of{' '}
                <strong className="text-[#2A1812]">
                  {teams.find((t) => t.id === teamId)?.name}
                </strong>
                . Each member tracks their completion independently.
              </div>
            )}
          </div>

          {/* Reference URLs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#2A1812]">
                Reference Materials / Links
              </label>
              <button
                type="button"
                onClick={handleAddUrl}
                className="text-xs font-bold text-[#FF5601] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add URL</span>
              </button>
            </div>
            <div className="space-y-2">
              {referenceUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleUpdateUrl(idx, e.target.value)}
                    placeholder="https://figma.com/..., https://notion.so/..., etc."
                    className="flex-1 bg-[#FAE6CE]/20 focus:bg-white border border-[#E8D0B7] rounded-xl px-3 py-1.5 text-xs text-[#2A1812] placeholder-[#7A6359] focus:outline-none focus:border-[#FF5601]"
                  />
                  {referenceUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUrl(idx)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Internal Instructions */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
              Internal Instructions / Admin Notes
            </label>
            <input
              type="text"
              value={internalInstructions}
              onChange={(e) => setInternalInstructions(e.target.value)}
              placeholder="e.g. Export at @2x; submit draft by Wednesday evening."
              className="w-full bg-[#FAE6CE]/20 focus:bg-white border border-[#E8D0B7] rounded-xl px-3.5 py-2 text-xs text-[#2A1812] placeholder-[#7A6359] focus:outline-none focus:border-[#FF5601]"
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
              className="px-6 py-2 rounded-full text-xs font-black text-white bg-[#FF5601] hover:bg-[#E04800] shadow-[0_4px_14px_-2px_rgba(255,86,1,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Create & Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
