import { Meeting, ActionItem, NotificationPreferences, ReminderNotification } from '../types';

// Default reference date aligned with Hackathon demo scenario (Sep 22, 2026, 09:00 AM)
export const DEMO_REFERENCE_DATE = new Date(2026, 8, 22, 9, 0, 0); // Note: month 8 is September in JS Date

/**
 * Robust date parser for strings like "Sep 23, 2026", "September 23", "2026-09-23"
 */
export function parseDeadlineToDate(dateStr?: string, refDate: Date = DEMO_REFERENCE_DATE): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = dateStr.trim();
  if (clean.toLowerCase() === 'none' || clean.toLowerCase() === 'unassigned' || clean.toLowerCase() === 'tbd') {
    return null;
  }

  // Check ISO format YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return new Date(year, month, day, 17, 0, 0);
  }

  // Check "Month Day, Year" or "Month Day"
  const monthMap: Record<string, number> = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
  };

  const parts = clean.replace(/,/g, '').split(/\s+/);
  if (parts.length >= 2) {
    const mStr = parts[0].toLowerCase();
    if (monthMap[mStr] !== undefined) {
      const month = monthMap[mStr];
      const day = parseInt(parts[1], 10);
      let year = refDate.getFullYear();
      if (parts.length >= 3) {
        const parsedYear = parseInt(parts[2], 10);
        if (!isNaN(parsedYear)) year = parsedYear;
      }
      if (!isNaN(day) && day >= 1 && day <= 31) {
        return new Date(year, month, day, 17, 0, 0);
      }
    }
  }

  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

/**
 * Calculates whole calendar days between reference date and target date
 * e.g., if target is tomorrow, returns 1
 * if target was yesterday, returns -1
 * if target is today, returns 0
 */
