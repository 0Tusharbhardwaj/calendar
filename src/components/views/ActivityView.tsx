import React from 'react';
import {
  History,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ActivityView: React.FC = () => {
  const { activityLogs } = useApp();

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return <FileCheck className="w-4 h-4 text-[#FE75B9]" />;
      case 'review':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'team':
        return <Layers className="w-4 h-4 text-[#FC9631]" />;
      case 'calendar_event':
        return <Calendar className="w-4 h-4 text-[#FF5601]" />;
      case 'user':
        return <User className="w-4 h-4 text-[#A63500]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#FF5601]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-6 shadow-warm-sm">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5601] bg-[#FF5601]/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
          Operational Audit
        </span>
        <h2 className="text-xl font-black text-[#2A1812]">Platform Activity & Audit History</h2>
        <p className="text-xs text-[#7A6359] mt-0.5">
          Real-time chronological timeline of deliverables, reviews, team updates, and log activity
        </p>
      </div>

      {/* Activity Timeline */}
      <div className="bg-[#FFFFFF] border border-[#E8D0B7] rounded-3xl p-6 shadow-warm-sm space-y-4">
        {activityLogs.length === 0 ? (
          <div className="py-12 text-center text-[#7A6359]">
            <History className="w-8 h-8 opacity-40 mx-auto mb-2" />
            <p className="text-xs font-bold text-[#2A1812]">No activity logged yet</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E8D0B7]">
            {activityLogs.map((log) => (
              <div key={log.id} className="relative flex items-start gap-4">
                {/* Node beacon */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#FFFBF7] border-2 border-[#FF5601] flex items-center justify-center shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF5601]" />
                </div>

                <div className="flex-1 bg-[#FAE6CE]/20 hover:bg-[#FAE6CE]/40 p-4 rounded-2xl border border-[#E8D0B7] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center space-x-2">
                      {log.actor_avatar ? (
                        <img
                          src={log.actor_avatar}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#2A1812] text-white flex items-center justify-center text-[10px] font-bold">
                          {log.actor_name.charAt(0)}
                        </div>
                      )}
                      <span className="font-extrabold text-xs text-[#2A1812]">
                        {log.actor_name}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded-full bg-white border border-[#E8D0B7] text-[#7A6359]">
                        {log.entity_type}
                      </span>
                    </div>

                    <span className="text-[11px] text-[#7A6359] font-medium">
                      {new Date(log.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-[#4A352D] leading-relaxed">
                    {log.actor_name} {log.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
