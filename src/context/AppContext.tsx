import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  AppPage,
  ResultsTab,
  Meeting,
  ActionItem,
  ToastNotification,
  UserProfile,
  AppSettings,
  Decision,
  DeadlineItem,
  ProcessingMeetingData,
  FollowUpItem,
  EvidenceRef,
  DraftItem,
  MemorySearchResult,
  ReminderNotification,
  NotificationPreferences,
} from '../types';
import {
  initialMeetings,
  initialUserProfile,
  initialSettings,
  initialFollowUps,
  initialMemoryAnswers,
} from '../data/mockData';
import {
  DEMO_REFERENCE_DATE,
  generateDeadlineNotifications,
  calculateDeadlineBuckets,
  calculateTaskReminderStatus,
  calculateTaskReminderDetail,
  requestBrowserNotificationPermission,
  sendBrowserNotification,
  DeadlineBuckets,
  parseDeadlineToDate,
  getCalendarDaysDiff,
} from '../utils/reminderEngine';

interface AppContextType {
  page: AppPage;
  setPage: (page: AppPage) => void;
  selectedMeetingId: string;
  setSelectedMeetingId: (id: string) => void;
  currentMeeting: Meeting | undefined;
  meetings: Meeting[];
  followUps: FollowUpItem[];
  resultsTab: ResultsTab;
  setResultsTab: (tab: ResultsTab) => void;
  transcriptHighlightSource: string | null;
  navigateToTranscriptSource: (meetingId: string, sourceTranscriptId?: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  user: UserProfile | null;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  login: (email?: string, name?: string) => void;
  logout: () => void;
  isLogoutModalOpen: boolean;
  setIsLogoutModalOpen: (open: boolean) => void;
  confirmLogout: () => void;
  toasts: ToastNotification[];
  addToast: (
    title: string,
    description?: string,
    type?: 'success' | 'info' | 'warning' | 'error'
  ) => void;
  removeToast: (id: string) => void;
  isVoiceAssistantOpen: boolean;
  setIsVoiceAssistantOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  toggleTaskStatus: (taskId: string) => void;
  updateActionItem: (item: ActionItem) => void;
  deleteActionItem: (taskId: string) => void;
  addActionItem: (
    meetingId: string,
    taskText: string,
    person: string,
    deadline: string,
    priority?: 'high' | 'medium' | 'low'
  ) => void;
  resolveQuestion: (questionId: string, answer?: string) => void;
  addQuestion: (meetingId: string, questionText: string) => void;
  addDecision: (
    meetingId: string,
    decisionText: string,
    context?: string,
    sourceTranscriptId?: string
  ) => void;
  updateDecision: (meetingId: string, decisionId: string, updates: Partial<Decision>) => void;
  deleteDecision: (meetingId: string, decisionId: string) => void;
  addDeadline: (meetingId: string, title: string, isoDate: string, responsiblePerson: string) => void;
  deleteDeadline: (meetingId: string, deadlineId: string) => void;
  deleteMeeting: (meetingId: string) => void;
  updateMeeting: (meetingId: string, updates: Partial<Meeting>) => void;
  addMeeting: (newMeeting: Meeting) => void;
  processingMeetingData: ProcessingMeetingData | null;
  setProcessingMeetingData: (data: ProcessingMeetingData | null) => void;
  playbackSecond: number;
  setPlaybackSecond: (sec: number) => void;
  isPlayingMeetingAudio: boolean;
  setIsPlayingMeetingAudio: (playing: boolean) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  settingsTab: 'general' | 'notifications' | 'privacy' | 'accounts';
  setSettingsTab: (tab: 'general' | 'notifications' | 'privacy' | 'accounts') => void;
  allActionItems: ActionItem[];

  // Smart Reminders & Notification Center
  notifications: ReminderNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  dismissNotification: (id: string) => void;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
  enableBrowserNotifications: () => Promise<boolean>;
  deadlineBuckets: DeadlineBuckets;

  // MindSync Specialized Modals & Actions
  activeEvidence: EvidenceRef | null;
  setActiveEvidence: (evidence: EvidenceRef | null) => void;
  activeDraft: DraftItem | null;
  setActiveDraft: (draft: DraftItem | null) => void;
  activeCatchMeUpMeetingId: string | null;
  setActiveCatchMeUpMeetingId: (id: string | null) => void;
  askMeetingMemory: (query: string) => MemorySearchResult | null;
  markSensitiveAlertReviewed: (meetingId: string, alertId: string) => void;
  removeSensitiveFromSummary: (meetingId: string, alertId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const validPages: AppPage[] = [
  'landing',
  'login',
  'signup',
  'dashboard',
  'upload',
  'processing',
  'results',
  'transcript',
  'tasks',
  'memory',
  'followups',
  'calendar',
  'history',
  'settings',
  'profile',
];

const getPageFromHash = (): AppPage | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.location.hash.replace(/^#\/?/, '').trim();
  if (raw && validPages.includes(raw as AppPage)) {
    return raw as AppPage;
  }
  return null;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [page, setPageState] = useState<AppPage>(() => {
    const hashPage = getPageFromHash();
    if (hashPage) return hashPage;
    return 'landing';
  });

  // Synchronized setPage that updates browser history smoothly
  const setPage = useCallback((newPage: AppPage, replace = false) => {
    setPageState((current) => {
      if (current === newPage) return current;
      const targetHash = newPage === 'landing' ? '' : `#/${newPage}`;
      if (replace) {
        window.history.replaceState({ page: newPage }, '', targetHash || window.location.pathname);
      } else {
        window.history.pushState({ page: newPage }, '', targetHash || window.location.pathname);
      }
      return newPage;
    });
  }, []);

  // Synchronize browser Back and Forward navigation buttons without page reloads
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page && validPages.includes(event.state.page)) {
        setPageState(event.state.page);
      } else {
        const hashPage = getPageFromHash();
        if (hashPage) {
          setPageState(hashPage);
        } else {
          setPageState('landing');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial state registration in browser history
    const initialPage = getPageFromHash() || page;
    const initialHash = initialPage === 'landing' ? '' : `#/${initialPage}`;
    window.history.replaceState({ page: initialPage }, '', initialHash || window.location.pathname);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('meet-4');

  // Verify stored meetings match current schema with 4 connected meetings
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('mindsync_meetings_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4 && parsed.some(m => m.id === 'meet-4')) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return initialMeetings;
  });

  const [followUps, setFollowUps] = useState<FollowUpItem[]>(() => {
    const saved = localStorage.getItem('mindsync_followups_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialFollowUps;
  });

  const [resultsTab, setResultsTab] = useState<ResultsTab>('overview');
  const [transcriptHighlightSource, setTranscriptHighlightSource] = useState<string | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('mindsync_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('mindsync_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialUserProfile;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('mindsync_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialSettings,
          ...parsed,
          notifications: {
            ...initialSettings.notifications,
            ...(parsed.notifications || {}),
            reminderTiming: {
              ...initialSettings.notifications.reminderTiming,
              ...(parsed.notifications?.reminderTiming || {}),
            },
          },
          aiAssistant: {
            ...initialSettings.aiAssistant,
            ...(parsed.aiAssistant || {}),
          },
          integrations: {
            ...initialSettings.integrations,
            ...(parsed.integrations || {}),
          },
        };
      } catch (e) {
        console.error(e);
      }
    }
    return initialSettings;
  });

  const [toasts, setToasts] = useState<ToastNotification[]>([
    {
      id: 'toast-init-1',
      title: 'MindSync Memory Synced',
      description: 'Connected 4 project meetings into shared memory graph.',
      type: 'success',
      timestamp: 'Just now',
    },
  ]);

  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'notifications' | 'privacy' | 'accounts'>('general');
  const [processingMeetingData, setProcessingMeetingData] = useState<ProcessingMeetingData | null>(null);

  // Notifications read and dismissed tracking
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('mindsync_read_notifs');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('mindsync_dismissed_notifs');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Synchronized Meeting Audio Playback
  const [playbackSecond, setPlaybackSecond] = useState(0);
  const [isPlayingMeetingAudio, setIsPlayingMeetingAudio] = useState(false);

  // MindSync Evidence, Draft & Catch-Me-Up states
  const [activeEvidence, setActiveEvidence] = useState<EvidenceRef | null>(null);
  const [activeDraft, setActiveDraft] = useState<DraftItem | null>(null);
  const [activeCatchMeUpMeetingId, setActiveCatchMeUpMeetingId] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isPlayingMeetingAudio) {
      interval = setInterval(() => {
        setPlaybackSecond((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingMeetingAudio]);

  // Sync theme to <html> and <body> tags
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute('data-theme-transition', 'true');

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.remove('dark');
      body.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('mindsync_theme', theme);
  }, [theme]);

  // Persist meetings
  useEffect(() => {
    localStorage.setItem('mindsync_meetings_v2', JSON.stringify(meetings));
  }, [meetings]);

  // Persist followUps
  useEffect(() => {
    localStorage.setItem('mindsync_followups_v2', JSON.stringify(followUps));
  }, [followUps]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('mindsync_settings', JSON.stringify(settings));
  }, [settings]);

