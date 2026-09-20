import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckSquare,
  Search,
  Check,
  Calendar,
  User,
  FolderKanban,
  ExternalLink,
  Plus,
  Trash2,
  X,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Bell,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TasksPage: React.FC = () => {
  const {
    allActionItems,
    meetings,
    toggleTaskStatus,
    deleteActionItem,
    addActionItem,
    setSelectedMeetingId,
    setResultsTab,
    setPage,
    setActiveDraft,
    setActiveEvidence,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'due_soon' | 'overdue' | 'completed'>('all');
  const [personFilter, setPersonFilter] = useState<string>('all');
  const [meetingFilter, setMeetingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Task Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [targetMeetingId, setTargetMeetingId] = useState<string>(meetings[0]?.id || '');
  const [newTask, setNewTask] = useState('');
  const [newPerson, setNewPerson] = useState('');
  const [newDeadline, setNewDeadline] = useState('Sep 28, 2026');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Extract unique people across all tasks
  const people = Array.from(
    new Set(allActionItems.map((a) => a.responsiblePerson).filter(Boolean))
  );

  const pendingCount = allActionItems.filter((a) => a.status !== 'completed').length;
  const overdueCount = allActionItems.filter((a) => a.status !== 'completed' && a.reminderStatus?.isOverdue).length;
  const dueSoonCount = allActionItems.filter(
    (a) => a.status !== 'completed' && !a.reminderStatus?.isOverdue && (a.reminderStatus?.category === 'today' || a.reminderStatus?.category === 'tomorrow' || a.reminderStatus?.category === 'this_week')
  ).length;
  const completedCount = allActionItems.filter((a) => a.status === 'completed').length;

  const filteredTasks = allActionItems.filter((item) => {
    if (statusFilter === 'overdue') {
      if (item.status === 'completed' || !item.reminderStatus?.isOverdue) return false;
    } else if (statusFilter === 'due_soon') {
      if (
        item.status === 'completed' ||
        item.reminderStatus?.isOverdue ||
        !(item.reminderStatus?.category === 'today' || item.reminderStatus?.category === 'tomorrow' || item.reminderStatus?.category === 'this_week')
      )
        return false;
    } else if (statusFilter === 'completed') {
      if (item.status !== 'completed') return false;
    }

    if (personFilter !== 'all' && item.responsiblePerson !== personFilter) return false;
    if (meetingFilter !== 'all' && item.meetingId !== meetingFilter) return false;
    if (
      searchQuery.trim() &&
      !item.task.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.responsiblePerson.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleOpenMeeting = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setResultsTab('actions');
    setPage('results');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !targetMeetingId) return;
    addActionItem(targetMeetingId, newTask.trim(), newPerson.trim() || 'Unassigned', newDeadline, newPriority);
    setNewTask('');
    setNewPerson('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Action Items & Tasks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global action items consolidated across all recorded team meetings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {completedCount} Completed
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {pendingCount} Pending
            </span>
          </div>

          <button
            onClick={() => {
              if (meetings.length > 0 && !targetMeetingId) {
                setTargetMeetingId(meetings[0].id);
              }
              setIsAddOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-theme flex flex-wrap items-center justify-between gap-3">
        {/* Status Toggle Pills: All, Due Soon, Overdue, Completed */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All ({allActionItems.length})
          </button>

          <button
            onClick={() => setStatusFilter('due_soon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              statusFilter === 'due_soon'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Due Soon ({dueSoonCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Overdue ({overdueCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Completed ({completedCount})</span>
          </button>
        </div>

        {/* Dropdown Filters: By Person & By Meeting */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-40 sm:w-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filter by Person */}
          <select
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All People</option>
            {people.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Filter by Meeting */}
          <select
            value={meetingFilter}
            onChange={(e) => setMeetingFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer max-w-[160px]"
          >
            <option value="all">All Meetings</option>
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((item) => {
          const isCompleted = item.status === 'completed';
          return (
            <motion.div
              key={item.id}
              layout
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isCompleted
                  ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-80'
                  : 'bg-white dark:bg-[#0f1422] border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => toggleTaskStatus(item.id)}
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-400/80 hover:border-emerald-500 text-transparent'
                  }`}
                  aria-label="Toggle task"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <p
                    className={`text-xs sm:text-sm font-semibold transition-all ${
                      isCompleted
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {item.task}
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                      <User className="w-3 h-3" />
                      {item.responsiblePerson || 'Not specified'}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Due {item.deadline}
                    </span>

                    {/* Reminder Status Badge */}
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Check className="w-2.5 h-2.5" />
                        Reminders Stopped (Completed)
                      </span>
                    ) : item.reminderStatus?.isOverdue ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Overdue
                      </span>
                    ) : item.reminderStatus?.category === 'today' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="w-2.5 h-2.5" />
                        Due Today
                      </span>
                    ) : item.reminderStatus?.category === 'tomorrow' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        <Clock className="w-2.5 h-2.5" />
                        Due Tomorrow
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <Bell className="w-2.5 h-2.5 text-indigo-500" />
                        Reminder set: {item.reminderStatus?.reminderStage || '1 day before'}
                      </span>
                    )}

                    {item.priority && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                          item.priority === 'high'
                            ? 'bg-rose-500/10 text-rose-500'
                            : item.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-blue-500/10 text-blue-500'
                        }`}
                      >
                        {item.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action items button + Origin Meeting Source badge */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() =>
                    setActiveDraft({
                      type: 'ticket',
                      title: `Ticket: ${item.task}`,
                      recipient: item.responsiblePerson !== 'Owner not identified' ? item.responsiblePerson : 'Team',
                      subject: `[PROJ] ${item.task}`,
                      body: `### Description\nTask assigned in meeting: ${item.meetingTitle}\n\n### Responsible Owner\n${item.responsiblePerson}\n\n### Target Deadline\n${item.currentDeadline || item.deadline}\n\n### Context\n${item.commitmentQuote || 'Captured by MindSync AI'}`,
                      taskRef: item.task,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/40 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Do It For Me</span>
                </button>

                {item.evidence && (
                  <button
                    onClick={() => setActiveEvidence(item.evidence!)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
                  >
                    [View Evidence]
                  </button>
                )}

                <button
                  onClick={() => handleOpenMeeting(item.meetingId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 text-xs font-medium transition-colors cursor-pointer"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="truncate max-w-[140px]">{item.meetingTitle}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={() => deleteActionItem(item.id)}
                  title="Delete task"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200/80 dark:border-slate-800 text-slate-400 text-xs">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">No action items found</p>
            <p className="mt-1">Try clearing your search query or filter selections.</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0f1422] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                Create Action Item
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  Target Meeting
                </label>
                <select
                  value={targetMeetingId}
                  onChange={(e) => setTargetMeetingId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {meetings.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  Task Description
                </label>
                <input
                  type="text"
                  required
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="e.g. Schedule infrastructure pen-test"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">
                    Responsible Person
                  </label>
                  <input
                    type="text"
                    value={newPerson}
                    onChange={(e) => setNewPerson(e.target.value)}
                    placeholder="e.g. Dev Team"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">
                    Deadline
                  </label>
                  <input
                    type="text"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    placeholder="e.g. Sep 30, 2026"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Priority</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold uppercase ${
                        newPriority === p
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
