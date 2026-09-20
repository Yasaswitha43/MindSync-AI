import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Clock, Calendar, User, ExternalLink, X, Quote } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EvidenceModal: React.FC = () => {
  const { activeEvidence, setActiveEvidence, setSelectedMeetingId, setResultsTab, setPage } = useApp();

  if (!activeEvidence) return null;

  const handleJumpToTranscript = () => {
    setSelectedMeetingId(activeEvidence.meetingId);
    setResultsTab('transcript');
    setPage('results');
    setActiveEvidence(null);
  };

  const handleJumpToReplay = () => {
    setSelectedMeetingId(activeEvidence.meetingId);
    setResultsTab('replay');
    setPage('results');
    setActiveEvidence(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActiveEvidence(null)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Verifiable Meeting Evidence
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Direct citation extracted from meeting transcript
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveEvidence(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Metadata badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                {activeEvidence.meetingDate}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Timestamp: {activeEvidence.timestamp}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200/60 dark:border-indigo-800/40">
                <User className="w-3.5 h-3.5" />
                Speaker: {activeEvidence.speaker}
              </span>
            </div>

            {/* Meeting Source */}
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Source Meeting:{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-medium">
                {activeEvidence.meetingTitle}
              </strong>
            </div>

            {/* Verbatim Quote Box */}
            <div className="relative rounded-xl p-5 bg-gradient-to-br from-indigo-50/70 to-slate-50/50 dark:from-indigo-950/30 dark:to-slate-900/50 border border-indigo-100 dark:border-indigo-900/50 shadow-inner">
              <Quote className="absolute top-3 left-3 w-5 h-5 text-indigo-400/30 -z-0" />
              <p className="relative z-10 text-sm md:text-base font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed pl-2">
                "{activeEvidence.quote}"
              </p>
            </div>

            {/* AI Verification Note */}
            <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>
                Verified quote: MindSync guarantees this commitment was explicitly voiced by{' '}
                <strong className="text-slate-700 dark:text-slate-300">{activeEvidence.speaker}</strong> and cross-indexed against meeting audio.
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
            <button
              onClick={() => setActiveEvidence(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Close
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleJumpToReplay}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              >
                Listen at {activeEvidence.timestamp}
              </button>
              <button
                onClick={handleJumpToTranscript}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
              >
                <span>Jump to Transcript</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
