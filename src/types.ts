export type AppPage =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'upload'
  | 'processing'
  | 'results'
  | 'tasks'
  | 'memory'
  | 'followups'
  | 'history'
  | 'settings'
  | 'profile'
  // Backward compatibility alias:
  | 'calendar'
  | 'transcript';

export type ResultsTab =
  | 'overview'
  | 'replay'
  | 'transcript'
  | 'actions'
  | 'decisions'
  | 'followups'
  | 'questions'
  | 'deadlines';

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface EvidenceRef {
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  speaker: string;
  timestamp: string;
  quote: string;
  transcriptSegmentId?: string;
}

export interface AIChapter {
  id: string;
  timestamp: string; // e.g. "04:15"
  seconds: number;
  title: string;
  summary?: string;
}

export interface TranscriptSegment {
  id: string;
  timestamp: string; // e.g. "02:14"
  seconds?: number;
  speaker: string;
  text: string;
  highlightType?: 'decision' | 'action' | 'deadline' | 'question' | 'sensitive';
  highlightText?: string;
}

export type DecisionType = 'decision' | 'discussion' | 'decision_reversed';

export interface Decision {
  id: string;
  meetingId: string;
  meetingTitle?: string;
  type: DecisionType;
  decision: string;
  context: string;
  rationale?: string; // Explicit reason or "Rationale not explicitly stated"
  previousDecision?: string; // For reversed/changed decisions (e.g. "PostgreSQL")
  newDecision?: string; // For reversed decisions (e.g. "MongoDB")
  sourceTranscriptId?: string;
  evidence?: EvidenceRef;
  changedInMeetingId?: string;
}

export type CommitmentStrength = 'strong' | 'moderate' | 'weak';

export interface TaskReminderDetail {
  statusText: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  category: 'overdue' | 'today' | 'tomorrow' | 'this_week' | 'upcoming_later' | 'none';
  reminderStage: string;
  daysDiff: number | null;
}

export interface ActionItem {
  id: string;
  meetingId: string;
  meetingTitle: string;
  task: string;
  responsiblePerson: string; // e.g. "Ravi" or "Owner not identified"
  confidence?: number; // e.g. 0.94
  originalDeadline?: string; // e.g. "Sep 20, 2026"
  currentDeadline: string; // e.g. "Sep 23, 2026"
  deadline?: string; // alias for currentDeadline
  deadlineStatus?: 'unchanged' | 'deadline_changed' | 'overdue';
  status: 'pending' | 'completed' | 'missed';
  reminderStatus?: TaskReminderDetail;
  reminderStatusText?: string;
  commitmentStrength?: CommitmentStrength;
  commitmentQuote?: string; // e.g. "I'll finish this by Monday."
  priority?: 'high' | 'medium' | 'low';
  sourceTranscriptId?: string;
  evidence?: EvidenceRef;
  resolvedInMeetingId?: string;
  resolvedInMeetingTitle?: string;
  resolvedEvidence?: EvidenceRef;
}

export interface DeadlineItem {
  id: string;
  meetingId: string;
  meetingTitle?: string;
  title: string;
  date: string;
  isoDate: string;
  responsiblePerson: string;
  originalDate?: string;
  isChanged?: boolean;
}

export interface UnresolvedQuestion {
  id: string;
  meetingId: string;
  meetingTitle?: string;
  question: string;
  context?: string;
  raisedBy?: string;
  timestamp?: string;
  resolved: boolean;
  resolvedInMeetingId?: string;
  resolvedInMeetingTitle?: string;
  resolvedAnswer?: string;
  evidence?: EvidenceRef;
}

export interface SensitiveAlert {
  id: string;
  meetingId: string;
  type: 'confidential_project' | 'contact_info' | 'credentials' | 'financial';
  label: string;
  text: string;
  location: string; // e.g. "22:30"
  reviewed: boolean;
}

export interface CatchMeUpSummary {
  meetingId: string;
  meetingTitle: string;
  date: string;
  whatHappened: string[];
  keyDecisions: string[];
  tasksAssigned: string[];
  changesSincePrevious: string[];
  unresolvedIssues: string[];
}

export interface FollowUpItem {
  id: string;
  type:
    | 'missed_commitment'
    | 'deadline_changed'
    | 'decision_reversed'
    | 'unresolved_question'
    | 'owner_missing';
  title: string;
  person?: string;
  previousMeetingId: string;
  previousMeetingTitle: string;
  previousMeetingDate: string;
  currentMeetingId?: string;
  currentMeetingTitle?: string;
  currentMeetingDate?: string;
  status: 'active' | 'resolved';
  severity: 'warning' | 'urgent' | 'info';
  description: string;
  previousEvidence: EvidenceRef;
  currentEvidence?: EvidenceRef;
}

export interface MemorySearchResult {
  id: string;
  query: string;
  answer: string;
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  evidence: EvidenceRef;
  relatedCategory: 'deadline' | 'commitment' | 'decision' | 'task' | 'question';
}

export interface DraftItem {
  type: 'email' | 'ticket' | 'followup_message' | 'agenda';
  title: string;
  recipient?: string;
  subject: string;
  body: string;
  taskRef?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // e.g. "Sep 20, 2026"
  isoDate: string; // e.g. "2026-09-20"
  durationMinutes: number;
  participants: Participant[];
  summary: string;
  keyDiscussionPoints: string[];
  importantOutcomes: string[];
  decisions: Decision[];
  actionItems: ActionItem[];
  deadlines: DeadlineItem[];
  unresolvedQuestions: UnresolvedQuestion[];
  transcript: TranscriptSegment[];
  chapters?: AIChapter[];
  sensitiveAlerts?: SensitiveAlert[];
  catchMeUp?: CatchMeUpSummary;
  fileType?: 'audio' | 'video' | 'transcript';
  fileName?: string;
  audioUrl?: string;
  rawTranscript?: string;
}

export interface ProcessingMeetingData {
  title?: string;
  date?: string;
  isoDate?: string;
  fileName?: string;
  fileType?: string;
  fileSizeStr?: string;
  rawTranscript?: string;
  audioUrl?: string;
  participantsStr?: string;
  customPrompt?: string;
}

export interface ToastNotification {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  timeZone?: string;
  language?: string;
  accountCreated?: string;
  lastLogin?: string;
  loginMethod?: string;
}

export interface ReminderTimingConfig {
  sevenDays: boolean;
  threeDays: boolean;
  oneDay: boolean;
  deadlineDay: boolean;
}

export interface NotificationPreferences {
  deadlineReminders: boolean;
  missedDeadlineAlerts: boolean;
  taskAssignmentAlerts: boolean;
  meetingFollowUpAlerts: boolean;
  reminderTiming: ReminderTimingConfig;
  browserNotificationsEnabled: boolean;
  analysisComplete: boolean;
  weeklyDigest: boolean;
}

export interface ReminderNotification {
  id: string;
  taskId: string;
  meetingId: string;
  title: string;
  message: string;
  taskTitle: string;
  responsiblePerson: string;
  dueDate: string;
  dueIsoDate?: string;
  daysDiff: number;
  type: 'missed' | 'today' | 'tomorrow' | 'upcoming_3d' | 'upcoming_7d';
  severity: 'urgent' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
  dismissed: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  notifications: NotificationPreferences;
  aiAssistant: {
    voiceEnabled: boolean;
    autoSpeakReplies: boolean;
    voiceName: string;
    ambientSound: boolean;
  };
  integrations: {
    googleMeet: { connected: boolean; status: 'coming_soon' };
    zoom: { connected: boolean; status: 'coming_soon' };
  };
}
