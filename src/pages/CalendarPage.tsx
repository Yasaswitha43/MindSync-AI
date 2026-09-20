import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  FolderKanban,
  ArrowRight,
  ExternalLink,
  Bell,
  AlertTriangle,
  ListOrdered,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CalendarPage: React.FC = () => {
  const { meetings, allActionItems, followUps, setSelectedMeetingId, setResultsTab, setPage } = useApp();

  // View toggle: Calendar Grid vs Visual Timeline
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');

  // Selected date in format '2026-09-24' (Demo Reference Date is 2026-09-22)
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-22');

  // Month state (September 2026)
  const currentMonthYear = 'September 2026';
  const daysInMonth = 30; // Sep has 30 days
  const startDayOffset = 2; // Sep 1, 2026 is a Tuesday (0 = Sun, 1 = Mon, 2 = Tue)

  // Aggregate all deadlines from meetings
  const allDeadlines = meetings.flatMap((m) =>
    m.deadlines.map((dl) => ({
      ...dl,
      meetingTitle: m.title,
    }))
  );

  // Group items by day
  const getItemsForDay = (day: number) => {
    const formattedDayStr = `2026-09-${day < 10 ? '0' + day : day}`;
    const dayMeetings = meetings.filter((m) => m.isoDate === formattedDayStr);
    const dayDeadlines = allDeadlines.filter((d) => d.isoDate === formattedDayStr);
    const dayTasks = allActionItems.filter((a) => {
      // Check if deadline maps to this day
      if (a.currentDeadline && a.currentDeadline.includes(String(day))) return true;
      if (a.deadline && a.deadline.includes(String(day))) return true;
      return false;
    });
    const isToday = formattedDayStr === '2026-09-22';
    const isOverdueDay = day < 22 && dayDeadlines.length > 0;
    return { dayMeetings, dayDeadlines, dayTasks, formattedDayStr, isToday, isOverdueDay };
  };

  // Selected day items
  const selectedDayNum = parseInt(selectedDate.split('-')[2], 10);
  const selectedData = getItemsForDay(selectedDayNum);

  const handleOpenMeeting = (meetingId: string, tab: 'overview' | 'deadlines' = 'deadlines') => {
    setSelectedMeetingId(meetingId);
    setResultsTab(tab);
    setPage('results');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Calendar & Deadlines
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual timeline and calendar tracking meeting milestones, scheduled reminders, and overdue alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle: Calendar vs Visual Timeline */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-[#0B1020] text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar Grid</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-[#0B1020] text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Visual Timeline</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>{currentMonthYear}</span>
          </div>
        </div>
      </div>

      {viewMode === 'timeline' ? (
        /* VISUAL TIMELINE VIEW */
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-theme space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Chronological Milestone & Reminder Timeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Today is Sep 22, 2026. Automatic proactive reminders monitor each extracted commitment.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" /> Overdue Alert
              </span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <Clock className="w-3.5 h-3.5" /> Due Today / Tomorrow
              </span>
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                <Bell className="w-3.5 h-3.5" /> Scheduled Reminder
              </span>
            </div>
          </div>

          {/* Timeline Nodes */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {allActionItems.map((item) => {
              const isOverdue = item.reminderStatus?.isOverdue;
              const isTomorrow = item.reminderStatus?.category === 'tomorrow';
              const isToday = item.reminderStatus?.category === 'today';
              const isCompleted = item.status === 'completed';

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-[27px] sm:-left-[31px] top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isCompleted
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : isOverdue
                        ? 'border-rose-500 bg-rose-500 text-white'
                        : isToday
                        ? 'border-amber-500 bg-amber-500 text-white animate-pulse'
                        : isTomorrow
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : 'border-slate-400 bg-white dark:bg-slate-900 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : isOverdue ? (
                      <AlertTriangle className="w-2.5 h-2.5" />
                    ) : (
                      <Bell className="w-2.5 h-2.5" />
                    )}
                  </div>

                  {/* Timeline Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-[#0B1020]/70 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-600/60 transition-all space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.deadline}
                        </span>
                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> Overdue / Missed Commitment
                          </span>
                        )}
                        {isToday && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Due Today
                          </span>
                        )}
                        {isTomorrow && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            Due Tomorrow
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Completed · Reminders Stopped
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Owner: {item.responsiblePerson}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {item.task}
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-indigo-500" />
                        <span>
                          {isCompleted
                            ? 'Reminders concluded upon task completion'
                            : `Automatic Reminder Schedule: 7d, 3d, 1d, and Day-of (${item.reminderStatus?.reminderStage || 'Active'})`}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenMeeting(item.meetingId, 'deadlines')}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{item.meetingTitle}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* CALENDAR GRID VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-theme space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
                {currentMonthYear}
              </span>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Meeting
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Deadline
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Reminder / Today
                </span>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider pb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty slots for start day offset */}
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[72px] sm:min-h-[88px] rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/20" />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const { dayMeetings, dayDeadlines, formattedDayStr, isToday, isOverdueDay } = getItemsForDay(day);
                const isSelected = selectedDate === formattedDayStr;
                const hasEvents = dayMeetings.length > 0 || dayDeadlines.length > 0;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(formattedDayStr)}
                    className={`min-h-[72px] sm:min-h-[88px] rounded-2xl p-2 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between border ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                        : isToday
                        ? 'border-amber-400 dark:border-amber-600/80 bg-amber-50/30 dark:bg-amber-950/20'
                        : isOverdueDay
                        ? 'border-rose-300 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10'
                        : hasEvents
                        ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                        : 'border-slate-100 dark:border-slate-850/50 bg-slate-50/30 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-850/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : isToday
                            ? 'bg-amber-500 text-white'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {day}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Badges preview */}
                    <div className="space-y-1 mt-1">
                      {dayMeetings.map((m) => (
                        <div
                          key={m.id}
                          className="text-[9px] truncate px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-medium"
                          title={`Meeting: ${m.title}`}
                        >
                          {m.title}
                        </div>
                      ))}
                      {dayDeadlines.map((dl) => (
                        <div
                          key={dl.id}
                          className={`text-[9px] truncate px-1.5 py-0.5 rounded font-medium ${
                            isOverdueDay
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          }`}
                          title={`Deadline: ${dl.title}`}
                        >
                          {dl.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Milestones & Upcoming Deliverables */}
          <div className="lg:col-span-4 space-y-6">
            {/* Day Details Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-theme space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                  Date Details
                </h3>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                  {selectedDate} {selectedDate === '2026-09-22' ? '(Today)' : ''}
                </span>
              </div>

              {/* Meetings on this day */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Meetings on this day
                </span>
                {selectedData.dayMeetings.length > 0 ? (
                  selectedData.dayMeetings.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleOpenMeeting(m.id, 'overview')}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors cursor-pointer"
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{m.title}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {m.durationMinutes} min · {m.decisions.length} decisions
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No meetings recorded on this day.</p>
                )}
              </div>

              {/* Deadlines on this day */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Deadlines & Reminders
                </span>
                {selectedData.dayDeadlines.length > 0 ? (
                  selectedData.dayDeadlines.map((dl) => (
                    <div
                      key={dl.id}
                      onClick={() => handleOpenMeeting(dl.meetingId, 'deadlines')}
                      className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 hover:border-rose-500 transition-colors cursor-pointer space-y-1"
                    >
                      <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                        {dl.title}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Owner: {dl.responsiblePerson}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                          View meeting <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No deadlines due on this day.</p>
                )}
              </div>
            </div>

            {/* Upcoming Deadlines Quick List */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-theme space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                All Monitored Deadlines
              </h3>

              <div className="space-y-2.5">
                {allDeadlines.map((dl) => (
                  <div
                    key={dl.id}
                    onClick={() => handleOpenMeeting(dl.meetingId, 'deadlines')}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer flex items-center justify-between gap-2 text-xs border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {dl.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {dl.date} · {dl.responsiblePerson}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