export function getCalendarDaysDiff(target: Date, refDate: Date = DEMO_REFERENCE_DATE): number {
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const refDay = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const diffTime = targetDay.getTime() - refDay.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns a human-friendly reminder status tag for a task
 */
export function calculateTaskReminderStatus(task: ActionItem, refDate: Date = DEMO_REFERENCE_DATE): string {
  if (task.status === 'completed') {
    return 'Completed — reminders stopped';
  }

  const deadlineStr = task.currentDeadline || task.originalDeadline || task.deadline;
  const dateObj = parseDeadlineToDate(deadlineStr, refDate);
  if (!dateObj) {
    return 'No deadline set';
  }

  const diff = getCalendarDaysDiff(dateObj, refDate);
  if (diff < 0) {
    const daysOverdue = Math.abs(diff);
    return `Overdue by ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'}`;
  }
  if (diff === 0) {
    return 'Deadline today';
  }
  if (diff === 1) {
    return 'Next reminder in 1 day';
  }
  return `Next reminder in ${diff} days`;
}

export interface TaskReminderDetail {
  statusText: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  category: 'overdue' | 'today' | 'tomorrow' | 'this_week' | 'upcoming_later' | 'none';
  reminderStage: string;
  daysDiff: number | null;
}

export function calculateTaskReminderDetail(task: ActionItem, refDate: Date = DEMO_REFERENCE_DATE): TaskReminderDetail {
  if (task.status === 'completed') {
    return {
      statusText: 'Completed — reminders stopped',
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      category: 'none',
      reminderStage: 'Completed',
      daysDiff: null,
    };
  }

  const deadlineStr = task.currentDeadline || task.originalDeadline || task.deadline;
  const dateObj = parseDeadlineToDate(deadlineStr, refDate);
  if (!dateObj) {
    return {
      statusText: 'No deadline set',
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      category: 'none',
      reminderStage: 'No deadline',
      daysDiff: null,
    };
  }

  const diff = getCalendarDaysDiff(dateObj, refDate);
  if (diff < 0) {
    const daysOverdue = Math.abs(diff);
    return {
      statusText: `Overdue by ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'}`,
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
      category: 'overdue',
      reminderStage: 'Overdue',
      daysDiff: diff,
    };
  }

  if (diff === 0) {
    return {
      statusText: 'Deadline today',
      isOverdue: false,
      isToday: true,
      isTomorrow: false,
      category: 'today',
      reminderStage: 'On the day of deadline',
      daysDiff: 0,
    };
  }

  if (diff === 1) {
    return {
      statusText: 'Due tomorrow',
      isOverdue: false,
      isToday: false,
      isTomorrow: true,
      category: 'tomorrow',
      reminderStage: '1 day before',
      daysDiff: 1,
    };
  }

  if (diff <= 3) {
    return {
      statusText: `Next reminder in ${diff} days`,
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      category: 'this_week',
      reminderStage: '3 days before',
      daysDiff: diff,
    };
  }

  if (diff <= 7) {
    return {
      statusText: `Next reminder in ${diff} days`,
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      category: 'this_week',
      reminderStage: '7 days before',
      daysDiff: diff,
    };
  }

  return {
    statusText: `Next reminder in ${diff} days`,
    isOverdue: false,
    isToday: false,
    isTomorrow: false,
    category: 'upcoming_later',
    reminderStage: '7 days before',
    daysDiff: diff,
  };
}

export interface DeadlineBucketItem {
  task: ActionItem;
  meetingId: string;
  meetingTitle: string;
  dueDate: string;
  daysDiff: number;
}

export interface DeadlineBuckets {
  today: DeadlineBucketItem[];
  tomorrow: DeadlineBucketItem[];
  thisWeek: DeadlineBucketItem[];
  overdue: DeadlineBucketItem[];
}

/**
 * Categorizes all action items across meetings into Dashboard deadline buckets
 */
export function calculateDeadlineBuckets(
  meetings: Meeting[],
  refDate: Date = DEMO_REFERENCE_DATE
): DeadlineBuckets {
  const buckets: DeadlineBuckets = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    overdue: [],
  };

  meetings.forEach((m) => {
    m.actionItems.forEach((task) => {
      // Completed tasks don't clutter active deadline monitoring
      if (task.status === 'completed') return;

      const deadlineStr = task.currentDeadline || task.originalDeadline || task.deadline;
      const dateObj = parseDeadlineToDate(deadlineStr, refDate);
      if (!dateObj) return;

      const diff = getCalendarDaysDiff(dateObj, refDate);
      const item: DeadlineBucketItem = {
        task,
        meetingId: m.id,
        meetingTitle: m.title,
        dueDate: deadlineStr || 'Pending',
        daysDiff: diff,
      };

      if (diff < 0) {
        buckets.overdue.push(item);
      } else if (diff === 0) {
        buckets.today.push(item);
      } else if (diff === 1) {
        buckets.tomorrow.push(item);
      } else if (diff > 1 && diff <= 7) {
        buckets.thisWeek.push(item);
      }
    });
  });

  // Sort each bucket by deadline urgency
  buckets.overdue.sort((a, b) => a.daysDiff - b.daysDiff);
  buckets.today.sort((a, b) => a.task.task.localeCompare(b.task.task));
  buckets.tomorrow.sort((a, b) => a.task.task.localeCompare(b.task.task));
  buckets.thisWeek.sort((a, b) => a.daysDiff - b.daysDiff);

  return buckets;
}

/**
 * Generates dynamic, preference-aware reminder notifications from extracted meeting tasks
 */
