import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Mail, Lock, Eye, EyeOff, BrainCircuit } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AIOrb } from '../components/AIOrb';
import { ThemeToggle } from '../components/ThemeToggle';
import { MagneticButton } from '../components/MagneticButton';
import { TiltCard } from '../components/TiltCard';
import { NeuralBackground3D } from '../components/NeuralBackground3D';
import { CursorGlow } from '../components/CursorGlow';

export const LoginPage: React.FC = () => {
  const { setPage, login, theme, addToast } = useApp();
  const [email, setEmail] = useState('alex.rivera@mindsync.ai');
  const [password, setPassword] = useState('MindSync2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] dark:bg-[#05070d] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200 transition-theme overflow-hidden">
      <NeuralBackground3D page="login" />
      <CursorGlow />

      {/* Top Bar */}
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

      {/* Main Form Center */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left: 3D AI Orb & MindSync Brand Identity */}
        <div className="hidden md:flex flex-col items-center text-center space-y-4">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <AIOrb size="md" state="idle" theme={theme} />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
              MindSync AI
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
            Your cross-meeting memory system. Remembering past promises, tracking decision shifts, and driving follow-ups.
          </p>
        </div>

        {/* Right: Clean Login Card */}
        <TiltCard className="p-8 rounded-3xl bg-white/90 dark:bg-[#0b1020]/90 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Sign In</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your credentials to access your meeting intelligence
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 dark:bg-[#101625] border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => addToast('Password Reset', 'Password reset instructions sent to your email.', 'info')}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
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

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500 dark:bg-slate-900 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
            </div>

            <MagneticButton
              id="login-submit-btn"
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer mt-2"
            >
              Sign In
            </MagneticButton>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white dark:bg-[#0b1020] px-2 text-slate-400 font-medium">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => login('alex.rivera@mindsync.ai', 'Alex Rivera')}
              className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-[#101625] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => setPage('signup')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              Create an account
            </button>
          </p>
        </TiltCard>
      </div>

      <div className="relative z-10 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Demo mode active — click Sign In or Continue with Google to proceed directly to your MindSync Dashboard.
      </div>
    </div>
  );
};
