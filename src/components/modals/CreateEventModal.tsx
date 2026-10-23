import React, { useState } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Tag,
  Link,
  Users,
  AlertCircle,
  Flag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CalendarEventType } from '../../types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  initialDate,
}) => {
  const { teams, users, createCalendarEvent } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [eventType, setEventType] = useState<CalendarEventType>('meeting');
  const [teamId, setTeamId] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const eventTypes: { label: string; value: CalendarEventType; color: string }[] = [
    { label: 'Team Meeting', value: 'meeting', color: '#FC9631' },
    { label: 'Campaign Launch', value: 'campaign_launch', color: '#FE75B9' },
    { label: 'Key Milestone', value: 'milestone', color: '#F9CC61' },
    { label: 'Publishing Schedule', value: 'publishing', color: '#FF5601' },
    { label: 'Announcement', value: 'announcement', color: '#E6455E' },
    { label: 'Internal Deadline', value: 'internal_deadline', color: '#8c4b00' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Event title is required.');
      return;
    }

    createCalendarEvent({
      title: title.trim(),
      description: description.trim(),
      date,
      start_time: startTime || undefined,
      end_time: endTime || undefined,
      event_type: eventType,
      team_id: teamId || undefined,
      reference_url: referenceUrl.trim() || undefined,
    });

    onClose();
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
            <div className="w-9 h-9 rounded-full bg-[#FC9631] flex items-center justify-center text-white shadow-sm">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#2A1812] text-base">New Calendar Event</h3>
              <p className="text-xs text-[#7A6359]">Schedule campaign, launch, or team milestone</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="e.g. Instagram Campaign Launch"
              className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl px-3.5 py-2 text-sm text-[#2A1812] placeholder-[#7A6359] focus:outline-none focus:border-[#FC9631] focus:ring-2 focus:ring-[#FC9631]/20 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
              Event Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {eventTypes.map((et) => (
                <button
                  key={et.value}
                  type="button"
                  onClick={() => setEventType(et.value)}
                  className={`p-2 rounded-xl text-left border text-xs font-bold transition-all ${
                    eventType === et.value
                      ? 'border-[#2A1812] bg-[#2A1812] text-white shadow-xs'
                      : 'border-[#E8D0B7] bg-[#FAE6CE]/30 text-[#4A352D] hover:bg-[#FAE6CE]/60'
                  }`}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: et.color }}
                  />
                  <span>{et.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-xl px-3 py-2 text-xs text-[#2A1812] font-semibold focus:outline-none focus:border-[#FC9631]"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-xl px-3 py-2 text-xs text-[#2A1812] font-semibold focus:outline-none focus:border-[#FC9631]"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-xl px-3 py-2 text-xs text-[#2A1812] font-semibold focus:outline-none focus:border-[#FC9631]"
              />
            </div>
          </div>

          {/* Associated Team (optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Associated Team (Optional)
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-xl px-3 py-2 text-xs text-[#2A1812] font-semibold focus:outline-none focus:border-[#FC9631]"
              >
                <option value="">All / Entire Organization</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
                Reference / Video Call URL
              </label>
              <input
                type="url"
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-xl px-3 py-2 text-xs text-[#2A1812] focus:outline-none focus:border-[#FC9631]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
              Description & Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add agenda, launch checklist, or context..."
              className="w-full bg-[#FAE6CE]/20 border border-[#E8D0B7] rounded-xl px-3.5 py-2 text-xs text-[#2A1812] placeholder-[#7A6359] focus:outline-none focus:border-[#FC9631]"
            />
          </div>

          {/* Actions */}
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
              className="px-6 py-2 rounded-full text-xs font-black text-white bg-[#FC9631] hover:bg-[#E57E1E] shadow-[0_4px_14px_-2px_rgba(252,150,49,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Schedule Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
