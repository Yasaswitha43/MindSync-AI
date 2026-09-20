import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThemeToggle } from './ThemeToggle';
import { MagneticButton } from './MagneticButton';
import { ProfileDropdown } from './ProfileDropdown';
import { NotificationDropdown } from './NotificationDropdown';

export const TopBar: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const {
    page,
    setPage,
    currentMeeting,
    setIsSearchOpen,
    setIsVoiceAssistantOpen,
    user,
    unreadNotificationCount,
  } = useApp();

  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getBreadcrumbs = () => {
    switch (page) {
      case 'dashboard':
        return [{ label: 'Dashboard' }];
      case 'history':
        return [{ label: 'Dashboard', link: 'dashboard' }, { label: 'Meetings' }];
      case 'upload':
        return [
          { label: 'Dashboard', link: 'dashboard' },
          { label: 'Meetings', link: 'history' },
          { label: 'Upload Recording' },
        ];
      case 'processing':
        return [
          { label: 'Dashboard', link: 'dashboard' },
          { label: 'Meetings', link: 'history' },
          { label: 'AI Processing' },
        ];
      case 'results':
        return [
          { label: 'Dashboard', link: 'dashboard' },
          { label: 'Meetings', link: 'history' },
          { label: currentMeeting?.title || 'Meeting Results' },
        ];
      case 'transcript':
        return [
          { label: 'Dashboard', link: 'dashboard' },
          { label: 'Meetings', link: 'history' },
          { label: currentMeeting?.title || 'Meeting', link: 'results' },
          { label: 'Transcript' },
        ];
      case 'tasks':
        return [{ label: 'Dashboard', link: 'dashboard' }, { label: 'Task Management' }];
      case 'memory':
        return [{ label: 'Dashboard', link: 'dashboard' }, { label: 'Meeting Memory' }];
      case 'followups':
        return [{ label: 'Dashboard', link: 'dashboard' }, { label: 'Follow-Ups' }];
      case 'calendar':
        return [{ label: 'Dashboard', link: 'dashboard' }, { label: 'Deadlines & Calendar' }];
      case 'profile':
        return [
          { label: 'Dashboard', link: 'dashboard' },
          { label: 'Settings', link: 'settings' },
          { label: 'User Profile' },
        ];
      case 'settings':
        return [{ label: 'Dashboard', link: 'dashboard' }, { label: 'Settings' }];
      default:
        return [{ label: 'Dashboard', link: 'dashboard' }];
    }
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header
      id="app-topbar"
      className="sticky top-0 z-20 w-full h-16 bg-white/75 dark:bg-[#0b0f17]/75 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-theme"
    >
      {/* Left side: Hamburger on mobile + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              {b.link ? (
                <button
                  onClick={() => setPage(b.link as any)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  {b.label}
                </button>
              ) : (
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px] sm:max-w-xs md:max-w-sm">
                  {b.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right side: Search, New Meeting, Voice shortcut, Notification, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search trigger */}
        <button
          id="topbar-search-trigger"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs transition-all border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Search meetings, tasks...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Ask AI Voice Floating Trigger Button */}
        <MagneticButton
          id="topbar-voice-trigger"
          onClick={() => setIsVoiceAssistantOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 hover:from-indigo-500/20 hover:to-cyan-500/20 text-indigo-600 dark:text-cyan-300 border border-indigo-500/20 dark:border-cyan-500/30 text-xs font-medium transition-all"
          title="Open Voice Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">Ask AI</span>
        </MagneticButton>

        {/* "+ New Meeting" primary action */}
        {page !== 'upload' && (
          <MagneticButton
            id="topbar-new-meeting-btn"
            onClick={() => setPage('upload')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload</span>
          </MagneticButton>
        )}

        {/* Topbar Theme Toggle */}
        <ThemeToggle className="p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800" />

        {/* Notification bell */}
        <div className="relative">
          <button
            id="topbar-notifications-btn"
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#0b0f17] animate-in zoom-in-50">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Dynamic Smart Notifications Dropdown */}
          <NotificationDropdown
            isOpen={showNotificationMenu}
            onClose={() => setShowNotificationMenu(false)}
          />
        </div>

        {/* User avatar & Profile Dropdown */}
        {user && (
          <div className="relative">
            <button
              id="topbar-user-profile-btn"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotificationMenu(false);
              }}
              className={`flex items-center gap-2 p-1 rounded-xl transition-all cursor-pointer ${
                page === 'profile'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/80 shadow-xs'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              title={`${user.name} - Profile & Settings`}
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className={`w-7 h-7 rounded-full object-cover ring-2 transition-all ${
                  page === 'profile'
                    ? 'ring-indigo-500'
                    : 'ring-indigo-500/30 hover:ring-indigo-500/60'
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            <ProfileDropdown
              isOpen={showProfileMenu}
              onClose={() => setShowProfileMenu(false)}
            />
          </div>
        )}
      </div>
    </header>
  );
};
