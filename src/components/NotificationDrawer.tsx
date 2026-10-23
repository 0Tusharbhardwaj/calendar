import React from 'react';
import {
  Bell,
  CheckCheck,
  X,
  FileCheck,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppNotification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (taskId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTask,
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'submission_received':
      case 'task_resubmitted':
        return <FileCheck className="w-4 h-4 text-[#FE75B9]" />;
      case 'submission_approved':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'revision_requested':
        return <AlertTriangle className="w-4 h-4 text-[#FC9631]" />;
      case 'deadline_approaching':
      case 'task_overdue':
        return <Clock className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-[#FF5601]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#2A1812]/40 backdrop-blur-xs">
      <div
        className="w-full max-w-sm h-full bg-[#FFFBF7] border-l border-[#E8D0B7] shadow-2xl flex flex-col animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E8D0B7] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#FAE6CE] flex items-center justify-center text-[#FF5601]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#2A1812] text-sm">Notifications</h3>
              <p className="text-[11px] text-[#7A6359]">Operational & review updates</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={markAllNotificationsRead}
              className="p-1.5 rounded-lg text-[#7A6359] hover:bg-[#FAE6CE] hover:text-[#2A1812] transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#7A6359] hover:bg-[#FAE6CE] hover:text-[#2A1812] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#7A6359]">
              <Bell className="w-8 h-8 opacity-30 mb-2" />
              <p className="text-xs font-bold text-[#2A1812]">All caught up!</p>
              <p className="text-[11px] mt-0.5">No unread notifications at the moment.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationRead(notif.id);
                  if (notif.related_task_id) {
                    onSelectTask(notif.related_task_id);
                    onClose();
                  }
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  notif.is_read
                    ? 'bg-[#FFFFFF]/70 border-[#E8D0B7]/60 hover:bg-[#FFFFFF]'
                    : 'bg-[#FAE6CE]/40 border-[#FF5601]/30 hover:bg-[#FAE6CE]/60 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-full bg-[#FFFBF7] shadow-xs flex-shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-[#2A1812] truncate">
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#FF5601] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#4A352D] mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-[#7A6359] block mt-1.5">
                      {new Date(notif.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
