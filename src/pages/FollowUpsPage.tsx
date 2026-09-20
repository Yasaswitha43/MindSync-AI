import React, { useState } from 'react';
import {
  GitCompare,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Quote,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FollowUpItem } from '../types';

export const FollowUpsPage: React.FC = () => {
  const { followUps, setActiveEvidence, setActiveDraft, setSelectedMeetingId, setResultsTab, setPage } = useApp();
  const [filter, setFilter] = useState<'all' | 'missed_commitment' | 'deadline_changed' | 'decision_reversed' | 'unresolved_question'>('all');

  const filteredItems = followUps.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const handleDraftFollowup = (item: FollowUpItem) => {
    setActiveDraft({
      type: 'email',
      title: `Follow-up on ${item.title}`,
      recipient: item.person || 'Team',
      subject: `Follow-up: Status of "${item.title}"`,
      body: `Hi ${item.person ? item.person.split(' ')[0] : 'Team'},\n\nChecking in on our commitment from ${item.previousMeetingTitle} regarding "${item.title}".\n\nContext:\n"${item.previousEvidence.quote}"\n\nPlease let us know if there are any blockers or if an updated timeline is needed.\n\nBest,\nMindSync AI Follow-Up Agent`,
      taskRef: item.title,
    });
  };

  const handleOpenMeeting = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setResultsTab('overview');
    setPage('results');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
            Features 15 & 16 · Cross-Meeting Intelligence
          </span>
          <span className="text-xs text-slate-400">Remembering Commitments Across Time</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
          Cross-Meeting Follow-Ups & Missed Commitments
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          MindSync compares what was promised in earlier meetings with what was delivered later, highlighting missed dates, shifted deadlines, and reversed decisions.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { key: 'all', label: 'All Follow-Ups', count: followUps.length },
          { key: 'missed_commitment', label: 'Missed Commitments', count: followUps.filter((f) => f.type === 'missed_commitment').length },
          { key: 'deadline_changed', label: 'Changed Deadlines', count: followUps.filter((f) => f.type === 'deadline_changed').length },
          { key: 'decision_reversed', label: 'Reversed Decisions', count: followUps.filter((f) => f.type === 'decision_reversed').length },
          { key: 'unresolved_question', label: 'Unresolved Questions', count: followUps.filter((f) => f.type === 'unresolved_question').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
              filter === tab.key
                ? 'bg-indigo-700 text-indigo-100'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Follow-Up Evolution Cards */}
      <div className="space-y-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl p-6 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-5"
          >
            {/* Top row: Title, Badges, Draft Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h3>
                  {item.person && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      Owner: {item.person}
                    </span>
                  )}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      item.type === 'missed_commitment'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : item.type === 'deadline_changed'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : item.type === 'decision_reversed'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                    }`}
                  >
                    {item.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                    Status: {item.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDraftFollowup(item)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Draft Follow-Up</span>
                </button>
              </div>
            </div>

            {/* Side-by-Side Evolutionary Comparison (Previous vs Current) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Box 1: Previous Meeting Commitment */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200/70 dark:border-slate-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                    Previous Meeting
                  </span>
                  <button
                    onClick={() => handleOpenMeeting(item.previousMeetingId)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
                  >
                    <span>{item.previousMeetingTitle}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="relative pt-1">
                  <p className="text-xs font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed">
                    "{item.previousEvidence.quote}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/50 text-[11px] text-slate-400">
                  <span>{item.previousEvidence.speaker} · {item.previousEvidence.timestamp}</span>
                  <button
                    onClick={() => setActiveEvidence(item.previousEvidence)}
                    className="text-indigo-500 hover:underline font-medium"
                  >
                    [View Evidence]
                  </button>
                </div>
              </div>

              {/* Box 2: Current / Subsequent Status */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200/70 dark:border-slate-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                    Subsequent Update
                  </span>
                  {item.currentMeetingId && (
                    <button
                      onClick={() => handleOpenMeeting(item.currentMeetingId!)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
                    >
                      <span>{item.currentMeetingTitle}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="relative pt-1">
                  <p className="text-xs font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed">
                    {item.currentEvidence ? `"${item.currentEvidence.quote}"` : 'Status verified in launch review.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/50 text-[11px] text-slate-400">
                  <span>{item.currentEvidence?.speaker || 'Team'} · {item.currentEvidence?.timestamp || 'Confirmed'}</span>
                  {item.currentEvidence && (
                    <button
                      onClick={() => setActiveEvidence(item.currentEvidence!)}
                      className="text-indigo-500 hover:underline font-medium"
                    >
                      [View Evidence]
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
