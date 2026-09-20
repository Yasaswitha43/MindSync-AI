import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Sparkles,
  Plus,
  Mic,
  LogOut,
  ChevronRight,
  BrainCircuit,
  GitCompare,
  Settings,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppPage } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { MagneticButton } from './MagneticButton';

export const Sidebar: React.FC<{ isMobileMenuOpen?: boolean; onCloseMobileMenu?: () => void }> = ({
  isMobileMenuOpen = false,
  onCloseMobileMenu,
}) => {
  const { page, setPage, setIsVoiceAssistantOpen, user, logout, followUps } = useApp();

  const unresolvedFollowUpsCount = followUps.filter((f) => f.status === 'active' || f.severity === 'urgent').length;

  const navItems: { label: string; icon: React.ElementType; pageKey: AppPage; badge?: number }[] = [
    { label: 'Dashboard', icon: LayoutDashboard, pageKey: 'dashboard' },
    { label: 'Meetings', icon: FolderKanban, pageKey: 'history' },
    { label: 'Tasks', icon: CheckSquare, pageKey: 'tasks' },
    { label: 'Memory', icon: BrainCircuit, pageKey: 'memory' },
    { label: 'Follow-Ups', icon: GitCompare, pageKey: 'followups', badge: unresolvedFollowUpsCount > 0 ? unresolvedFollowUpsCount : undefined },
    { label: 'Settings', icon: Settings, pageKey: 'settings' },
  ];

  const handleNavClick = (targetPage: AppPage) => {
    setPage(targetPage);
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const handleOpenAssistant = () => {
    setIsVoiceAssistantOpen(true);
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const content = (
    <div className="flex flex-col h-full justify-between">
      {/* Top brand & navigation */}
      <div>
        {/* Brand header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-200/60 dark:border-slate-800/80">
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-4 h-4 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0b0f17]" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                MindSync
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                  AI
                </span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 tracking-tight">
                Cross-Meeting Memory
              </p>
            </div>
          </button>
        </div>

        {/* Primary CTA */}
        <div className="px-3 pt-4 pb-2">
          <MagneticButton
            id="sidebar-new-meeting-btn"
            onClick={() => handleNavClick('upload')}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Meeting</span>
          </MagneticButton>
        </div>

        {/* Navigation list */}
        <nav className="px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              page === item.pageKey ||
              (item.pageKey === 'history' && (page === 'results' || page === 'transcript'));

            return (
              <button
                key={item.pageKey}
                id={`sidebar-nav-${item.pageKey}`}
                onClick={() => handleNavClick(item.pageKey)}
                className={`group w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-250 cursor-pointer relative ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 font-semibold border border-indigo-200/80 dark:border-indigo-800/50 shadow-sm shadow-indigo-500/5'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-hover:translate-x-0.5 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'
                    }`}
                  />
                  <span className="transition-colors duration-200">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500 animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom sidebar controls */}
      <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2">
        {/* Ask AI Voice Assistant Button */}
        <button
          id="sidebar-ask-ai-button"
          onClick={handleOpenAssistant}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/60 hover:bg-indigo-50/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 hover:border-indigo-200 dark:hover:border-slate-600 transition-all duration-250 text-xs font-medium group cursor-pointer hover:shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Mic className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="block font-semibold leading-none group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors">
                Ask MindSync
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-400">
                Voice & Query
              </span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Theme & Profile Card */}
        <div className="pt-2 px-1 flex items-center justify-between">
          <ThemeToggle />

          {user && (
            <button
              id="sidebar-logout-button"
              onClick={logout}
              title="Sign out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User preview */}
        {user && (
          <button
            type="button"
            id="sidebar-user-preview-btn"
            onClick={() => handleNavClick('profile')}
            className={`mt-1 w-full flex items-center gap-2.5 px-2 py-2 rounded-xl border transition-all text-left cursor-pointer ${
              page === 'profile'
                ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700/80 shadow-xs ring-1 ring-indigo-500/30'
                : 'bg-slate-50/80 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
            title="View User Profile"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className={`w-7 h-7 rounded-lg object-cover ring-1 ${
                page === 'profile' ? 'ring-indigo-500' : 'ring-slate-300 dark:ring-slate-700'
              }`}
            />
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
            </div>
            {page === 'profile' && (
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-xs shadow-indigo-500 animate-pulse shrink-0" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed top-0 left-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#05070D]/80 backdrop-blur-xl z-30 shadow-sm">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobileMenu}
          />
          <div className="relative w-64 max-w-xs h-full bg-white dark:bg-[#0B1020] border-r border-slate-200 dark:border-slate-800 shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