export function generateDeadlineNotifications(
  meetings: Meeting[],
  preferences: NotificationPreferences,
  readNotificationIds: Set<string> = new Set(),
  dismissedNotificationIds: Set<string> = new Set(),
  refDate: Date = DEMO_REFERENCE_DATE
): ReminderNotification[] {
  const notifications: ReminderNotification[] = [];

  meetings.forEach((m) => {
    m.actionItems.forEach((task) => {
      // Rule: Do NOT create reminders for completed tasks or tasks with no deadline
      if (task.status === 'completed') return;

      const deadlineStr = task.currentDeadline || task.originalDeadline || task.deadline;
      const dateObj = parseDeadlineToDate(deadlineStr, refDate);
      if (!dateObj) return;

      const diff = getCalendarDaysDiff(dateObj, refDate);
      let notifData: {
        id: string;
        title: string;
        message: string;
        type: 'missed' | 'today' | 'tomorrow' | 'upcoming_3d' | 'upcoming_7d';
        severity: 'urgent' | 'warning' | 'info';
      } | null = null;

      const timing = preferences?.reminderTiming || {
        sevenDays: true,
        threeDays: true,
        oneDay: true,
        deadlineDay: true,
      };

      // Tier: Missed deadline (< 0)
      if (diff < 0) {
        if (preferences?.missedDeadlineAlerts !== false) {
          const daysOverdue = Math.abs(diff);
          notifData = {
            id: `notif-missed-${task.id}`,
            title: 'Missed deadline',
            message: `"${task.task}" was due ${daysOverdue === 1 ? 'yesterday' : `${daysOverdue} days ago`}.`,
            type: 'missed',
            severity: 'urgent',
          };
        }
      }
      // Tier: Due today (diff === 0)
      else if (diff === 0) {
        if (preferences?.deadlineReminders !== false && timing.deadlineDay) {
          notifData = {
            id: `notif-today-${task.id}`,
            title: 'Deadline today',
            message: `"${task.task}" is due today.`,
            type: 'today',
            severity: 'urgent',
          };
        }
      }
      // Tier: Due tomorrow (diff === 1)
      else if (diff === 1) {
        if (preferences?.deadlineReminders !== false && timing.oneDay) {
          notifData = {
            id: `notif-tomorrow-${task.id}`,
            title: 'Deadline tomorrow',
            message: `"${task.task}" is due tomorrow.`,
            type: 'tomorrow',
            severity: 'warning',
          };
        }
      }
      // Tier: Due in 2 to 3 days
      else if (diff > 1 && diff <= 3) {
        if (preferences?.deadlineReminders !== false && timing.threeDays) {
          notifData = {
            id: `notif-3d-${task.id}`,
            title: 'Upcoming deadline',
            message: `Reminder: "${task.task}" is due in ${diff} days.`,
            type: 'upcoming_3d',
            severity: 'info',
          };
        }
      }
      // Tier: Due in 4 to 7 days
      else if (diff > 3 && diff <= 7) {
        if (preferences?.deadlineReminders !== false && timing.sevenDays) {
          notifData = {
            id: `notif-7d-${task.id}`,
            title: 'Upcoming deadline',
            message: `"${task.task}" is due in ${diff} days.`,
            type: 'upcoming_7d',
            severity: 'info',
          };
        }
      }

      if (notifData && !dismissedNotificationIds.has(notifData.id)) {
        notifications.push({
          id: notifData.id,
          taskId: task.id,
          meetingId: m.id,
          title: notifData.title,
          message: notifData.message,
          taskTitle: task.task,
          responsiblePerson: task.responsiblePerson || 'Unassigned',
          dueDate: deadlineStr || 'Not specified',
          daysDiff: diff,
          type: notifData.type,
          severity: notifData.severity,
          timestamp: diff < 0 ? 'Urgent' : diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : `In ${diff}d`,
          read: readNotificationIds.has(notifData.id),
          dismissed: false,
        });
      }
    });
  });

  // Sort notifications: Urgent/Missed & Today first, then tomorrow, then upcoming
  const priorityScore = (type: string) => {
    switch (type) {
      case 'missed': return 5;
      case 'today': return 4;
      case 'tomorrow': return 3;
      case 'upcoming_3d': return 2;
      default: return 1;
    }
  };

  return notifications.sort((a, b) => priorityScore(b.type) - priorityScore(a.type));
}

/**
 * Browser Notification Helper
 */
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (window.Notification.permission === 'granted') {
    return true;
  }
  if (window.Notification.permission !== 'denied') {
    const result = await window.Notification.requestPermission();
    return result === 'granted';
  }
  return false;
}

export function sendBrowserNotification(title: string, body: string): void {
  if (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    window.Notification.permission === 'granted'
  ) {
    try {
      new window.Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    } catch (e) {
      console.warn('Browser notification failed:', e);
    }
  }
}
