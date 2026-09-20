import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AIOrb } from '../components/AIOrb';
import { Meeting } from '../types';
import { analyzeMeetingData } from '../utils/aiAnalysisEngine';

interface Stage {
  label: string;
  detail: string;
}

const processingStages: Stage[] = [
  { label: 'Processing recording', detail: 'Transcribing 16kHz audio tokens and mapping speaker voices' },
  { label: 'Understanding conversation', detail: 'Extracting semantic context and core discussion themes' },
  { label: 'Detecting decisions', detail: 'Pinpointing unanimous agreements and strategic direction' },
  { label: 'Extracting action items', detail: 'Parsing committed tasks and explicit team assignees' },
  { label: 'Finding deadlines', detail: 'Correlating calendar timelines and scheduled deliverables' },
  { label: 'Identifying unresolved questions', detail: 'Surfacing open debates and blocking dependencies' },
];

export const AIProcessingPage: React.FC = () => {
  const {
    setPage,
    processingMeetingData,
    addMeeting,
    setSelectedMeetingId,
    setResultsTab,
    addToast,
    theme,
  } = useApp();

  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    // Progress through stages sequentially
    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < processingStages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stageInterval);
          // Complete analysis and transition to Results page
          setTimeout(() => {
            const meetingId = 'meet-custom-' + Date.now();
            const newMeeting = analyzeMeetingData(
              processingMeetingData || {
                title: 'Q4 Strategy & Action Alignment',
                fileName: 'meeting_recording.mp3',
                fileType: 'audio',
              },
              meetingId
            );

            addMeeting(newMeeting);
            setSelectedMeetingId(meetingId);
            setResultsTab('overview');
            setPage('results');
            addToast(
              'Analysis Complete',
              `Parsed ${newMeeting.decisions.length} decisions and ${newMeeting.actionItems.length} actions for "${newMeeting.title}"`,
              'success'
            );
          }, 800);
          return prev;
        }
      });
    }, 1100);

    return () => clearInterval(stageInterval);
  }, [processingMeetingData, addMeeting, setSelectedMeetingId, setResultsTab, setPage, addToast]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-8 animate-in fade-in duration-300">
      {/* 3D AI Orb Centerpiece reacting in 'processing' state */}
      <div className="relative mb-6">
        <AIOrb size="lg" state="processing" theme={theme} />
      </div>

      {/* Heading */}
      <div className="space-y-2 max-w-md mx-auto mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
          Understanding your meeting...
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Synthesizing dialogue, discerning commitments, and structuring action items
        </p>
      </div>

      {/* Progress Stages List */}
      <div className="w-full max-w-md bg-white dark:bg-[#0f1422] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-3.5 text-left transition-theme">
        {processingStages.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isPending = idx > currentStageIndex;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: isCurrent || isDone ? 1 : 0.45 }}
              className={`flex items-start gap-3 text-xs transition-colors duration-300 ${
                isCurrent ? 'font-semibold' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400">
                    ◌
                  </div>
                )}
              </div>

              <div className="flex-1">
                <span
                  className={`${
                    isDone
                      ? 'text-slate-700 dark:text-slate-200'
                      : isCurrent
                      ? 'text-indigo-600 dark:text-indigo-300'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {stage.label}
                </span>
                {isCurrent && (
                  <p className="text-[11px] text-slate-400 font-normal mt-0.5 animate-pulse">
                    {stage.detail}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
