import React, { useRef } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  MessageSquare,
  Database,
  ArrowDown,
  GitCommit,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  History,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AIOrb } from '../components/AIOrb';
import { ThemeToggle } from '../components/ThemeToggle';
import { MagneticButton } from '../components/MagneticButton';
import { NeuralBackground3D } from '../components/NeuralBackground3D';
import { CursorGlow } from '../components/CursorGlow';

export const LandingPage: React.FC = () => {
  const { setPage, theme } = useApp();
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] dark:bg-[#05070d] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden transition-theme">
      {/* Dynamic 3D Neural Background & Desktop Cursor Glow (Preserved 3D Scene) */}
      <NeuralBackground3D page="landing" />
      <CursorGlow />

      {/* Top Navbar */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 py-6 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => setPage('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              MINDSYNC
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-cyan-300 border border-indigo-500/30">
                AI
              </span>
            </span>
          </div>
        </div>

        {/* Minimal Landing Navigation */}
        <nav className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={scrollToHowItWorks}
            className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-300 transition-colors cursor-pointer hidden sm:block"
          >
            How It Works
          </button>
          <ThemeToggle />
          <button
            id="nav-login-btn"
            onClick={() => setPage('login')}
            className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white px-3 sm:px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Login
          </button>
          <MagneticButton
            id="nav-get-started-btn"
            onClick={() => setPage('login')}
            className="text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-200 cursor-pointer"
          >
            Get Started
          </MagneticButton>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-8 sm:pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[520px]">
          {/* LEFT SIDE: Typography & Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-7 text-left"
          >
            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 text-indigo-700 dark:text-cyan-300 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
              <span>MINDSYNC AI</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Turn Every Meeting{' '}
              <span className="block mt-1 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 dark:from-indigo-300 dark:via-cyan-200 dark:to-indigo-100 bg-clip-text text-transparent">
                Into Action.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300/90 font-normal leading-relaxed max-w-xl">
              MindSync understands your meetings, remembers what was promised, tracks what changed,
              and makes sure important work doesn't get forgotten.
            </p>

            {/* Primary & Secondary Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <MagneticButton
                id="hero-get-started-btn"
                onClick={() => setPage('login')}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/45 transition-all cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>

              <button
                id="hero-see-how-it-works-btn"
                onClick={scrollToHowItWorks}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/80 dark:bg-[#0b1020]/80 hover:bg-white dark:hover:bg-[#101625] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-sm transition-all cursor-pointer shadow-sm hover:border-slate-300 dark:hover:border-slate-700 backdrop-blur-md"
              >
                <span>See How It Works</span>
              </button>
            </div>

            {/* Micro proof points */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Remembers past decisions
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tracks missed commitments
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Verifiable audio evidence
              </span>
            </div>
          </motion.div>

          {/* RIGHT / CENTER: The Prominent 3D Animated MindSync Visual Hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col items-center justify-center relative py-6"
          >
            <div className="relative w-full aspect-square max-w-[440px] flex items-center justify-center">
              {/* The 3D Interactive AI Intelligence Orb Hero */}
              <AIOrb size="hero" state="idle" theme={theme} interactive={true} />

              {/* Ambient Glass Information Badge */}
              <div className="absolute -bottom-2 px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-[#0b1020]/80 border border-slate-200/80 dark:border-slate-800/90 backdrop-blur-xl shadow-xl flex items-center gap-3 pointer-events-none">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                    Cross-Meeting Neural Memory
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Remembers what happened &amp; what changed
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* SUBTLE PRODUCT MESSAGE SECTION */}
        <section
          ref={howItWorksRef}
          className="mt-28 pt-16 border-t border-slate-200/80 dark:border-slate-800/80"
        >
          {/* Small core headline */}
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-cyan-400">
              BEYOND THE MEETING
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
              MindSync remembers the conversation beyond the meeting.
            </h2>
          </div>

          {/* Three Minimal Visual Concepts: MEETING ↓ MEMORY ↓ FOLLOW-UP */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative items-stretch">
              {/* Concept 1: MEETING */}
              <div className="p-6 rounded-2xl bg-white/70 dark:bg-[#0b1020]/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md flex flex-col items-center text-center shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-sm tracking-wider uppercase text-slate-900 dark:text-white mb-1.5">
                  MEETING
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Audio, video, or raw transcript ingested with speaker attribution and context.
                </p>
              </div>

              {/* Concept 2: MEMORY */}
              <div className="p-6 rounded-2xl bg-white/70 dark:bg-[#0b1020]/70 border border-indigo-500/30 dark:border-indigo-500/30 backdrop-blur-md flex flex-col items-center text-center shadow-sm relative">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-sm tracking-wider uppercase text-indigo-600 dark:text-cyan-300 mb-1.5">
                  MEMORY
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Connects promises, decisions, and deadline shifts across successive team syncs.
                </p>
              </div>

              {/* Concept 3: FOLLOW-UP */}
              <div className="p-6 rounded-2xl bg-white/70 dark:bg-[#0b1020]/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md flex flex-col items-center text-center shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                  <GitCommit className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-sm tracking-wider uppercase text-slate-900 dark:text-white mb-1.5">
                  FOLLOW-UP
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Surfaces missed commitments, answers cross-meeting questions, and drafts actions.
                </p>
              </div>
            </div>
          </div>

          {/* MAIN PRODUCT IDENTITY: What MindSync Remembers */}
          <div className="max-w-3xl mx-auto mt-16 p-8 sm:p-10 rounded-3xl bg-white/60 dark:bg-[#0b1020]/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-lg">
            <div className="text-center mb-8">
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-cyan-400">
                CORE PRODUCT IDENTITY
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
                MindSync is not just another meeting transcription tool.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
                It preserves continuity by actively remembering:
              </p>
            </div>

            {/* Progression Sequence */}
            <div className="space-y-3">
              {/* 1. What was said */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#101625]/80 border border-slate-200/60 dark:border-slate-800/60">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    WHAT WAS SAID
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    — Full transcript with speaker attribution and context
                  </span>
                </div>
              </div>

              <div className="flex justify-center text-slate-400 dark:text-slate-600">
                <ArrowDown className="w-4 h-4" />
              </div>

              {/* 2. What was promised */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#101625]/80 border border-slate-200/60 dark:border-slate-800/60">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    WHAT WAS PROMISED
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    — Explicit ownership and deadline commitments with confidence scores
                  </span>
                </div>
              </div>

              <div className="flex justify-center text-slate-400 dark:text-slate-600">
                <ArrowDown className="w-4 h-4" />
              </div>

              {/* 3. What was decided */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#101625]/80 border border-slate-200/60 dark:border-slate-800/60">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    WHAT WAS DECIDED
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    — Concrete decisions separated from general exploratory discussions
                  </span>
                </div>
              </div>

              <div className="flex justify-center text-slate-400 dark:text-slate-600">
                <ArrowDown className="w-4 h-4" />
              </div>

              {/* 4. What changed */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#101625]/80 border border-slate-200/60 dark:border-slate-800/60">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    WHAT CHANGED
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    — Reversed decisions (e.g. PostgreSQL → MongoDB) and slipped deadlines
                  </span>
                </div>
              </div>

              <div className="flex justify-center text-slate-400 dark:text-slate-600">
                <ArrowDown className="w-4 h-4" />
              </div>

              {/* 5. What is still unfinished */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#101625]/80 border border-rose-500/30 dark:border-rose-500/30">
                <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold">
                  5
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    WHAT IS STILL UNFINISHED
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    — Unresolved questions and overdue tasks carried across meetings
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="mt-8 text-center pt-4">
              <MagneticButton
                onClick={() => setPage('login')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Experience MindSync Memory</span>
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 dark:border-slate-800/80 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 MindSync AI. Cross-meeting memory &amp; accountability intelligence.</p>
      </footer>
    </div>
  );
};

