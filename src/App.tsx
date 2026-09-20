import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { VoiceAssistant } from './components/VoiceAssistant';
import { ToastContainer } from './components/ToastContainer';
import { CursorGlow } from './components/CursorGlow';
import { NeuralBackground3D } from './components/NeuralBackground3D';
import { EvidenceModal } from './components/EvidenceModal';
import { DraftModal } from './components/DraftModal';
import { CatchMeUpModal } from './components/CatchMeUpModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadMeetingPage } from './pages/UploadMeetingPage';
import { AIProcessingPage } from './pages/AIProcessingPage';
import { MeetingResultsPage } from './pages/MeetingResultsPage';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { MeetingHistoryPage } from './pages/MeetingHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { MemoryPage } from './pages/MemoryPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { LogoutModal } from './components/LogoutModal';

// Mobile bottom navigation icons
import { LayoutDashboard, CheckSquare, PlusCircle, FolderKanban, BrainCircuit, GitCompare } from 'lucide-react';

const AppInner: React.FC = () => {
  const { page, setPage } = useApp();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);

  // Full-screen pages without application sidebar shell
  if (page === 'landing') {
    return (
      <>
        <LandingPage />
        <ToastContainer />
      </>
    );
  }

  if (page === 'login') {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  if (page === 'signup') {
    return (
      <>
        <SignUpPage />
        <ToastContainer />
      </>
    );
  }

  // Application Layout Shell
  return (
    <div className="relative flex h-screen bg-[#f8fafc] dark:bg-[#070a12] text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-theme">
      {/* Dynamic 3D Neural Background & Desktop Cursor Glow (Untouched 3D Scene) */}
      <NeuralBackground3D page={page} />
      <CursorGlow />

      {/* Persistent Sidebar (desktop) & responsive drawer (mobile) */}
      <Sidebar
        isMobileMenuOpen={isMobileDrawerOpen}
        onCloseMobileMenu={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10 lg:pl-64">
        {/* Top Header Bar */}
        <TopBar onOpenMobileMenu={() => setIsMobileDrawerOpen(true)} />

        {/* Scrollable Page Body with Page Transition Animation */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {page === 'dashboard' && <DashboardPage />}
                {page === 'upload' && <UploadMeetingPage />}
                {page === 'processing' && <AIProcessingPage />}
                {page === 'results' && <MeetingResultsPage />}
                {page === 'tasks' && <TasksPage />}
                {page === 'memory' && <MemoryPage />}
                {page === 'followups' && <FollowUpsPage />}
                {page === 'calendar' && <CalendarPage />}
                {page === 'history' && <MeetingHistoryPage />}
                {page === 'profile' && <ProfilePage />}
                {page === 'settings' && <SettingsPage />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (compact, touch-friendly) */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0b0f17]/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-lg px-2 py-2 flex items-center justify-around">
          <button
            onClick={() => setPage('dashboard')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition-colors ${
              page === 'dashboard'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setPage('history')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition-colors ${
              page === 'history'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <FolderKanban className="w-5 h-5" />
            <span>Meetings</span>
          </button>
          <button
            onClick={() => setPage('upload')}
            className="flex flex-col items-center gap-1 p-1 -mt-4"
          >
            <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">New</span>
          </button>
          <button
            onClick={() => setPage('memory')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition-colors ${
              page === 'memory'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <BrainCircuit className="w-5 h-5" />
            <span>Memory</span>
          </button>
          <button
            onClick={() => setPage('followups')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition-colors ${
              page === 'followups'
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <GitCompare className="w-5 h-5" />
            <span>Follow-Ups</span>
          </button>
        </nav>
      </div>

      {/* Floating AI Voice & Query Assistant */}
      <VoiceAssistant />

      {/* Global Search Modal (Cmd+K) */}
      <GlobalSearchModal />

      {/* Verifiable Evidence Citation Modal */}
      <EvidenceModal />

      {/* Do It For Me AI Draft Modal */}
      <DraftModal />

      {/* Catch Me Up Modal */}
      <CatchMeUpModal />

      {/* Logout Confirmation Modal */}
      <LogoutModal />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
