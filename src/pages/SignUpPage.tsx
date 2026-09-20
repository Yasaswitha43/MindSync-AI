import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, BrainCircuit } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AIOrb } from '../components/AIOrb';
import { ThemeToggle } from '../components/ThemeToggle';
import { MagneticButton } from '../components/MagneticButton';
import { TiltCard } from '../components/TiltCard';
import { NeuralBackground3D } from '../components/NeuralBackground3D';
import { CursorGlow } from '../components/CursorGlow';

export const SignUpPage: React.FC = () => {
  const { setPage, login, theme } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || 'alex.rivera@mindsync.ai', name || 'Alex Rivera');
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] dark:bg-[#05070d] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200 transition-theme overflow-hidden">
      <NeuralBackground3D page="signup" />
      <CursorGlow />

      <div className="relative z-10 max-w-7xl w-full mx-auto p-6 flex items-center justify-between">
        <button
          onClick={() => setPage('landing')}
          className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <ThemeToggle />
      </div>

      <div className="relative z-10 max-w-4xl w-full mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="hidden md:flex flex-col items-center text-center space-y-4">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <AIOrb size="md" state="idle" theme={theme} />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
              Join MindSync AI
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
            Eliminate notes, remember past promises, and keep your teams aligned across every meeting.
          </p>
        </div>

        <TiltCard className="p-8 rounded-3xl bg-white/90 dark:bg-[#0b1020]/90 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Create Account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Start transforming your meeting audio and transcripts today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Alex Rivera"
                  className="w-full bg-slate-50 dark:bg-[#101625] border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="alex.rivera@mindsync.ai"
                  className="w-full bg-slate-50 dark:bg-[#101625] border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-[#101625] border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <MagneticButton
              id="signup-submit-btn"
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer mt-2"
            >
              Create Account
            </MagneticButton>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <button
              onClick={() => setPage('login')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </TiltCard>
      </div>

      <div className="relative z-10 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Enterprise grade end-to-end encryption.
      </div>
    </div>
  );
};
