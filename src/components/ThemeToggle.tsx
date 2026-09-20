import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

export const ThemeToggle: React.FC<{ className?: string; showLabel?: boolean }> = ({
  className = '',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle-button"
      onClick={toggleTheme}
      type="button"
      className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
        isDark
          ? 'bg-[#0b1020]/90 hover:bg-[#101625] text-slate-200 border border-[#1d2638] shadow-sm hover:border-indigo-500/40 hover:shadow-indigo-500/10'
          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-indigo-500/5'
      } ${className}`}
      title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
      aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center"
            >
              <Moon className="w-4 h-4 text-cyan-400 fill-cyan-400/20 group-hover:text-cyan-300 transition-colors" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center"
            >
              <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20 group-hover:text-amber-600 transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showLabel && (
        <span className="text-xs tracking-wide font-medium">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
};
