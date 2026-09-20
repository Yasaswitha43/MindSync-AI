import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Clock,
  Globe,
  Save,
  KeyRound,
  Calendar,
  Sparkles,
  Camera,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Preset avatar options for quick selection
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

export const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useApp();

  const [name, setName] = useState(user?.name || 'Yasaswitha');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl || AVATAR_PRESETS[0]
  );
  const [timeZone, setTimeZone] = useState(
    user?.timeZone || 'Pacific Time (US & Canada) - GMT-7'
  );
  const [language, setLanguage] = useState(user?.language || 'English (US)');
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [showCustomAvatar, setShowCustomAvatar] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim() || 'Yasaswitha',
      avatarUrl: customAvatarInput.trim() || avatarUrl,
      timeZone,
      language,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
            User Profile
          </span>
          <span className="text-xs text-slate-400">Personal Account & Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
          My Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal identity, avatar, time zone, and language preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Identity & Avatar */}
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <User className="w-4 h-4" />
            <span>Profile Identity</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              <img
                src={customAvatarInput.trim() || avatarUrl}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-md shadow-indigo-500/10"
              />
              <button
                type="button"
                onClick={() => setShowCustomAvatar(!showCustomAvatar)}
                className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer"
                title="Change Avatar URL"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 flex-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                Choose Profile Photo
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(preset);
                      setCustomAvatarInput('');
                    }}
                    className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      avatarUrl === preset && !customAvatarInput
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-105'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset}
                      alt="Preset"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {avatarUrl === preset && !customAvatarInput && (
                      <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {showCustomAvatar && (
                <div className="pt-2 animate-in fade-in duration-150">
                  <input
                    type="url"
                    placeholder="Enter custom image URL..."
                    value={customAvatarInput}
                    onChange={(e) => setCustomAvatarInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#101625] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-[#101625] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || 'yasaswithajarugu@gmail.com'}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-medium">
                  Verified
                </span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Role
              </label>
              <div className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>{user?.role || 'Product Lead'}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  Workspace Admin
                </span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Time Zone
              </label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#101625] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Pacific Time (US & Canada) - GMT-7">Pacific Time (US & Canada) - GMT-7</option>
                <option value="Eastern Time (US & Canada) - GMT-4">Eastern Time (US & Canada) - GMT-4</option>
                <option value="Central Time (US & Canada) - GMT-5">Central Time (US & Canada) - GMT-5</option>
                <option value="UTC (Coordinated Universal Time) - GMT+0">UTC (Universal Time) - GMT+0</option>
                <option value="India Standard Time (IST) - GMT+5:30">India Standard Time (IST) - GMT+5:30</option>
                <option value="British Summer Time (BST) - GMT+1">British Summer Time (BST) - GMT+1</option>
                <option value="Central European Time (CET) - GMT+2">Central European Time (CET) - GMT+2</option>
                <option value="Singapore / Perth (SGT) - GMT+8">Singapore Time (SGT) - GMT+8</option>
                <option value="Tokyo (JST) - GMT+9">Tokyo Standard Time (JST) - GMT+9</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#101625] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="English (US)">English (US / Global)</option>
                <option value="English (UK)">English (UK)</option>
                <option value="Spanish (Español)">Spanish (Español)</option>
                <option value="French (Français)">French (Français)</option>
                <option value="German (Deutsch)">German (Deutsch)</option>
                <option value="Japanese (日本語)">Japanese (日本語)</option>
                <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. ACCOUNT METADATA */}
        <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <KeyRound className="w-4 h-4" />
            <span>Account Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                Account Created
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.accountCreated || 'Sep 01, 2026'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                Last Login
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.lastLogin || 'Today at 09:15 AM'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                Login Method
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.loginMethod || 'Google Workspace SSO'}
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
