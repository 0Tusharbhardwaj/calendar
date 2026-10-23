import React, { useState } from 'react';
import { X, Users, AlertCircle, Palette } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Team } from '../../types';

interface TeamModalProps {
  teamToEdit?: Team | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({
  teamToEdit,
  isOpen,
  onClose,
}) => {
  const { createTeam, updateTeam } = useApp();

  const [name, setName] = useState(teamToEdit?.name || '');
  const [description, setDescription] = useState(teamToEdit?.description || '');
  const [color, setColor] = useState(teamToEdit?.color || '#FC9631');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const colorPalette = [
    { name: 'Sunset', hex: '#FC9631' },
    { name: 'Hot Pink', hex: '#FE75B9' },
    { name: 'Flame', hex: '#FF5601' },
    { name: 'Marigold', hex: '#F9CC61' },
    { name: 'Raspberry', hex: '#E6455E' },
    { name: 'Warm Cocoa', hex: '#4A352D' },
    { name: 'Sage Mint', hex: '#10B981' },
    { name: 'Indigo Stream', hex: '#6366F1' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Team name is required.');
      return;
    }

    if (teamToEdit) {
      updateTeam(teamToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        color,
        badge_bg: `${color}25`,
        badge_text: color,
      });
    } else {
      createTeam(name.trim(), description.trim(), color);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1812]/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#FFFBF7] rounded-3xl border border-[#E8D0B7] shadow-2xl overflow-hidden flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#E8D0B7] flex items-center justify-between bg-[#FAE6CE]/40">
          <div className="flex items-center space-x-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#2A1812] text-base">
                {teamToEdit ? 'Edit Team' : 'Create New Team'}
              </h3>
              <p className="text-xs text-[#7A6359]">Configure functional operational unit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7A6359] hover:bg-[#FAE6CE] hover:text-[#2A1812]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
              Team Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Social Media & Reels"
              className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
              Description & Scope
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Responsible for short-form clips, teasers, and animations."
              className="w-full bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 focus:bg-white border border-[#E8D0B7] rounded-xl px-3.5 py-2 text-xs text-[#2A1812] focus:outline-none focus:border-[#FF5601]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#2A1812] mb-1.5">
              Brand Accent Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorPalette.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    color === c.hex
                      ? 'border-[#2A1812] bg-[#FAE6CE] shadow-xs'
                      : 'border-[#E8D0B7] hover:bg-white'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full shadow-xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[10px] font-bold text-[#2A1812]">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

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
              className="px-6 py-2 rounded-full text-xs font-black text-white bg-[#FF5601] hover:bg-[#E04800] shadow-sm transition-all"
            >
              {teamToEdit ? 'Save Changes' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
