import React, { useRef, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCheck,
  X,
  ExternalLink,
  Settings,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReminderNotification } from '../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dismissNotification,
    setPage,
    setSelectedMeetingId,
    setResultsTab,
    setSettingsTab,
  } = useApp();

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenTask = (notification: ReminderNotification) => {
    markNotificationAsRead(notification.id);
    onClose();
    if (notification.meetingId) {
      setSelectedMeetingId(notification.meetingId);
      setResultsTab('actions');
      setPage('results');
    } else {
      setPage('tasks');
    }
  };

  const handleOpenPreferences = () => {
    setSettingsTab('notifications');
    setPage('settings');
    onClose();
  };

  const getNotificationIcon = (type: ReminderNotification['type'], severity: ReminderNotification['severity']) => {
    if (type === 'missed' || severity === 'urgent') {
      return (
        <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'today') {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'tomorrow') {
      return (
        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
          <Clock className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 shrink-0">
        <Bell className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
      role="menu"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            Notifications
          </h4>
          {unreadNotificationCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold leading-none">
              {unreadNotificationCount}
            </span>
          )}
        </div>

        {unreadNotificationCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <CheckCheck className="w-3 h-3" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1 flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2.5 text-slate-400">
              <CheckCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              All caught up!
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              No pending deadline alerts or reminders at this time.
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl transition-all relative group flex flex-col gap-2 ${
                !item.read
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start gap-3">
                {getNotificationIcon(item.type, item.severity)}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                      {item.type.replace('_', ' ')}
                    </span>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-[#0E1322] shrink-0" />
                    )}
                  </div>

                  <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                    {item.title}
                  </h5>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex-wrap">
                    {item.responsiblePerson && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                        {item.responsiblePerson}
                      </span>
                    )}
                    {item.dueDate && (
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>Due {item.dueDate}</span>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => dismissNotification(item.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/80 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  title="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100/80 dark:border-slate-800/40 mt-1">
                {!item.read && (
                  <button
                    type="button"
                    onClick={() => markNotificationAsRead(item.id)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenTask(item)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Open Task</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs shrink-0">
        <span className="text-[11px] text-slate-400">
          Smart Deadline Monitor Active
        </span>
        <button
          type="button"
          onClick={handleOpenPreferences}
          className="text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Settings className="w-3 h-3" />
          <span>Preferences</span>
        </button>
      </div>
    </div>
  );
};
