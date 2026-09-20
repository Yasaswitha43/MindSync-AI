import React, { useState } from 'react';
import {
  Link2,
  Globe,
  Sliders,
  Shield,
  HardDrive,
  Save,
  Clock,
  Video,
  Radio,
  CheckCircle2,
  Lock,
  Bell,
  Check,
  Calendar,
  AlertTriangle,
  Monitor,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateNotificationPreferences,
    enableBrowserNotifications,
    settingsTab,
    setSettingsTab,
    addToast,
  } = useApp();

  const [language, setLanguage] = useState('English (US)');
  const [audioQuality, setAudioQuality] = useState('Studio (48kHz Enhanced)');
  const [storageRetention, setStorageRetention] = useState('90 Days Cloud Memory');
  const [autoRedactSensitive, setAutoRedactSensitive] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(true);

  // Local notification preferences state synced with settings
  const notifs = settings.notifications;

  const timing = notifs?.reminderTiming || {
    sevenDays: true,
    threeDays: true,
    oneDay: true,
    deadlineDay: true,
  };

  const handleTogglePref = (key: keyof typeof notifs) => {
    if (typeof notifs[key] === 'boolean') {
      updateNotificationPreferences({ [key]: !notifs[key] });
    }
  };

  const handleToggleTiming = (
    timingKey: 'sevenDays' | 'threeDays' | 'oneDay' | 'deadlineDay'
  ) => {
    const currentTiming = notifs?.reminderTiming || {
      sevenDays: true,
      threeDays: true,
      oneDay: true,
      deadlineDay: true,
    };
    updateNotificationPreferences({
      reminderTiming: {
        ...currentTiming,
        [timingKey]: !currentTiming[timingKey],
      },
    });
  };

  const handleBrowserToggle = async () => {
    if (!notifs.browserNotificationsEnabled) {
      await enableBrowserNotifications();
    } else {
      updateNotificationPreferences({ browserNotificationsEnabled: false });
      addToast('Browser Notifications Paused', 'Desktop push notifications disabled.', 'info');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Settings Saved', 'MindSync preferences updated successfully.', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
            Settings & Preferences
          </span>
          <span className="text-xs text-slate-400">Application Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure automatic deadline alerts, notification timing, audio processing, and security rules.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setSettingsTab('general')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            settingsTab === 'general'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          General & Accounts
        </button>
        <button
          type="button"
          onClick={() => setSettingsTab('notifications')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            settingsTab === 'notifications'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notification Preferences</span>
        </button>
        <button
          type="button"
          onClick={() => setSettingsTab('privacy')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            settingsTab === 'privacy'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Privacy & Guard</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* NOTIFICATION PREFERENCES TAB */}
        {settingsTab === 'notifications' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. Alert Channels & Types */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Bell className="w-4 h-4" />
                <span>Automatic Alert Triggers</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose which types of meeting events and deadline changes should generate in-app and desktop alerts.
              </p>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                <label className="py-3 flex items-start justify-between gap-4 cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      Deadline Reminders
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Send proactive reminder notifications before approaching action item due dates.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifs.deadlineReminders}
                    onChange={() => handleTogglePref('deadlineReminders')}
                    className="w-4 h-4 rounded accent-indigo-600 cursor-pointer mt-0.5"
                  />
                </label>

                <label className="py-3 flex items-start justify-between gap-4 cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      Missed Deadline Alerts
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Notify immediately when an action item passes its deadline without being marked completed.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifs.missedDeadlineAlerts}
                    onChange={() => handleTogglePref('missedDeadlineAlerts')}
                    className="w-4 h-4 rounded accent-indigo-600 cursor-pointer mt-0.5"
                  />
                </label>

                <label className="py-3 flex items-start justify-between gap-4 cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      Task Assignment Alerts
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Alert when a task is newly assigned, or ownership is identified from transcript dialogue.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifs.taskAssignmentAlerts}
                    onChange={() => handleTogglePref('taskAssignmentAlerts')}
                    className="w-4 h-4 rounded accent-indigo-600 cursor-pointer mt-0.5"
                  />
                </label>

                <label className="py-3 flex items-start justify-between gap-4 cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      Meeting Follow-Up Alerts
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Notify about cross-meeting contradiction detections, unresolved questions, and topic evolutions.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifs.meetingFollowUpAlerts}
                    onChange={() => handleTogglePref('meetingFollowUpAlerts')}
                    className="w-4 h-4 rounded accent-indigo-600 cursor-pointer mt-0.5"
                  />
                </label>
              </div>
            </div>

            {/* 2. Timing Controls */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Clock className="w-4 h-4" />
                <span>Deadline Timing Schedule</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Specify exactly how far in advance MindSync should send alerts before deadlines.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="p-3 rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200/70 dark:border-slate-800/60 flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        7 Days Before
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Early heads-up 1 week prior
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!timing.sevenDays}
                    onChange={() => handleToggleTiming('sevenDays')}
                    className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200/70 dark:border-slate-800/60 flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        3 Days Before
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Preparation reminder 3 days prior
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!timing.threeDays}
                    onChange={() => handleToggleTiming('threeDays')}
                    className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200/70 dark:border-slate-800/60 flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        1 Day Before
                      </span>
                      <span className="text-[10px] text-slate-400">
                        High priority alert 24h prior
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!timing.oneDay}
                    onChange={() => handleToggleTiming('oneDay')}
                    className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200/70 dark:border-slate-800/60 flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        On Deadline Day
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Final morning notice on target date
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!timing.deadlineDay}
                    onChange={() => handleToggleTiming('deadlineDay')}
                    className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* 3. Desktop / Browser Push Notifications */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Monitor className="w-4 h-4" />
                <span>Browser Push Notifications</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200/70 dark:border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Desktop System Notifications</span>
                    {notifs.browserNotificationsEnabled ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500">
                        Disabled
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Receive native operating system alerts when deadlines are tomorrow or overdue.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBrowserToggle}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    notifs.browserNotificationsEnabled
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  }`}
                >
                  {notifs.browserNotificationsEnabled
                    ? 'Disable Browser Push'
                    : 'Enable Browser Notifications'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GENERAL & ACCOUNTS TAB */}
        {settingsTab === 'general' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. Connected Accounts */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Link2 className="w-4 h-4" />
                <span>Connected Accounts</span>
              </div>

              <div className="space-y-3">
                {/* Google Meet */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200/70 dark:border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Google Meet Integration
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Auto-ingest meeting recordings and live transcripts directly.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/50 dark:border-slate-700">
                    Coming Soon
                  </span>
                </div>

                {/* Zoom */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200/70 dark:border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Zoom Cloud Recordings
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Connect Zoom webhook for instant AI meeting extraction.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/50 dark:border-slate-700">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Audio Processing & Language */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Radio className="w-4 h-4" />
                <span>Audio & Language</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Audio Quality & Enhancement
                  </label>
                  <select
                    value={audioQuality}
                    onChange={(e) => setAudioQuality(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#101625] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Studio (48kHz Enhanced)">Studio (48kHz Enhanced Noise Cancellation)</option>
                    <option value="Standard (16kHz VoIP)">Standard (16kHz VoIP)</option>
                    <option value="Low Bandwidth (Mobile)">Low Bandwidth (Telephony 8kHz)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Primary Speech Language
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
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Storage Retention */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <HardDrive className="w-4 h-4" />
                <span>Storage & Memory Retention</span>
              </div>

              <div className="text-xs space-y-2">
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  Cross-Meeting Index Window
                </label>
                <select
                  value={storageRetention}
                  onChange={(e) => setStorageRetention(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#101625] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="30 Days Memory">30 Days Active Memory</option>
                  <option value="90 Days Cloud Memory">90 Days Cloud Memory (Recommended)</option>
                  <option value="365 Days Extended Archive">365 Days Extended Archive</option>
                  <option value="Unlimited Enterprise Memory">Unlimited Enterprise Memory</option>
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Past meetings remain searchable in MindSync Meeting Memory during this window.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PRIVACY & SECURITY TAB */}
        {settingsTab === 'privacy' && (
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <Shield className="w-4 h-4" />
              <span>Privacy Mode & Sensitive Information</span>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyMode}
                  onChange={() => setPrivacyMode(!privacyMode)}
                  className="w-4 h-4 rounded mt-0.5 accent-indigo-600 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Enable Privacy Guard & Detection
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Scan transcripts for API keys, passwords, credentials, and internal IPs.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRedactSensitive}
                  onChange={() => setAutoRedactSensitive(!autoRedactSensitive)}
                  className="w-4 h-4 rounded mt-0.5 accent-indigo-600 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Automatically Redact Sensitive Information from Summaries
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mask detected sensitive strings with <code>[REDACTED]</code> before exporting or sharing.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
