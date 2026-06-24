import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, FileText, Calendar, Bot, User2, AlertCircle, CheckCircle2, Loader2, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../services/useApi';

// ─── Leave Request Form (submits to real API) ────────────────────────────────
const LeaveRequestForm = ({ onSubmit, onCancel, loading }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [leaveType, setLeaveType] = useState('holiday');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!from || !to) { toast.error('Please fill in both dates'); return; }
    if (new Date(to) < new Date(from)) { toast.error('End date must be after start date'); return; }
    onSubmit({ start_date: from, end_date: to, leave_type: leaveType, reason: reason || leaveType });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mt-3 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar size={12} /> Leave Request Form
        </h4>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={14} /></button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-1">From Date</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-1">To Date</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>
      <div className="mb-3">
        <label className="text-[10px] font-bold text-slate-500 block mb-1">Leave Type</label>
        <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="holiday">Paid Leave</option>
          <option value="sick_leave">Sick Leave</option>
          <option value="unpaid">Unpaid Leave</option>
          <option value="family_event">Family Event</option>
          <option value="rtt">RTT</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="text-[10px] font-bold text-slate-500 block mb-1">Reason (optional)</label>
        <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Summer vacation" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : null}
        Submit Request →
      </button>
    </div>
  );
};

// ─── Message bubble renderer ─────────────────────────────────────────────────
const MessageBubble = ({ msg, onShowLeaveForm }) => {
  const isAI = msg.role === 'ai';
  return (
    <div className={`flex items-start gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${isAI ? 'bg-slate-900' : 'bg-primary-100'}`}>
        {isAI ? <Sparkles size={14} className="text-white" /> : <User2 size={14} className="text-primary-600" />}
      </div>
      <div className={`max-w-[80%] ${isAI ? '' : 'text-right'}`}>
        <div className={`text-[10px] font-bold mb-1 ${isAI ? 'text-slate-400 ml-1' : 'text-slate-400 mr-1'}`}>
          {isAI ? 'HR Copilot' : 'You'}
        </div>
        <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
          isAI ? 'bg-white border border-slate-200 rounded-tl-none text-slate-700' : 'bg-slate-800 text-white rounded-tr-none'
        }`}>
          {msg.action_type === 'escalated' && (
            <div className="flex items-center gap-2 mb-2 text-yellow-600 bg-yellow-50 border border-yellow-100 rounded-lg px-2 py-1 text-[10px] font-bold">
              <AlertCircle size={12} /> Escalated to Manager & HR
            </div>
          )}
          {msg.action_type === 'document_generated' && (
            <div className="flex items-center gap-2 mb-2 text-green-700 bg-green-50 border border-green-100 rounded-lg px-2 py-1 text-[10px] font-bold">
              <FileText size={12} /> Document added to My Documents ↗
            </div>
          )}
          {msg.action_type === 'leave_submitted' && (
            <div className="flex items-center gap-2 mb-2 text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 text-[10px] font-bold">
              <CheckCircle2 size={12} /> Leave request submitted — Pending approval
            </div>
          )}
          {isAI ? (
            <div className="ai-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
            </div>
          ) : (
            <span>{msg.text}</span>
          )}
        </div>
        {/* Show leave form trigger button */}
        {msg.action_type === 'leave_form' && isAI && onShowLeaveForm && (
          <button
            onClick={onShowLeaveForm}
            className="mt-2 ml-1 text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
          >
            <Calendar size={11} /> Open leave form <ChevronDown size={11} />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Typing indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm">
      <Sparkles size={14} className="text-white" />
    </div>
    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
      <div className="flex gap-1 items-center h-4">
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  </div>
);

// ─── Main Assistant Component ─────────────────────────────────────────────────
const Assistant = () => {
  const { user } = useAuth();
  const { post, loading } = useApi();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [docCount, setDocCount] = useState(0);
  const messagesEndRef = useRef(null);

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Hello ${firstName}! 👋 I'm your personal HR Copilot. I can:\n• Generate official documents (work certificate, etc.)\n• Submit leave requests for you\n• Answer questions about HR policies (remote work, RTT, mutuelle…)\n\nIf I can't answer, I'll escalate to your manager and HR automatically.`,
      action_type: null,
    }
  ]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showLeaveForm]);

  // Update greeting when user loads
  useEffect(() => {
    if (user?.full_name) {
      setMessages([{
        role: 'ai',
        text: `Hello ${firstName}! 👋 I'm your personal HR Copilot. I can:\n• Generate official documents (work certificate, etc.)\n• Submit leave requests for you\n• Answer questions about HR policies (remote work, RTT, mutuelle…)\n\nIf I can't answer, I'll escalate to your manager and HR automatically.`,
        action_type: null,
      }]);
    }
  }, [user]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput('');
    setShowLeaveForm(false);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: userText, action_type: null }]);
    setIsTyping(true);

    try {
      const res = await post('/api/collaborator/assistant/chat', { message: userText });
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: res.reply,
        action_type: res.action_type,
        action_payload: res.action_payload,
      }]);

      if (res.action_type === 'document_generated') {
        setDocCount(c => c + 1);
        toast.success('Document generated and added to My Documents!');
      }
      if (res.action_type === 'escalated') {
        toast('Your question has been escalated to Manager & HR.', { icon: '📨' });
      }
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Sorry, I encountered an error. Please try again later.',
        action_type: null,
      }]);
    }
  };

  const handleLeaveSubmit = async (leaveData) => {
    setLeaveSubmitting(true);
    try {
      const res = await post('/api/collaborator/leaves/', leaveData);
      setShowLeaveForm(false);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `✅ Your **${leaveData.leave_type.replace('_', ' ')}** request from **${leaveData.start_date}** to **${leaveData.end_date}** (${res.days_count} days) has been submitted and is **Pending** manager approval. You can track it in your Dashboard.`,
        action_type: 'leave_submitted',
      }]);
      toast.success('Leave request submitted!');
    } catch (err) {
      // error already shown by useApi
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const QUICK_PROMPTS = [
    { icon: '📄', text: 'Generate my work certificate' },
    { icon: '🏖️', text: 'I want to request leave' },
    { icon: '🏠', text: 'What is the remote work policy?' },
    { icon: '💊', text: 'How does mutuelle work?' },
    { icon: '⏰', text: 'What are my working hours?' },
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto">

      {/* CHAT AREA */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden">

        {/* Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center relative">
              <Sparkles size={16} className="text-primary-600" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">HR Copilot</h2>
              <p className="text-[10px] text-slate-500">Powered by RAG · Documents, Leaves, Policies</p>
            </div>
          </div>
          {docCount > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={11} /> {docCount} doc(s) ready in My Documents
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/30">
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              msg={msg}
              onShowLeaveForm={msg.action_type === 'leave_form' ? () => setShowLeaveForm(true) : null}
            />
          ))}

          {/* Leave form (inline in chat) */}
          {showLeaveForm && (
            <div className="ml-11">
              <LeaveRequestForm
                onSubmit={handleLeaveSubmit}
                onCancel={() => setShowLeaveForm(false)}
                loading={leaveSubmitting}
              />
            </div>
          )}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
          {/* Quick prompts */}
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => sendMessage(p.text)}
                disabled={loading || isTyping}
                className="text-[10px] font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-primary-50 hover:border-primary-200 text-slate-600 hover:text-primary-700 rounded-full whitespace-nowrap transition-colors disabled:opacity-50"
              >
                {p.icon} {p.text}
              </button>
            ))}
          </div>

          {/* Text input */}
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 transition-all overflow-hidden p-1">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask anything — generate docs, request leave, HR policies..."
              disabled={isTyping}
              className="flex-1 px-4 py-2.5 text-sm bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className={`p-2.5 rounded-lg transition-all flex items-center justify-center mr-1 ${
                input.trim() && !isTyping ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 font-medium text-center mt-2">
            If no answer is found, your question is escalated to Manager & HR automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
