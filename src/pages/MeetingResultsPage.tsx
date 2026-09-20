import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  HelpCircle,
  FileText,
  CheckSquare,
  ShieldCheck,
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  ArrowRight,
  GitCompare,
  MessageSquare,
  ChevronRight,
  Quote,
  AlertTriangle,
  ExternalLink,
  Plus,
  Share2,
  Download,
  ListRestart,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResultsTab, ActionItem, Decision, AIChapter, TranscriptSegment } from '../types';

export const MeetingResultsPage: React.FC = () => {
  const {
    currentMeeting,
    resultsTab,
    setResultsTab,
    toggleTaskStatus,
    setActiveEvidence,
    setActiveDraft,
    setActiveCatchMeUpMeetingId,
    playbackSecond,
    setPlaybackSecond,
    isPlayingMeetingAudio,
    setIsPlayingMeetingAudio,
    markSensitiveAlertReviewed,
    removeSensitiveFromSummary,
    addToast,
    followUps,
    setSelectedMeetingId,
    setPage,
  } = useApp();

  const meeting = currentMeeting;

  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [filterSpeaker, setFilterSpeaker] = useState<string>('all');
  const [transcriptSearch, setTranscriptSearch] = useState('');

  if (!meeting) {
    return (
      <div className="p-8 text-center text-slate-500">
        No meeting selected.
      </div>
    );
  }

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeekChapter = (chapter: AIChapter) => {
    setPlaybackSecond(chapter.seconds);
    setIsPlayingMeetingAudio(true);
    addToast('Jumped to Chapter', chapter.title, 'info');
  };

  const handleSeekTranscript = (seg: TranscriptSegment) => {
    if (seg.seconds !== undefined) {
      setPlaybackSecond(seg.seconds);
      setIsPlayingMeetingAudio(true);
    }
  };

  const handleDraftTaskAction = (action: ActionItem) => {
    setActiveDraft({
      type: 'email',
      title: `Task Update: ${action.task}`,
      recipient: action.responsiblePerson !== 'Owner not identified' ? action.responsiblePerson : 'Team',
      subject: `Action Item: ${action.task}`,
      body: `Hi ${action.responsiblePerson !== 'Owner not identified' ? action.responsiblePerson.split(' ')[0] : 'Team'},\n\nFollowing up on "${action.task}" from ${meeting.title}.\n\nTarget Deadline: ${action.currentDeadline}\nStatus: ${action.status}\n\nEvidence quote:\n"${action.evidence?.quote || action.commitmentQuote || 'Recorded during meeting'}"\n\nPlease let us know if you need any unblocking.\n\nBest,\nMindSync AI Follow-Up Agent`,
      taskRef: action.task,
    });
  };

  // Cross-meeting follow-ups relevant to this meeting
  const relevantFollowUps = followUps.filter(
    (f) => f.previousMeetingId === meeting.id || f.currentMeetingId === meeting.id
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      {/* 1. Sensitive Information Alert Banner (Feature 20) */}
      {meeting.sensitiveAlerts && meeting.sensitiveAlerts.length > 0 && (
        <div className="rounded-2xl p-4 sm:p-5 bg-rose-500/10 border border-rose-500/30 text-slate-900 dark:text-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                  Sensitive Information Detected in Audio (Feature 20)
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold font-mono">
                  Timestamp: {meeting.sensitiveAlerts[0].location}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                {meeting.sensitiveAlerts[0].text}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Review this sensitive credential before sharing transcript summaries publicly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => removeSensitiveFromSummary(meeting.id, meeting.sensitiveAlerts![0].id)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all cursor-pointer"
            >
              Redact Credential
            </button>
            <button
              onClick={() => markSensitiveAlertReviewed(meeting.id, meeting.sensitiveAlerts![0].id)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              Meeting Workspace
            </span>
            <span className="text-slate-400">·</span>
            <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {meeting.date}
            </span>
            <span className="text-slate-400">·</span>
            <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {meeting.durationMinutes} mins
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            {meeting.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Participants:
            </span>
            {meeting.participants.map((p) => (
              <span
                key={p.id}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium border border-slate-200/60 dark:border-slate-800"
              >
                {p.name} {p.role ? `(${p.role})` : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Header CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveCatchMeUpMeetingId(meeting.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catch Me Up</span>
          </button>
        </div>
      </div>

      {/* 3. Navigation Tabs (Overview, Replay, Transcript, Actions, Decisions, Follow-Ups) */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto pb-1">
        {[
          { key: 'overview', label: 'Overview', icon: FileText },
          { key: 'replay', label: 'Replay & Chapters', icon: Play },
          { key: 'transcript', label: 'Transcript', icon: Quote },
          { key: 'actions', label: `Actions (${meeting.actionItems.length})`, icon: CheckSquare },
          { key: 'decisions', label: `Decisions (${meeting.decisions.length})`, icon: CheckCircle2 },
          { key: 'followups', label: `Follow-Ups (${relevantFollowUps.length})`, icon: GitCompare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = resultsTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setResultsTab(tab.key as ResultsTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================== */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================== */}
      {resultsTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Summary Card */}
          <div className="rounded-2xl p-6 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Meeting Summary (Feature 3)
              </h3>
              <button
                onClick={() => setActiveCatchMeUpMeetingId(meeting.id)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
              >
                <span>View Full Catch Me Up</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
              {meeting.summary}
            </p>
          </div>

          {/* Key Discussion Points & Important Outcomes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Discussion Points */}
            <div className="rounded-2xl p-6 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                Key Discussion Points
              </h3>
              <ul className="space-y-2">
                {meeting.keyDiscussionPoints.map((point, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                    <span className="text-cyan-500 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Important Outcomes */}
            <div className="rounded-2xl p-6 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Important Outcomes
              </h3>
              <ul className="space-y-2">
                {meeting.importantOutcomes.map((outcome, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Unresolved Questions in this Meeting (Feature 7) */}
          <div className="rounded-2xl p-6 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                Unresolved Questions & Ownership (Feature 7)
              </h3>
              <span className="text-xs text-slate-400">
                {meeting.unresolvedQuestions.filter((q) => !q.resolved).length} open
              </span>
            </div>

            <div className="space-y-3">
              {meeting.unresolvedQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200/70 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {q.question}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded font-semibold ${
                          q.resolved
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {q.resolved ? 'Resolved' : 'Owner not identified'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {q.context}
                    </p>
                    {q.resolvedAnswer && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Resolution: {q.resolvedAnswer}
                      </p>
                    )}
                  </div>

                  {q.evidence && (
                    <button
                      onClick={() => setActiveEvidence(q.evidence!)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                    >
                      [View Evidence]
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: REPLAY & AI CHAPTERS (Feature 19) */}
      {/* ========================================== */}
      {resultsTab === 'replay' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Audio Player Card */}
          <div className="rounded-2xl p-6 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Feature 19 · Meeting Replay
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  Audio Recording & AI Chapters
                </h3>
              </div>

              {/* Playback rate speed pills */}
              <div className="flex items-center gap-1.5">
                {[1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                      playbackRate === rate
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Scrubber & Player Controls */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlayingMeetingAudio(!isPlayingMeetingAudio)}
                  className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 transition-transform active:scale-95 shrink-0"
                >
                  {isPlayingMeetingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <div className="flex-1 space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={meeting.durationMinutes * 60}
                    value={playbackSecond}
                    onChange={(e) => setPlaybackSecond(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{formatTime(playbackSecond)}</span>
                    <span>{meeting.durationMinutes}:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Chapters List */}
          <div className="rounded-2xl p-6 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                AI Generated Chapters
              </h4>
              <span className="text-xs text-slate-400">
                Click any chapter to jump audio & transcript
              </span>
            </div>

            <div className="space-y-2">
              {meeting.chapters && meeting.chapters.map((ch) => {
                const isCurrent = playbackSecond >= ch.seconds && playbackSecond < ch.seconds + 240;
                return (
                  <div
                    key={ch.id}
                    onClick={() => handleSeekChapter(ch)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isCurrent
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500/40 shadow-sm'
                        : 'bg-slate-50/70 dark:bg-[#101625]/70 border-slate-200/70 dark:border-slate-800/60 hover:border-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-200/60 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                        {ch.timestamp}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {ch.title}
                        </p>
                        {ch.summary && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {ch.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 shrink-0">
                      <Play className="w-3 h-3" />
                      <span>Play Chapter</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: TRANSCRIPT (Feature 2) */}
      {/* ========================================== */}
      {resultsTab === 'transcript' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 mr-1 font-medium">Filter Speaker:</span>
              {['all', ...new Set(meeting.transcript.map((t) => t.speaker))].map((spk) => (
                <button
                  key={spk}
                  onClick={() => setFilterSpeaker(spk)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    filterSpeaker === spk
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {spk === 'all' ? 'All Speakers' : spk}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                placeholder="Search transcript text..."
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Transcript Segments List */}
          <div className="space-y-3">
            {meeting.transcript
              .filter((seg) => filterSpeaker === 'all' || seg.speaker === filterSpeaker)
              .filter(
                (seg) =>
                  !transcriptSearch ||
                  seg.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
                  seg.speaker.toLowerCase().includes(transcriptSearch.toLowerCase())
              )
              .map((seg) => (
                <div
                  key={seg.id}
                  onClick={() => handleSeekTranscript(seg)}
                  className="p-4 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-700 transition-colors cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {seg.speaker}
                      </span>
                      <span className="font-mono text-[11px] text-indigo-500 font-semibold px-1.5 py-0.2 rounded bg-indigo-500/10 border border-indigo-500/20">
                        {seg.timestamp}
                      </span>
                    </div>

                    {seg.highlightType && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                          seg.highlightType === 'action'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : seg.highlightType === 'decision'
                            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                            : seg.highlightType === 'sensitive'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {seg.highlightType}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                    {seg.text}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: ACTION ITEMS & COMMITMENT STRENGTH (Features 4, 5, 6, 8, 11, 14) */}
      {/* ========================================== */}
      {resultsTab === 'actions' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Action Items, Commitments & Deadlines
              </h3>
              <p className="text-xs text-slate-400">
                Analyzed with responsible owners, commitment strength, and verifiable citations.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {meeting.actionItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3"
              >
                {/* Top line: Status, Task, Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.status === 'completed'}
                      onChange={() => toggleTaskStatus(item.id)}
                      className="w-4 h-4 rounded mt-0.5 accent-indigo-600 cursor-pointer"
                    />
                    <div>
                      <h4
                        className={`text-sm font-semibold ${
                          item.status === 'completed'
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {item.task}
                      </h4>

                      {/* Owner & Commitment Strength */}
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          Owner:{' '}
                          <strong
                            className={
                              item.responsiblePerson === 'Owner not identified'
                                ? 'text-amber-500 font-bold'
                                : 'text-slate-900 dark:text-white'
                            }
                          >
                            {item.responsiblePerson}
                          </strong>
                        </span>

                        {/* Commitment Strength Badge (Feature 11) */}
                        {item.commitmentStrength && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              item.commitmentStrength === 'strong'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : item.commitmentStrength === 'moderate'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            Commitment: {item.commitmentStrength.toUpperCase()}
                          </span>
                        )}

                        {/* Deadline Status Badge (Feature 6) */}
                        {item.deadlineStatus === 'deadline_changed' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Deadline Changed ({item.originalDeadline} → {item.currentDeadline})
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            Due: {item.currentDeadline}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Draft & View Evidence */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDraftTaskAction(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/40 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3 text-indigo-500" />
                      <span>Do It For Me</span>
                    </button>
                    {item.evidence && (
                      <button
                        onClick={() => setActiveEvidence(item.evidence!)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        [View Evidence]
                      </button>
                    )}
                  </div>
                </div>

                {/* Verbatim quote snippet */}
                {item.commitmentQuote && (
                  <div className="text-xs italic text-slate-500 dark:text-slate-400 pl-7">
                    Spoken commitment: "{item.commitmentQuote}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 5: DECISIONS (Features 9, 12, 13) */}
      {/* ========================================== */}
      {resultsTab === 'decisions' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Decisions vs Discussion vs Reversed Decisions
            </h3>
            <p className="text-xs text-slate-400">
              Captures rationale, previous vs new choices, and conflict history.
            </p>
          </div>

          <div className="space-y-3">
            {meeting.decisions.map((dec) => (
              <div
                key={dec.id}
                className="p-5 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                          dec.type === 'decision_reversed'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                            : dec.type === 'decision'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {dec.type.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {dec.decision}
                      </h4>
                    </div>

                    {/* Conflict & Previous Decision Comparison (Feature 13) */}
                    {dec.previousDecision && (
                      <div className="p-3 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-300 flex items-center gap-2">
                        <GitCompare className="w-4 h-4 text-purple-500 shrink-0" />
                        <span>
                          <strong>Decision Reversed:</strong> Previous choice was{' '}
                          <code className="px-1 py-0.5 rounded bg-purple-500/20 font-mono">
                            {dec.previousDecision}
                          </code>
                          , now switched to{' '}
                          <code className="px-1 py-0.5 rounded bg-purple-500/20 font-mono">
                            {dec.newDecision}
                          </code>
                          .
                        </span>
                      </div>
                    )}

                    {/* Decision Rationale (Feature 12) */}
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                        Rationale:
                      </strong>{' '}
                      {dec.rationale || 'Rationale not explicitly stated.'}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {dec.context}
                    </p>
                  </div>

                  {dec.evidence && (
                    <button
                      onClick={() => setActiveEvidence(dec.evidence!)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 self-start"
                    >
                      [View Evidence]
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 6: FOLLOW-UPS (Feature 15) */}
      {/* ========================================== */}
      {resultsTab === 'followups' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Cross-Meeting Follow-Ups & History
              </h3>
              <p className="text-xs text-slate-400">
                Commitments from earlier meetings that connect directly to this meeting.
              </p>
            </div>
            <button
              onClick={() => setPage('followups')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All App Follow-Ups</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            {relevantFollowUps.map((fu) => (
              <div
                key={fu.id}
                className="p-5 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {fu.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                        {fu.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                        {fu.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {fu.description}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setActiveDraft({
                        type: 'email',
                        title: `Follow-up: ${fu.title}`,
                        recipient: fu.person || 'Team',
                        subject: `Follow-up on ${fu.title}`,
                        body: `Hi ${fu.person || 'Team'},\n\nFollowing up regarding our discussion in ${fu.previousMeetingTitle}.\n\nContext:\n"${fu.previousEvidence.quote}"\n\nPlease let us know the current status.\n\nBest,\nMindSync AI Follow-Up Agent`,
                        taskRef: fu.title,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all shrink-0"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Draft Follow-Up</span>
                  </button>
                </div>

                {/* Evidence citations */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="italic text-slate-500 dark:text-slate-400 line-clamp-1 max-w-lg">
                    "{fu.previousEvidence.quote}"
                  </span>
                  <button
                    onClick={() => setActiveEvidence(fu.previousEvidence)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                  >
                    [View Citation]
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
