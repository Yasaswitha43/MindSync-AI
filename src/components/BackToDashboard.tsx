import React from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppPage } from '../types';

export interface BreadcrumbCrumb {
  label: string;
  page?: AppPage;
  onClick?: () => void;
}

interface BackToDashboardProps {
  breadcrumbs?: (string | BreadcrumbCrumb)[];
  className?: string;
  badge?: string;
}

export const BackToDashboard: React.FC<BackToDashboardProps> = ({
  breadcrumbs,
  className = '',
  badge,
}) => {
  const { setPage } = useApp();

  return (
    <div className={`flex flex-wrap items-center gap-2.5 sm:gap-3 mb-4 text-xs ${className}`}>
      {/* Back to Dashboard Button */}
      <button
        type="button"
        onClick={() => setPage('dashboard')}
        className="group inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-300 bg-white/70 dark:bg-slate-900/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800/90 hover:border-indigo-300/70 dark:hover:border-indigo-500/40 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer shrink-0"
        aria-label="Back to Dashboard"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-cyan-300" />
        <span className="hidden sm:inline">Back to Dashboard</span>
        <span className="sm:hidden">Dashboard</span>
      </button>

      {/* Optional Minimal Breadcrumb Trail for Deeper Context */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Page breadcrumb"
          className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-medium overflow-hidden"
        >
          <span className="text-slate-300 dark:text-slate-700 select-none">/</span>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            const isString = typeof crumb === 'string';
            const label = isString ? crumb : crumb.label;
            const crumbPage = !isString ? crumb.page : undefined;
            const crumbOnClick = !isString ? crumb.onClick : undefined;

            const handleClick = () => {
              if (crumbOnClick) {
                crumbOnClick();
              } else if (crumbPage) {
                setPage(crumbPage);
              }
            };

            return (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700 shrink-0" />
                )}
                {isLast ? (
                  <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[140px] sm:max-w-[220px]">
                    {label}
                  </span>
                ) : crumbPage || crumbOnClick ? (
                  <button
                    type="button"
                    onClick={handleClick}
                    className="hover:text-indigo-600 dark:hover:text-cyan-300 hover:underline transition-colors truncate max-w-[120px] sm:max-w-[180px] cursor-pointer"
                  >
                    {label}
                  </button>
                ) : (
                  <span className="truncate max-w-[120px] sm:max-w-[180px] text-slate-500 dark:text-slate-400">
                    {label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Optional badge */}
      {badge && (
        <span className="ml-auto hidden md:inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          {badge}
        </span>
      )}
    </div>
  );
};
