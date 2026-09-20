import React from 'react';
import { LogOut, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LogoutModal: React.FC = () => {
  const { isLogoutModalOpen, setIsLogoutModalOpen, confirmLogout } = useApp();

  if (!isLogoutModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        <button
          onClick={() => setIsLogoutModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h3 id="logout-title" className="text-base font-bold text-slate-900 dark:text-white">
              Log out of MindSync?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              You will need to sign in again to access your meetings and tasks.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-4">
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmLogout}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
