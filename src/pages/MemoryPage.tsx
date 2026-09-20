import React, { useState } from 'react';
import {
  BrainCircuit,
  Search,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FolderKanban,
  Quote,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initialMemoryAnswers } from '../data/mockData';
import { MemorySearchResult } from '../types';

export const MemoryPage: React.FC = () => {
  const { askMeetingMemory, setActiveEvidence, setSelectedMeetingId, setResultsTab, setPage } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState<MemorySearchResult | null>(initialMemoryAnswers[0]);
  const [searchHistory, setSearchHistory] = useState<MemorySearchResult[]>(initialMemoryAnswers);

  const sampleQuestions = [
    'When did we decide to change the deadline?',
    'Who promised to finish the frontend?',
    'What happened to the database decision?',
    'Which tasks are still unfinished?',
    'Why was the deadline changed?',
    'Who will handle testing?',
  ];

  const handleSearch = (queryText: string) => {
    setSearchQuery(queryText);
    const result = askMeetingMemory(queryText);
    if (result) {
      setSelectedResult(result);
      if (!searchHistory.some((h) => h.id === result.id)) {
        setSearchHistory((prev) => [result, ...prev]);
      }
    }
  };

  const handleOpenSourceMeeting = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setResultsTab('overview');
    setPage('results');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
            Feature 18 · Meeting Memory
          </span>
          <span className="text-xs text-slate-400">Natural Language Cross-Meeting Search</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
          Ask MindSync About Your Meetings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Ask natural questions across past discussions. MindSync synthesizes the answer, pinpoints the source meeting and date, and provides verifiable evidence citations.
        </p>
      </div>

      {/* Prominent Search Bar */}
      <div className="relative">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              const res = askMeetingMemory(e.target.value);
              if (res) setSelectedResult(res);
            }}
            placeholder="Ask anything... e.g. 'When did we decide to change the deadline?'"
            className="w-full pl-12 pr-28 py-4 text-sm sm:text-base rounded-2xl bg-white/90 dark:bg-[#0B1020]/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-lg shadow-indigo-500/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
            <button
              onClick={() => handleSearch(searchQuery)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Search Memory
            </button>
          </div>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-1">
          <span className="text-[11px] text-slate-400 font-medium">Quick prompts:</span>
          {sampleQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSearch(q)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors border ${
                searchQuery === q
                  ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                  : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 border-slate-200/60 dark:border-slate-800'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Answer Spotlight Card */}
      {selectedResult && (
        <div className="rounded-2xl p-6 sm:p-8 bg-white/90 dark:bg-[#0B1020]/90 backdrop-blur-xl border border-indigo-200 dark:border-indigo-900/60 shadow-xl space-y-6">
          {/* Header pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Question: "{selectedResult.query}"
                </span>
                <p className="text-[11px] text-slate-400">Synthesized from cross-meeting memory index</p>
              </div>
            </div>

            <button
              onClick={() => handleOpenSourceMeeting(selectedResult.meetingId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            >
              <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
              <span>{selectedResult.meetingTitle}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* Direct Answer */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Direct Answer
            </span>
            <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-white leading-relaxed">
              {selectedResult.answer}
            </p>
          </div>

          {/* Verifiable Quote & Evidence Citation */}
          <div className="space-y-2.5 pt-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Verifiable Evidence
            </span>

            <div className="relative rounded-xl p-4 bg-slate-50 dark:bg-[#101625] border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
              <Quote className="absolute top-3 left-3 w-4 h-4 text-slate-300 dark:text-slate-700 -z-0" />
              <p className="relative z-10 text-xs sm:text-sm font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed pl-2">
                "{selectedResult.evidence.quote}"
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Speaker: {selectedResult.evidence.speaker}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {selectedResult.evidence.timestamp}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-500" />
                    {selectedResult.evidence.meetingDate}
                  </span>
                </div>

                <button
                  onClick={() => setActiveEvidence(selectedResult.evidence)}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>[View Full Transcript Context]</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cross-Meeting Memory Timeline / Questions Index */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-indigo-500" />
          Indexed Cross-Meeting Queries & Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialMemoryAnswers.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedResult(item);
                setSearchQuery(item.query);
              }}
              className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer group space-y-2 ${
                selectedResult?.id === item.id
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500/50 shadow-sm'
                  : 'bg-white/80 dark:bg-[#0B1020]/80 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.query}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                  {item.meetingDate}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {item.answer}
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <span className="truncate">{item.meetingTitle}</span>
                <span className="font-medium text-indigo-500 group-hover:translate-x-0.5 transition-transform">
                  View →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
