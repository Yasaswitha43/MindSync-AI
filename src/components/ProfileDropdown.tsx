import React, { useRef, useEffect } from 'react';
import { User, Settings, Bell, LogOut, ExternalLink, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isOpen, onClose }) => {
  const { user, setPage, setSettingsTab, setIsLogoutModalOpen } = useApp();
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

  const handleViewProfile = () => {
    setPage('profile');
    onClose();
  };

  const handleAccountSettings = () => {
    setSettingsTab('general');
    setPage('settings');
    onClose();
  };

  const handleNotificationPreferences = () => {
    setSettingsTab('notifications');
    setPage('settings');
    onClose();
  };

  const handleLogoutClick = () => {
    onClose();
    setIsLogoutModalOpen(true);
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      role="menu"
    >
      {/* User Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center gap-3">
          <img
            src={
              user?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
            alt={user?.name || 'User'}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user?.name || 'Yasaswitha'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {user?.email || 'yasaswithajarugu@gmail.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Actions */}
      <div className="p-2 space-y-0.5 text-xs">
        <button
          type="button"
          onClick={handleViewProfile}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-indigo-500" />
            <span className="font-medium">View Profile</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform group-hover:translate-x-0.5" />
        </button>

        <button
          type="button"
          onClick={handleAccountSettings}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            <span className="font-medium">Account Settings</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform group-hover:translate-x-0.5" />
        </button>

        <button
          type="button"
          onClick={handleNotificationPreferences}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-amber-500" />
            <span className="font-medium">Notification Preferences</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-800/80 mx-2 my-1" />

      {/* Logout */}
      <div className="p-2">
        <button
          type="button"
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};