  // Generate dynamic smart deadline reminders based on meetings, preferences, and reference date
  const notifications = useMemo(() => {
    return generateDeadlineNotifications(
      meetings,
      settings.notifications,
      readNotificationIds,
      dismissedNotificationIds,
      DEMO_REFERENCE_DATE
    );
  }, [meetings, settings.notifications, readNotificationIds, dismissedNotificationIds]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read && !n.dismissed).length;
  }, [notifications]);

  const markNotificationAsRead = (id: string) => {
    setReadNotificationIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('mindsync_read_notifs', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const markAllNotificationsAsRead = () => {
    setReadNotificationIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      localStorage.setItem('mindsync_read_notifs', JSON.stringify(Array.from(next)));
      return next;
    });
    addToast('All Caught Up', 'All notifications marked as read.', 'info');
  };

  const dismissNotification = (id: string) => {
    setDismissedNotificationIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('mindsync_dismissed_notifs', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const updateNotificationPreferences = (prefs: Partial<NotificationPreferences>) => {
    setSettings((prev) => {
      const currentTiming = prev?.notifications?.reminderTiming || initialSettings.notifications.reminderTiming;
      const updated: AppSettings = {
        ...prev,
        notifications: {
          ...initialSettings.notifications,
          ...(prev?.notifications || {}),
          ...prefs,
          reminderTiming: {
            ...currentTiming,
            ...(prefs.reminderTiming || {}),
          },
        },
      };
      localStorage.setItem('mindsync_settings', JSON.stringify(updated));
      return updated;
    });
    addToast('Preferences Updated', 'Deadline reminder preferences saved.', 'success');
  };

  const enableBrowserNotifications = async (): Promise<boolean> => {
    const granted = await requestBrowserNotificationPermission();
    if (granted) {
      updateNotificationPreferences({ browserNotificationsEnabled: true });
      sendBrowserNotification(
        'MindSync AI',
        'Browser notifications enabled. MindSync will alert you before deadlines.'
      );
      addToast('Browser Notifications Enabled', 'You will receive desktop alerts for approaching deadlines.', 'success');
      return true;
    } else {
      addToast('Browser Permission Needed', 'Please allow notifications in your browser settings.', 'warning');
      return false;
    }
  };

  const deadlineBuckets = useMemo(() => {
    return calculateDeadlineBuckets(meetings, DEMO_REFERENCE_DATE);
  }, [meetings]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated: UserProfile = { ...prev, ...updates };
      localStorage.setItem('mindsync_user', JSON.stringify(updated));
      return updated;
    });
    addToast('Profile Saved', 'Personal information updated successfully.', 'success');
  };

  const login = (email?: string, name?: string) => {
    const newUser: UserProfile = {
      name: name || user?.name || 'Yasaswitha',
      email: email || user?.email || 'yasaswithajarugu@gmail.com',
      role: user?.role || 'Product Lead',
      avatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      timeZone: user?.timeZone || 'Pacific Time (US & Canada) - GMT-7',
      language: user?.language || 'English (US)',
      accountCreated: user?.accountCreated || 'Sep 01, 2026',
      lastLogin: 'Just now',
      loginMethod: 'Google Workspace SSO',
    };
    setUser(newUser);
    localStorage.setItem('mindsync_user', JSON.stringify(newUser));
    setPage('dashboard');
    addToast('Welcome back, ' + newUser.name, 'All meeting memory graphs loaded.', 'success');
  };

  const logout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    setUser(null);
    localStorage.removeItem('mindsync_user');
    setPage('landing');
    addToast('Signed out', 'You have been safely logged out of MindSync.', 'info');
  };

  const addToast = (
    title: string,
    description?: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, title, description, type, timestamp: 'Just now' }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const currentMeeting = meetings.find((m) => m.id === selectedMeetingId) || meetings[0];

  const navigateToTranscriptSource = (meetingId: string, sourceTranscriptId?: string) => {
    setSelectedMeetingId(meetingId);
    setResultsTab('transcript');
    setTranscriptHighlightSource(sourceTranscriptId || null);
    setPage('results');
  };

  // Toggle action item
  const toggleTaskStatus = (taskId: string) => {
    setMeetings((prev) =>
      prev.map((m) => ({
        ...m,
        actionItems: m.actionItems.map((item) => {
          if (item.id === taskId) {
            const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
            if (nextStatus === 'completed') {
              addToast('Action Completed', `"${item.task}" marked as done.`, 'success');
            }
            return { ...item, status: nextStatus };
          }
          return item;
        }),
      }))
    );
  };

  const updateActionItem = (updatedItem: ActionItem) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === updatedItem.meetingId) {
          return {
            ...m,
            actionItems: m.actionItems.map((item) =>
              item.id === updatedItem.id ? updatedItem : item
            ),
          };
        }
        return m;
      })
    );
    addToast('Task Updated', `Changes to "${updatedItem.task}" saved.`, 'info');
  };

  const deleteActionItem = (taskId: string) => {
    setMeetings((prev) =>
      prev.map((m) => ({
        ...m,
        actionItems: m.actionItems.filter((item) => item.id !== taskId),
      }))
    );
    addToast('Task Deleted', 'Action item removed.', 'info');
  };

  const addActionItem = (
    meetingId: string,
    taskText: string,
    person: string,
    deadline: string,
    priority?: 'high' | 'medium' | 'low'
  ) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    const newItem: ActionItem = {
      id: 'act-custom-' + Date.now(),
      meetingId,
      meetingTitle: meeting?.title || 'Current Meeting',
      task: taskText,
      responsiblePerson: person.trim() || 'Owner not identified',
      originalDeadline: deadline || 'No deadline',
      currentDeadline: deadline || 'No deadline',
      deadlineStatus: 'unchanged',
      status: 'pending',
      commitmentStrength: 'moderate',
      priority: priority || 'medium',
    };

    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === meetingId) {
          return {
            ...m,
            actionItems: [newItem, ...m.actionItems],
          };
        }
        return m;
      })
    );
    addToast('New Action Created', `Assigned to ${newItem.responsiblePerson}`, 'success');
  };

  const addDecision = (
    meetingId: string,
    decisionText: string,
    context?: string,
    sourceTranscriptId?: string
  ) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    const newDec: Decision = {
      id: 'dec-custom-' + Date.now(),
      meetingId,
      meetingTitle: meeting?.title || 'Current Meeting',
      type: 'decision',
      decision: decisionText.trim(),
      context: context?.trim() || 'Recorded during meeting review.',
      rationale: 'Rationale documented by team.',
      sourceTranscriptId,
    };

    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === meetingId) {
          return {
            ...m,
            decisions: [newDec, ...m.decisions],
          };
        }
        return m;
      })
    );
    addToast('Decision Recorded', 'Added to meeting record.', 'success');
  };

  const updateDecision = (
    meetingId: string,
    decisionId: string,
    updates: Partial<Decision>
  ) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === meetingId) {
          return {
            ...m,
            decisions: m.decisions.map((d) =>
              d.id === decisionId ? { ...d, ...updates } : d
            ),
          };
        }
        return m;
      })
    );
    addToast('Decision Updated', 'Changes saved.', 'info');
  };

  const deleteDecision = (meetingId: string, decisionId: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === meetingId) {
          return {
            ...m,
            decisions: m.decisions.filter((d) => d.id !== decisionId),
          };
        }
        return m;
      })
    );
    addToast('Decision Removed', 'Decision deleted from meeting record.', 'info');
  };

  const addDeadline = (
    meetingId: string,
    title: string,
    isoDate: string,
    responsiblePerson: string
  ) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    const dateFormatted = new Date(isoDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newDl: DeadlineItem = {
      id: 'dl-custom-' + Date.now(),
      meetingId,
      meetingTitle: meeting?.title || 'Current Meeting',
      title: title.trim(),
      isoDate,
      date: dateFormatted,
      responsiblePerson: responsiblePerson.trim() || 'Team',
    };

    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === meetingId) {
          return {
            ...m,
            deadlines: [...m.deadlines, newDl],
          };
        }
        return m;
      })
    );
    addToast('Deadline Added', `Scheduled for ${dateFormatted}`, 'success');
  };

  const deleteDeadline = (meetingId: string, deadlineId: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === meetingId) {
          return {
            ...m,
            deadlines: m.deadlines.filter((dl) => dl.id !== deadlineId),
          };
        }
        return m;
      })
    );
    addToast('Deadline Removed', 'Deliverable deadline deleted.', 'info');
  };

  const updateMeeting = (meetingId: string, updates: Partial<Meeting>) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, ...updates } : m))
    );
    addToast('Meeting Updated', 'Meeting details saved.', 'info');
  };

  const deleteMeeting = (meetingId: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    if (selectedMeetingId === meetingId) {
      const remaining = meetings.filter((m) => m.id !== meetingId);
      if (remaining.length > 0) {
        setSelectedMeetingId(remaining[0].id);
      }
    }
    addToast('Meeting Deleted', 'Meeting removed from history.', 'info');
  };

  const resolveQuestion = (questionId: string, answer?: string) => {
    setMeetings((prev) =>
      prev.map((m) => ({
        ...m,
        unresolvedQuestions: m.unresolvedQuestions.map((q) => {
          if (q.id === questionId) {
            return {
              ...q,
              resolved: !q.resolved,
              resolvedAnswer: answer || 'Marked resolved by team.',
            };
          }
          return q;
        }),
      }))
    );
    addToast('Question Updated', 'Status updated.', 'info');
  };

  const addQuestion = (meetingId: string, questionText: string) => {
    const newQ = {
      id: 'q-custom-' + Date.now(),
      meetingId,
      question: questionText,
      context: 'Added during review.',
      resolved: false,
    };

    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === meetingId) {
          return {
            ...m,
            unresolvedQuestions: [...m.unresolvedQuestions, newQ],
          };
        }
        return m;
      })
    );
    addToast('Question Added', 'Added to meeting record.', 'info');
  };

  const addMeeting = (newMeeting: Meeting) => {
    setMeetings((prev) => [newMeeting, ...prev]);
    setSelectedMeetingId(newMeeting.id);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('Settings Saved', 'Your preferences have been updated.', 'info');
  };

  // Ask Meeting Memory natural language lookup
  const askMeetingMemory = (query: string): MemorySearchResult | null => {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return null;

    // Check direct pre-built question matches
    const exact = initialMemoryAnswers.find((m) =>
      cleanQuery.includes(m.query.toLowerCase()) || m.query.toLowerCase().includes(cleanQuery)
    );
    if (exact) return exact;

    // Keyword based fuzzy fallback
    if (cleanQuery.includes('deadline') || cleanQuery.includes('when')) {
      return initialMemoryAnswers.find((m) => m.id === 'mem-1') || null;
    }
    if (cleanQuery.includes('frontend') || cleanQuery.includes('ravi') || cleanQuery.includes('finish')) {
      return initialMemoryAnswers.find((m) => m.id === 'mem-2') || null;
    }
    if (cleanQuery.includes('database') || cleanQuery.includes('postgres') || cleanQuery.includes('mongo')) {
      return initialMemoryAnswers.find((m) => m.id === 'mem-3') || null;
    }
    if (cleanQuery.includes('unfinished') || cleanQuery.includes('task') || cleanQuery.includes('todo')) {
      return initialMemoryAnswers.find((m) => m.id === 'mem-4') || null;
    }
    if (cleanQuery.includes('testing') || cleanQuery.includes('test') || cleanQuery.includes('arjun')) {
      return initialMemoryAnswers.find((m) => m.id === 'mem-6') || null;
    }

    // Default to the most significant memory: deadline & commitments
    return initialMemoryAnswers[0];
  };

  const markSensitiveAlertReviewed = (meetingId: string, alertId: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === meetingId && m.sensitiveAlerts) {
          return {
            ...m,
            sensitiveAlerts: m.sensitiveAlerts.map((a) =>
              a.id === alertId ? { ...a, reviewed: true } : a
            ),
          };
        }
        return m;
      })
    );
    addToast('Sensitive Alert Reviewed', 'Marked as acknowledged.', 'info');
  };

  const removeSensitiveFromSummary = (meetingId: string, alertId: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === meetingId && m.sensitiveAlerts) {
          return {
            ...m,
            sensitiveAlerts: m.sensitiveAlerts.filter((a) => a.id !== alertId),
            summary: m.summary.replace(/sk_live_[a-z0-9_]+/gi, '[REDACTED]'),
          };
        }
        return m;
      })
    );
    addToast('Sensitive Data Redacted', 'Redacted from summary and outputs.', 'success');
  };

  // Flattened all action items across all meetings with dynamic reminder status
  const allActionItems: ActionItem[] = useMemo(() => {
    return meetings.flatMap((m) =>
      m.actionItems.map((item) => ({
        ...item,
        reminderStatus: calculateTaskReminderDetail(item, DEMO_REFERENCE_DATE),
        reminderStatusText: calculateTaskReminderStatus(item, DEMO_REFERENCE_DATE),
      }))
    );
  }, [meetings]);

  // Merge overdue tasks into Missed Commitments in followUps if not already present
  const dynamicFollowUps: FollowUpItem[] = useMemo(() => {
    const list = [...followUps];
    meetings.forEach((m) => {
      m.actionItems.forEach((task) => {
        if (task.status !== 'completed') {
          const deadline = task.currentDeadline || task.originalDeadline;
          const dateObj = parseDeadlineToDate(deadline, DEMO_REFERENCE_DATE);
          if (dateObj && getCalendarDaysDiff(dateObj, DEMO_REFERENCE_DATE) < 0) {
            const exists = list.some(
              (f) =>
                f.type === 'missed_commitment' &&
                f.title.toLowerCase().includes(task.task.toLowerCase().slice(0, 15))
            );
            if (!exists) {
              list.push({
                id: `fu-overdue-${task.id}`,
                type: 'missed_commitment',
                title: `Missed Commitment: ${task.task}`,
                person: task.responsiblePerson,
                previousMeetingId: m.id,
                previousMeetingTitle: m.title,
                previousMeetingDate: m.date,
                status: 'active',
                severity: 'urgent',
                description: `Deadline was ${deadline}. Task is overdue and automatically flagged for follow-up.`,
                previousEvidence: task.evidence || {
                  meetingId: m.id,
                  meetingTitle: m.title,
                  meetingDate: m.date,
                  speaker: task.responsiblePerson,
                  timestamp: '00:00',
                  quote: `Original commitment due date: ${deadline}`,
                },
              });
            }
          }
        }
      });
    });
    return list;
  }, [followUps, meetings]);

  return (
    <AppContext.Provider
      value={{
        page,
        setPage,
        selectedMeetingId,
        setSelectedMeetingId,
        currentMeeting,
        meetings,
        followUps: dynamicFollowUps,
        resultsTab,
        setResultsTab,
        transcriptHighlightSource,
        navigateToTranscriptSource,
        theme,
        toggleTheme,
        user,
        updateUserProfile,
        login,
        logout,
        isLogoutModalOpen,
        setIsLogoutModalOpen,
        confirmLogout,
        toasts,
        addToast,
        removeToast,
        isVoiceAssistantOpen,
        setIsVoiceAssistantOpen,
        isSearchOpen,
        setIsSearchOpen,
        toggleTaskStatus,
        updateActionItem,
        deleteActionItem,
        addActionItem,
        resolveQuestion,
        addQuestion,
        addDecision,
        updateDecision,
        deleteDecision,
        addDeadline,
        deleteDeadline,
        deleteMeeting,
        updateMeeting,
        addMeeting,
        processingMeetingData,
        setProcessingMeetingData,
        playbackSecond,
        setPlaybackSecond,
        isPlayingMeetingAudio,
        setIsPlayingMeetingAudio,
        settings,
        updateSettings,
        settingsTab,
        setSettingsTab,
        allActionItems,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        dismissNotification,
        updateNotificationPreferences,
        enableBrowserNotifications,
        deadlineBuckets,
        activeEvidence,
        setActiveEvidence,
        activeDraft,
        setActiveDraft,
        activeCatchMeUpMeetingId,
        setActiveCatchMeUpMeetingId,
        askMeetingMemory,
        markSensitiveAlertReviewed,
        removeSensitiveFromSummary,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
