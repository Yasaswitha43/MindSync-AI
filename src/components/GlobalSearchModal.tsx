import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  FolderKanban,
  CheckSquare,
  HelpCircle,
  Clock,
  User,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    meetings,
    setSelectedMeetingId,
    setResultsTab,
    setPage,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  // Search results collections
  const matchingMeetings = q
    ? meetings.filter((m) => m.title.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q))
    : meetings.slice(0, 3);

  const matchingTasks = q
    ? meetings.flatMap((m) =>
        m.actionItems.filter(
          (item) =>
            item.task.toLowerCase().includes(q) ||
            item.responsiblePerson.toLowerCase().includes(q)
        )
      )
    : [];

  const matchingDecisions = q
    ? meetings.flatMap((m) =>
        m.decisions.filter((d) => d.decision.toLowerCase().includes(q) || d.context.toLowerCase().includes(q))
      )
    : [];

  const matchingQuestions = q
    ? meetings.flatMap((m) =>
        m.unresolvedQuestions.filter((item) => item.question.toLowerCase().includes(q))
      )
    : [];

  const matchingPeople = q
    ? Array.from(
        new Set(
          meetings.flatMap((m) =>
            m.participants.map((p) => p.name).concat(m.actionItems.map((a) => a.responsiblePerson))
          )
        )
      ).filter((name) => name.toLowerCase().includes(q) && name !== 'Not specified')
    : [];

  const handleSelectMeeting = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setResultsTab('overview');
    setPage('results');
    setIsSearchOpen(false);
  };

  const handleSelectTask = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setResultsTab('actions');
    setPage('results');
    setIsSearchOpen(false);
  };

  const handleSelectDecision = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setResultsTab('decisions');
    setPage('results');
    setIsSearchOpen(false);
  };

  const handleSelectQuestion = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setResultsTab('questions');
    setPage('results');
    setIsSearchOpen(false);
  };

  const handleSelectPerson = (personName: string) => {
    setPage('tasks');
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => setIsSearchOpen(false)}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f1422] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search meetings, decisions, action items, participants..."
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block ml-3 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded">
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5 text-xs">
          {!q && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Recent Meetings
              </p>
              <div className="space-y-1">
                {matchingMeetings.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMeeting(m.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderKanban className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {m.title}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-2">
                          {m.date} · {m.durationMinutes} min
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {q && (
            <>
              {/* Meetings */}
              {matchingMeetings.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Meetings ({matchingMeetings.length})
                  </p>
                  <div className="space-y-1">
                    {matchingMeetings.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelectMeeting(m.id)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <FolderKanban className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {m.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{m.date}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {matchingTasks.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Action Items ({matchingTasks.length})
                  </p>
                  <div className="space-y-1">
                    {matchingTasks.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleSelectTask(t.meetingId)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-sm">
                            {t.task}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{t.responsiblePerson}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Decisions */}
              {matchingDecisions.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Decisions ({matchingDecisions.length})
                  </p>
                  <div className="space-y-1">
                    {matchingDecisions.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleSelectDecision(d.meetingId)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-cyan-500 shrink-0" />
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-sm">
                            {d.decision}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">View</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions */}
              {matchingQuestions.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Unresolved Questions ({matchingQuestions.length})
                  </p>
                  <div className="space-y-1">
                    {matchingQuestions.map((qItem) => (
                      <button
                        key={qItem.id}
                        onClick={() => handleSelectQuestion(qItem.meetingId)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-sm">
                            {qItem.question}
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-400">Question</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* People */}
              {matchingPeople.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    People ({matchingPeople.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {matchingPeople.map((person) => (
                      <button
                        key={person}
                        onClick={() => handleSelectPerson(person)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{person}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No match */}
              {matchingMeetings.length === 0 &&
                matchingTasks.length === 0 &&
                matchingDecisions.length === 0 &&
                matchingQuestions.length === 0 &&
                matchingPeople.length === 0 && (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-sm">No matching records found for "{query}"</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Try searching for names like "Rahul", "Priya", or topics like "frontend" or "launch".
                    </p>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
