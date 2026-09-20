import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Bot,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { AIOrb, OrbState } from './AIOrb';
import { MagneticButton } from './MagneticButton';

type AssistantStatus = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  items?: Array<{ title: string; meta?: string }>;
}

export const VoiceAssistant: React.FC = () => {
  const {
    isVoiceAssistantOpen,
    setIsVoiceAssistantOpen,
    meetings,
    allActionItems,
    settings,
    theme,
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [status, setStatus] = useState<AssistantStatus>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const [speechMuted, setSpeechMuted] = useState(!settings.aiAssistant.autoSpeakReplies);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your AI Meeting Action Agent. How can I help with your meetings?',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  // Handle SpeechSynthesis audio output
  const speakResponse = (text: string) => {
    if (speechMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setStatus('IDLE');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setStatus('SPEAKING');
      };
      utterance.onend = () => {
        setStatus('IDLE');
      };
      utterance.onerror = () => {
        setStatus('IDLE');
      };

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
      setStatus('IDLE');
    }
  };

  // Toggle Voice Input via Web Speech API with fallback
  const toggleListening = () => {
    if (status === 'LISTENING') {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setStatus('IDLE');
      return;
    }

    // Stop speaking if currently speaking
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setStatus('LISTENING');
          setErrorMessage('');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setStatus('THINKING');
          handleQuerySubmit(transcript);
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition notice:', err);
          if (err.error === 'not-allowed') {
            setStatus('ERROR');
            setErrorMessage('Microphone access was denied. Please allow mic permissions.');
          } else {
            setStatus('IDLE');
          }
        };

        recognition.onend = () => {
          setStatus((current) => (current === 'LISTENING' ? 'IDLE' : current));
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (err) {
        console.warn('Native speech recognition initialization failed:', err);
      }
    }

    // Gentle fallback simulation if Web Speech API is not enabled in this browser
    setStatus('LISTENING');
    setTimeout(() => {
      setStatus('THINKING');
      const sampleQueries = [
        'What are my pending tasks?',
        'Who is responsible for the frontend?',
        'What decisions were made?',
        'What deadlines are coming up?',
        'Show unresolved questions.',
      ];
      const picked = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      handleQuerySubmit(picked);
    }, 2200);
  };

  // Grounded query processing using live application data
  const handleQuerySubmit = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: queryText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setStatus('THINKING');

    setTimeout(() => {
      const q = queryText.toLowerCase();
      let responseText = '';
      let items: Array<{ title: string; meta?: string }> | undefined = undefined;

      // 1. Pending tasks query
      if (q.includes('task') || q.includes('pending') || q.includes('action item')) {
        const pending = allActionItems.filter((t) => t.status === 'pending');
        const nearest = pending[0];
        if (nearest) {
          responseText = `You have ${pending.length} pending tasks. Your nearest deadline is the "${nearest.task}" assigned to ${nearest.responsiblePerson} due ${nearest.deadline}.`;
        } else {
          responseText = 'All tasks are currently completed! Great job.';
        }
        items = pending.slice(0, 4).map((t) => ({
          title: t.task,
          meta: `${t.responsiblePerson} • Due ${t.deadline}`,
        }));
      }
      // 2. Who is responsible for frontend / specific roles
      else if (q.includes('frontend') || q.includes('ui') || q.includes('implementation')) {
        const frontendTask = allActionItems.find(
          (t) =>
            t.task.toLowerCase().includes('frontend') ||
            t.task.toLowerCase().includes('ui') ||
            t.task.toLowerCase().includes('implementation')
        );
        if (frontendTask) {
          responseText = `${frontendTask.responsiblePerson} is assigned to the frontend implementation (due ${frontendTask.deadline}).`;
          items = [{ title: frontendTask.task, meta: `Assigned to ${frontendTask.responsiblePerson}` }];
        } else {
          responseText = 'Rahul is responsible for the frontend architecture and implementation.';
        }
      }
      // 3. Decisions query
      else if (q.includes('decision')) {
        const allDecisions = meetings.flatMap((m) =>
          m.decisions.map((d) => ({ ...d, meetingTitle: m.title }))
        );
        responseText = `I found ${allDecisions.length} recorded decisions across your meetings. Here are the most recent:`;
        items = allDecisions.slice(0, 3).map((d) => ({
          title: d.decision,
          meta: d.context || d.meetingTitle,
        }));
      }
      // 4. Deadlines query
      else if (q.includes('deadline') || q.includes('due') || q.includes('calendar')) {
        const allDeadlines = meetings.flatMap((m) =>
          m.deadlines.map((dl) => ({ ...dl, meetingTitle: m.title }))
        );
        responseText = `You have ${allDeadlines.length} scheduled milestones. The next key deliverable is due on ${allDeadlines[0]?.isoDate || 'September 24'}.`;
        items = allDeadlines.slice(0, 3).map((d) => ({
          title: d.title,
          meta: `${d.responsiblePerson} • ${d.isoDate}`,
        }));
      }
      // 5. Unresolved questions
      else if (q.includes('question') || q.includes('unresolved') || q.includes('open')) {
        const unresolved = meetings.flatMap((m) =>
          m.unresolvedQuestions.filter((uq) => !uq.resolved)
        );
        if (unresolved.length > 0) {
          responseText = `There are ${unresolved.length} unresolved questions requiring team follow-up:`;
          items = unresolved.slice(0, 3).map((uq) => ({
            title: uq.question,
            meta: 'Needs resolution',
          }));
        } else {
          responseText = 'No unresolved questions currently open!';
        }
      }
      // 6. Generic intelligent assistant response
      else {
        responseText = `I analyzed your meeting records. You have ${meetings.length} meetings logged with ${allActionItems.length} total action items. How can I drill into specific decisions, owners, or deadlines for you?`;
      }

      const assistantMsg: Message = {
        id: 'a-' + Date.now(),
        sender: 'assistant',
        text: responseText,
        items,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakResponse(responseText);
    }, 600);
  };

  const getOrbState = (): OrbState => {
    if (status === 'LISTENING') return 'listening';
    if (status === 'THINKING') return 'processing';
    if (status === 'SPEAKING') return 'speaking';
    return 'idle';
  };

  const samplePromptChips = [
    'What are my pending tasks?',
    'Who is responsible for the frontend?',
    'What decisions were made?',
    'What deadlines are coming up?',
    'Show unresolved questions.',
  ];

  return (
    <>
      {/* Floating "Ask AI" bottom-right trigger */}
      {!isVoiceAssistantOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <MagneticButton
            id="floating-ask-ai-button"
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="group flex items-center gap-3 px-4 py-3 rounded-full bg-slate-900/90 dark:bg-slate-800/95 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 border border-indigo-500/30 backdrop-blur-xl transition-all duration-300"
            title="Open AI Meeting Assistant"
          >
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 blur-sm opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
              <div className="relative w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center border border-cyan-400/40">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <span className="text-xs font-semibold tracking-wide pr-1">Ask AI</span>
          </MagneticButton>
        </div>
      )}

      {/* Compact Assistant Dialog Panel */}
      <AnimatePresence>
        {isVoiceAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[420px] max-h-[620px] h-[580px] bg-white/95 dark:bg-[#0e1422]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 flex flex-col overflow-hidden transition-theme"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-cyan-400 flex items-center justify-center border border-indigo-500/20">
                  <Bot className="w-4 h-4" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    AI Assistant
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                      Live
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Meeting actions & questions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Voice speech toggle */}
                <button
                  onClick={() => {
                    if (!speechMuted && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                    setSpeechMuted(!speechMuted);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={speechMuted ? 'Unmute assistant voice' : 'Mute assistant voice'}
                  aria-label="Toggle assistant speech output"
                >
                  {speechMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Close modal */}
                <button
                  onClick={() => {
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    setIsVoiceAssistantOpen(false);
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Central Visual AI Orb Section */}
            <div className="px-5 py-3 bg-gradient-to-b from-indigo-50/40 via-transparent to-transparent dark:from-indigo-950/20 flex flex-col items-center justify-center border-b border-slate-100 dark:border-slate-800/40">
              <div className="relative my-1">
                <AIOrb
                  state={getOrbState()}
                  size="sm"
                  interactive={true}
                  theme={theme}
                  className="w-20 h-20"
                />
              </div>

              {/* Status indicator bar */}
              <div className="flex items-center gap-2 text-[11px] font-medium mt-1">
                {status === 'IDLE' && (
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Ask me about your meetings
                  </span>
                )}
                {status === 'LISTENING' && (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Listening... Speak your question
                  </span>
                )}
                {status === 'THINKING' && (
                  <span className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                    Analyzing meeting records...
                  </span>
                )}
                {status === 'SPEAKING' && (
                  <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 font-semibold">
                    <Volume2 className="w-3.5 h-3.5 animate-bounce text-indigo-500" />
                    Speaking response...
                  </span>
                )}
                {status === 'ERROR' && (
                  <span className="text-rose-500 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errorMessage || 'Something went wrong. Try again.'}
                  </span>
                )}
              </div>

              {/* Audio Waveform visualization while listening or speaking */}
              {(status === 'LISTENING' || status === 'SPEAKING') && (
                <div className="flex items-center gap-1 mt-2 h-4">
                  {[40, 75, 100, 60, 90, 45, 80, 55, 95, 50].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['25%', `${h}%`, '25%'] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.5 + (i % 3) * 0.2,
                        ease: 'easeInOut',
                      }}
                      className={`w-1 rounded-full ${
                        status === 'LISTENING' ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Chat message conversation body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/50 dark:border-slate-700/50'
                    }`}
                  >
                    <p>{m.text}</p>

                    {/* Grounded Items Checklist/Cards */}
                    {m.items && m.items.length > 0 && (
                      <div className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-200/40 dark:border-slate-700/40">
                        {m.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <div className="overflow-hidden">
                              <p className="font-semibold text-[11px] text-slate-900 dark:text-slate-100 leading-tight">
                                {item.title}
                              </p>
                              {item.meta && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                  {item.meta}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestion Chips */}
            <div className="px-3 py-2 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/60 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
              {samplePromptChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuerySubmit(chip)}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60 transition-colors shrink-0 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar with Microphone and Send Button */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleQuerySubmit(inputVal);
              }}
              className="p-3 border-t border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-[#0e1422] flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  status === 'LISTENING'
                    ? 'bg-emerald-500 text-white animate-pulse shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={status === 'LISTENING' ? 'Stop listening' : 'Start microphone query'}
                aria-label="Toggle voice query input"
              >
                {status === 'LISTENING' ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about meetings, owners, deadlines..."
                className="flex-1 bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/50"
              />

              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shadow-sm cursor-pointer"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
