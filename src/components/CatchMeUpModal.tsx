import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, AlertTriangle, GitCompare, HelpCircle, X, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CatchMeUpModal: React.FC = () => {
  const { activeCatchMeUpMeetingId, setActiveCatchMeUpMeetingId, meetings, addToast } = useApp();

  if (!activeCatchMeUpMeetingId) return null;

  const meeting = meetings.find((m) => m.id === activeCatchMeUpMeetingId) || meetings[0];
  const catchMeUp = meeting.catchMeUp || {
    meetingId: meeting.id,
    meetingTitle: meeting.title,
    date: meeting.date,
    whatHappened: [meeting.summary],
    keyDecisions: meeting.decisions.map((d) => d.decision),
    tasksAssigned: meeting.actionItems.map((a) => `${a.responsiblePerson}: ${a.task}`),
    changesSincePrevious: ['No major breaking changes from previous sync.'],
    unresolvedIssues: meeting.unresolvedQuestions.map((q) => q.question),
  };

  const handleExportSummary = () => {
    const text = `# Catch Me Up: ${meeting.title} (${meeting.date})\n\n` +
      `## 1. What Happened\n${catchMeUp.whatHappened.map(p => `• ${p}`).join('\n')}\n\n` +
      `## 2. Key Decisions\n${catchMeUp.keyDecisions.map(p => `• ${p}`).join('\n')}\n\n` +
      `## 3. Tasks Assigned\n${catchMeUp.tasksAssigned.map(p => `• ${p}`).join('\n')}\n\n` +
      `## 4. Changes Since Previous Meeting\n${catchMeUp.changesSincePrevious.map(p => `• ${p}`).join('\n')}\n\n` +
      `## 5. Unresolved Issues\n${catchMeUp.unresolvedIssues.map(p => `• ${p}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    addToast('Summary Copied', 'Markdown summary copied to clipboard.', 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActiveCatchMeUpMeetingId(null)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Catch Me Up: {meeting.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {meeting.date} · Everything you need to know in under 60 seconds
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveCatchMeUpMeetingId(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Sections */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* 1. What Happened */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                What Happened
              </h4>
              <ul className="space-y-1.5 bg-slate-50 dark:bg-[#101625] p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/60">
                {catchMeUp.whatHappened.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Key Decisions */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Key Decisions Made
              </h4>
              <ul className="space-y-1.5 bg-emerald-500/5 dark:bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20">
                {catchMeUp.keyDecisions.map((item, idx) => (
                  <li key={idx} className="text-xs text-emerald-900 dark:text-emerald-300 font-medium leading-relaxed flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Tasks Assigned */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Tasks & Commitments Assigned
              </h4>
              <div className="space-y-1.5">
                {catchMeUp.tasksAssigned.map((task, idx) => (
                  <div key={idx} className="text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-[#101625] border border-slate-200/70 dark:border-slate-800/60 text-slate-800 dark:text-slate-200">
                    {task}
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Changes Since Previous Meeting */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <GitCompare className="w-3.5 h-3.5 text-amber-500" />
                What Changed Since Last Meeting
              </h4>
              <ul className="space-y-1.5 bg-amber-500/5 dark:bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20">
                {catchMeUp.changesSincePrevious.map((change, idx) => (
                  <li key={idx} className="text-xs text-amber-900 dark:text-amber-300 font-medium leading-relaxed flex items-start gap-2">
                    <span className="text-amber-500 font-bold">→</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Unresolved Issues */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
                Unresolved Issues
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200/70 dark:border-slate-800/60">
                {catchMeUp.unresolvedIssues.length > 0 ? (
                  <ul className="space-y-1.5">
                    {catchMeUp.unresolvedIssues.map((issue, idx) => (
                      <li key={idx} className="text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ All questions and blockers have been resolved!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
            <button
              onClick={() => setActiveCatchMeUpMeetingId(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Close
            </button>
            <button
              onClick={handleExportSummary}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Copy Catch Me Up Summary</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
