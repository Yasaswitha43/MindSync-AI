import React, { useState } from 'react';
import {
  BrainCircuit,
  Search,
  AlertTriangle,
  Clock,
  ArrowRight,
  FolderKanban,
  Sparkles,
  GitCompare,
  HelpCircle,
  Plus,
  ShieldAlert,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TiltCard } from '../components/TiltCard';
import { MagneticButton } from '../components/MagneticButton';

export const DashboardPage: React.FC = () => {
  const {
    meetings,
    followUps,
    deadlineBuckets,
    setSelectedMeetingId,
    setResultsTab,
    setPage,
    user,
    setActiveCatchMeUpMeetingId,
    setActiveEvidence,
    askMeetingMemory,
  } = useApp();

  const [memoryQuery, setMemoryQuery] = useState('');
  const [activeSearchResult, setActiveSearchResult] = useState<any>(null);
  const [deadlineTab, setDeadlineTab] = useState<'all' | 'today' | 'tomorrow' | 'thisWeek' | 'overdue'>('all');

  const missedCommitmentsCount = followUps.filter((f) => f.type === 'missed_commitment').length;
  const deadlineChangedCount = followUps.filter((f) => f.type === 'deadline_changed').length;
  const unresolvedQuestionsCount = meetings.flatMap((m) =>
    m.unresolvedQuestions.filter((q) => !q.resolved)
  ).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryQuery.trim()) return;
    const result = askMeetingMemory(memoryQuery);
    if (result) {
      setActiveSearchResult(result);
    } else {
      setPage('memory');
    }
  };

  const handleOpenMeeting = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setResultsTab('overview');
    setPage('results');
  };

  const handleCatchMeUp = (meetingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCatchMeUpMeetingId(meetingId);
  };

  // Recent meetings sorted newest first
  const recentMeetings = [...meetings].sort((a, b) => b.isoDate.localeCompare(a.isoDate));

  // Upcoming deadlines from meetings sorted chronologically
  const allDeadlines = meetings
    .flatMap((m) =>
      m.deadlines.map((dl) => ({
        ...dl,
        meetingId: m.id,
        meetingTitle: m.title,
      }))
    )
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-300 pb-16">
      {/* 1. Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
              MindSync AI
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Cross-Meeting Memory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Good morning{user ? `, ${user.name.split(' ')[0]}` : ''}.
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
            MindSync remembers what happened before and understands what changed.
          </p>
        </div>

        <MagneticButton
          id="dashboard-upload-meeting-btn"
          onClick={() => setPage('upload')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Meeting</span>
        </MagneticButton>
      </div>

      {/* 2. Ask Meeting Memory Search Bar */}
      <div className="relative">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={memoryQuery}
            onChange={(e) => {
              setMemoryQuery(e.target.value);
              if (!e.target.value) setActiveSearchResult(null);
            }}
            placeholder="Ask Meeting Memory... (e.g. 'When did we decide to change the deadline?')"
            className="w-full pl-12 pr-28 py-4 text-sm sm:text-base rounded-2xl bg-white/90 dark:bg-[#0B1020]/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-lg shadow-indigo-500/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
          <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Ask
            </button>
          </div>
        </form>

        {/* Quick query chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-1">
          <span className="text-[11px] text-slate-400 font-medium">Try asking:</span>
          {[
            'When did we decide to change the deadline?',
            'Who promised to finish the frontend?',
            'What happened to the database decision?',
          ].map((promptText) => (
            <button
              key={promptText}
              onClick={() => {
                setMemoryQuery(promptText);
                const result = askMeetingMemory(promptText);
                if (result) setActiveSearchResult(result);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200/60 dark:border-slate-800 transition-colors"
            >
              "{promptText}"
            </button>
          ))}
        </div>

        {/* Instant Memory Search Result Dropdown / Card */}
        {activeSearchResult && (
          <div className="mt-4 p-5 rounded-2xl bg-white dark:bg-[#0B1020] border border-indigo-200 dark:border-indigo-900/60 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  MindSync Memory Result
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-200/60 dark:border-indigo-800/40">
                  {activeSearchResult.meetingTitle} · {activeSearchResult.meetingDate}
                </span>
              </div>
              <button
                onClick={() => setActiveSearchResult(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Dismiss
              </button>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {activeSearchResult.answer}
            </p>
            {activeSearchResult.evidence && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-xs italic text-slate-500 dark:text-slate-400 line-clamp-1 max-w-lg">
                  "{activeSearchResult.evidence.quote}"
                </div>
                <button
                  onClick={() => setActiveEvidence(activeSearchResult.evidence)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  <span>[View Evidence]</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. NEEDS ATTENTION SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Needs Attention
            </h2>
          </div>
          <button
            onClick={() => setPage('followups')}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All Follow-Ups</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Missed Commitments */}
          <button
            onClick={() => setPage('followups')}
            className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-left hover:border-amber-500/40 transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Commitments
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xl font-bold font-display text-slate-900 dark:text-white">
              {missedCommitmentsCount} tracked
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ravi's frontend deadline was missed & postponed
            </p>
          </button>

          {/* Card 2: Deadline Changed */}
          <button
            onClick={() => setPage('followups')}
            className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 text-left hover:border-indigo-500/40 transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Deadlines Changed
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xl font-bold font-display text-slate-900 dark:text-white">
              {deadlineChangedCount} shifted
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Frontend moved from Sep 20 → Sep 23
            </p>
          </button>

          {/* Card 3: Unresolved Questions */}
          <button
            onClick={() => setPage('followups')}
            className="p-4 rounded-2xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 text-left hover:border-cyan-500/40 transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
                Open Questions
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xl font-bold font-display text-slate-900 dark:text-white">
              {unresolvedQuestionsCount > 0 ? `${unresolvedQuestionsCount} unresolved` : 'All resolved'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Testing ownership resolved in Meeting #4
            </p>
          </button>
        </div>
      </div>

      {/* 4. UPCOMING DEADLINES & REMINDERS WIDGET */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Upcoming Deadlines & Reminders
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">
              Auto-Monitor Active
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage('tasks')}
              className="text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Tasks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage('calendar')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Calendar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Filter Pills: Due Today, Due Tomorrow, Due This Week, Overdue/Missed */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setDeadlineTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              deadlineTab === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-[#0B1020] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Active ({allDeadlines.length})
          </button>

          <button
            type="button"
            onClick={() => setDeadlineTab('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              deadlineTab === 'today'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#0B1020] text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Due Today ({deadlineBuckets.today.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setDeadlineTab('tomorrow')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              deadlineTab === 'tomorrow'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#0B1020] text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Due Tomorrow ({deadlineBuckets.tomorrow.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setDeadlineTab('thisWeek')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              deadlineTab === 'thisWeek'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#0B1020] text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900/40 hover:bg-cyan-50 dark:hover:bg-cyan-950/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>Due This Week ({deadlineBuckets.thisWeek.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setDeadlineTab('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              deadlineTab === 'overdue'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#0B1020] text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Overdue / Missed ({deadlineBuckets.overdue.length})</span>
          </button>
        </div>

        {/* Display Items based on selected filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(deadlineTab === 'overdue'
            ? deadlineBuckets.overdue
            : deadlineTab === 'today'
            ? deadlineBuckets.today
            : deadlineTab === 'tomorrow'
            ? deadlineBuckets.tomorrow
            : deadlineTab === 'thisWeek'
            ? deadlineBuckets.thisWeek
            : allDeadlines
          ).map((item: any) => {
            const isOverdue = deadlineTab === 'overdue' || item.reminderStatus?.isOverdue;
            const isTomorrow = item.reminderStatus?.category === 'tomorrow' || item.date?.toLowerCase().includes('sep 23');
            const isToday = item.reminderStatus?.category === 'today' || item.date?.toLowerCase().includes('sep 22');
            const title = item.title || item.task;
            const responsible = item.responsiblePerson || 'Team';
            const dateStr = item.date || item.currentDeadline || item.originalDeadline || item.deadline;
            const meetingId = item.meetingId;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (meetingId) handleOpenMeeting(meetingId);
                  else setPage('tasks');
                }}
                className={`p-4 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-md border transition-all cursor-pointer group shadow-sm flex flex-col justify-between ${
                  isOverdue
                    ? 'border-rose-300 dark:border-rose-800/80 hover:border-rose-500'
                    : isToday
                    ? 'border-amber-300 dark:border-amber-800/80 hover:border-amber-500'
                    : isTomorrow
                    ? 'border-indigo-300 dark:border-indigo-800/80 hover:border-indigo-500'
                    : 'border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-600/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                        isOverdue
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50'
                          : isToday
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50'
                          : isTomorrow
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/50'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {dateStr}
                    </span>

                    {isOverdue ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        Overdue / Missed
                      </span>
                    ) : isToday ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Due Today
                      </span>
                    ) : isTomorrow ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        Due Tomorrow
                      </span>
                    ) : item.isChanged ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Shifted
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Reminder Active
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {title}
                  </h4>

                  {item.isChanged && item.originalDate && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Was {item.originalDate}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-medium">{responsible}</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-indigo-500 flex items-center gap-0.5">
                    View Task
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RECENT MEETINGS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-indigo-500" />
            Recent Meetings
          </h2>
          <button
            onClick={() => setPage('history')}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All ({meetings.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {recentMeetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => handleOpenMeeting(meeting.id)}
              className="p-5 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-600/60 shadow-sm transition-all duration-200 cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {meeting.title}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">·</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {meeting.date}
                  </span>
                  {meeting.sensitiveAlerts && meeting.sensitiveAlerts.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      <ShieldAlert className="w-3 h-3" />
                      Sensitive Alert
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {meeting.summary}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                  <span>{meeting.actionItems.length} action items</span>
                  <span>·</span>
                  <span>{meeting.decisions.length} decisions</span>
                  <span>·</span>
                  <span>{meeting.participants.map((p) => p.name.split(' ')[0]).join(', ')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => handleCatchMeUp(meeting.id, e)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/40 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Catch Me Up</span>
                </button>
                <button
                  onClick={() => handleOpenMeeting(meeting.id)}
                  className="p-2 rounded-xl text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. MEMORY INSIGHT HIGHLIGHT */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-950/40 via-[#0B1020] to-[#05070D] border border-indigo-500/20 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Memory Insight
          </span>
        </div>
        <blockquote className="text-sm md:text-base font-serif italic text-slate-200 leading-relaxed">
          "MindSync cross-indexed 4 consecutive project meetings: Ravi promised the frontend for Sep 20 in Meeting #1, canvas blockers shifted the deadline to Sep 23 in Meeting #2, and full completion was verified in Meeting #4. Testing ownership was carried across 3 meetings before Arjun assumed leadership."
        </blockquote>
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400">
            Evolutionary tracking: 4 meetings, 1 deadline shifted, 1 decision reversed, 0 unresolved questions.
          </span>
          <button
            onClick={() => setPage('memory')}
            className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Explore Meeting Memory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
