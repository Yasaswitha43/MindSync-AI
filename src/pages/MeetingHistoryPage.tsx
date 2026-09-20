import React, { useState } from 'react';
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  Calendar,
  Clock,
  Users,
  CheckSquare,
  HelpCircle,
  ArrowRight,
  Filter,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MeetingHistoryPage: React.FC = () => {
  const { meetings, setSelectedMeetingId, setResultsTab, setPage, deleteMeeting } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [participantFilter, setParticipantFilter] = useState('all');

  // Extract all unique participants
  const allParticipants = Array.from(
    new Set(meetings.flatMap((m) => m.participants.map((p) => p.name)))
  );

  const filteredMeetings = meetings.filter((m) => {
    if (participantFilter !== 'all') {
      const hasParticipant = m.participants.some((p) => p.name === participantFilter);
      if (!hasParticipant) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchSummary = m.summary.toLowerCase().includes(q);
      const matchSpeaker = m.participants.some((p) => p.name.toLowerCase().includes(q));
      if (!matchTitle && !matchSummary && !matchSpeaker) return false;
    }

    return true;
  });

  const handleOpenMeeting = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setResultsTab('overview');
    setPage('results');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Meeting History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse and query all historical meeting transcripts and synthesized intelligence.
          </p>
        </div>

        <button
          onClick={() => setPage('upload')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <span>+ Upload Meeting</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-theme flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings by title, summary, or participant..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Participant Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={participantFilter}
              onChange={(e) => setParticipantFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Participants</option>
              {allParticipants.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle: Cards vs List */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="List Row View"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Render Meetings */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => handleOpenMeeting(meeting.id)}
              className="p-6 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {meeting.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {meeting.durationMinutes} min
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {meeting.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {meeting.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    {meeting.decisions.length} Decisions
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {meeting.actionItems.length} Actions
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    {meeting.unresolvedQuestions.length} Questions
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 text-[11px] truncate max-w-[150px]">
                    <Users className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{meeting.participants.map((p) => p.name).join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${meeting.title}"?`)) {
                          deleteMeeting(meeting.id);
                        }
                      }}
                      title="Delete meeting"
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode */
        <div className="space-y-3">
          {filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => handleOpenMeeting(meeting.id)}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {meeting.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>{meeting.date}</span>
                  <span>·</span>
                  <span>{meeting.durationMinutes} min</span>
                  <span>·</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    {meeting.decisions.length} decisions · {meeting.actionItems.length} actions · {meeting.unresolvedQuestions.length} questions
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <span className="text-xs text-slate-400 hidden md:inline">
                  {meeting.participants.map((p) => p.name).slice(0, 2).join(', ')}
                  {meeting.participants.length > 2 && ` +${meeting.participants.length - 2}`}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${meeting.title}"?`)) {
                      deleteMeeting(meeting.id);
                    }
                  }}
                  title="Delete meeting"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredMeetings.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200/80 dark:border-slate-800 text-slate-400 text-xs">
          <p className="font-semibold text-slate-600 dark:text-slate-300">No meetings found</p>
          <p className="mt-1">Try adjusting your search keywords or participant filter.</p>
        </div>
      )}
    </div>
  );
};
