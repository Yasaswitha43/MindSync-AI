import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Ticket, MessageSquare, ListPlus, Copy, Check, X, Send, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DraftModal: React.FC = () => {
  const { activeDraft, setActiveDraft, addToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState(activeDraft?.subject || '');
  const [body, setBody] = useState(activeDraft?.body || '');
  const [recipient, setRecipient] = useState(activeDraft?.recipient || '');
  const [draftType, setDraftType] = useState<'email' | 'ticket' | 'followup_message' | 'agenda'>(
    activeDraft?.type || 'email'
  );

  // Sync state if activeDraft changes
  React.useEffect(() => {
    if (activeDraft) {
      setSubject(activeDraft.subject);
      setBody(activeDraft.body);
      setRecipient(activeDraft.recipient || '');
      setDraftType(activeDraft.type);
    }
  }, [activeDraft]);

  if (!activeDraft) return null;

  const handleCopy = async () => {
    const fullText = draftType === 'email'
      ? `To: ${recipient}\nSubject: ${subject}\n\n${body}`
      : `Title: ${subject}\n\n${body}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      addToast('Copied to Clipboard', 'Draft ready to paste.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      addToast('Copy error', 'Please select text manually.', 'error');
    }
  };

  const handleApprove = () => {
    addToast('Draft Approved', 'Saved to your approved task updates queue.', 'success');
    setActiveDraft(null);
  };

  const formatTemplates: Record<string, { subject: string; body: string }> = {
    email: {
      subject: `Follow-up: Action Items & Commitments from Meeting`,
      body: `Hi team,\n\nFollowing up on our recent sync, here is the confirmed summary of deliverables:\n\n• Action Item: ${activeDraft.taskRef || 'Deliverable'}\n• Confirmed Deadline: Active Sprint\n• Review Status: Pending final sign-off\n\nPlease reply directly if anything requires adjustment.\n\nBest,\nMindSync AI Agent`,
    },
    ticket: {
      subject: `[PROJ] ${activeDraft.taskRef || 'Implement Feature Scope'}`,
      body: `### Description\nTask assigned during meeting sync.\n\n### Acceptance Criteria\n- [ ] Implementation complete and verified\n- [ ] Automated regression tests passing\n- [ ] Reviewed by team lead\n\n### References\nExtracted automatically by MindSync AI from meeting transcript.`,
    },
    followup_message: {
      subject: `Quick Slack update on ${activeDraft.taskRef || 'Task'}`,
      body: `Hey team! 👋 Quick heads up: following our meeting sync, we're tracking "${activeDraft.taskRef || 'deliverable'}". Please ping if you need any unblocking!`,
    },
    agenda: {
      subject: `Upcoming Sync Agenda: Commitments Review`,
      body: `1. Review previous meeting action item: ${activeDraft.taskRef || 'Item'}\n2. Technical blockers & canvas performance\n3. Database migration status\n4. E2E automated testing sign-off`,
    },
  };

  const handleSwitchType = (type: 'email' | 'ticket' | 'followup_message' | 'agenda') => {
    setDraftType(type);
    if (formatTemplates[type]) {
      setSubject(formatTemplates[type].subject);
      setBody(formatTemplates[type].body);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActiveDraft(null)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Do It For Me: AI Draft
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  MindSync prepared this draft for your review. It will not be sent automatically.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveDraft(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Type Selector Tabs */}
          <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/60 overflow-x-auto">
            <button
              onClick={() => handleSwitchType('email')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                draftType === 'email'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Follow-up Email</span>
            </button>
            <button
              onClick={() => handleSwitchType('ticket')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                draftType === 'ticket'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Jira / Linear Ticket</span>
            </button>
            <button
              onClick={() => handleSwitchType('followup_message')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                draftType === 'followup_message'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Slack / Team Msg</span>
            </button>
            <button
              onClick={() => handleSwitchType('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                draftType === 'agenda'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/50'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>Next Meeting Agenda</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {draftType === 'email' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Recipient
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="team@example.com or attendee name"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {draftType === 'ticket' ? 'Ticket Title' : 'Subject Line'}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Draft Content (Editable)
              </label>
              <textarea
                rows={7}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#101625] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed resize-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <span className="font-semibold">Privacy guard:</span>
              <span>
                MindSync drafts never execute autonomously. Review, copy, or approve to record the follow-up.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
            <button
              onClick={() => setActiveDraft(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Draft'}</span>
              </button>
              <button
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Approve Draft</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
