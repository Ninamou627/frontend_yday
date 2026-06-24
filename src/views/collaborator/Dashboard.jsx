import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, Clock, CheckCircle, AlertCircle, Download,
  ArrowRight, ArrowUpRight, Plus, Receipt, Sparkles, X, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../services/useApi';

const DAILY_QUESTIONS = [
  {
    id: 'stress_level',
    label: 'How stressed do you feel today?',
    emoji: ['😌', '🙂', '😐', '😟', '🤯'],
    labels: ['Very calm', 'Calm', 'Neutral', 'Stressed', 'Overloaded'],
  },
  {
    id: 'workload_level',
    label: 'How is your workload right now?',
    emoji: ['😴', '😊', '👍', '😓', '🚨'],
    labels: ['Light', 'Manageable', 'Balanced', 'Heavy', 'Overwhelming'],
  },
  {
    id: 'satisfaction_level',
    label: 'How satisfied are you with your work today?',
    emoji: ['😍', '😄', '😐', '😕', '😞'],
    labels: ['Excellent', 'Good', 'Okay', 'Dissatisfied', 'Unhappy'],
  },
];

export const DailyPulse = ({ onClose, onSubmitted }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0);
  const { post, loading } = useApi();

  const current = DAILY_QUESTIONS[step];

  const handleSelect = async (idx) => {
    // Note: the backend pulse model expects 1-5 scale (where 1 is calm, 5 is overloaded)
    // The emoji array index is 0-4. So we pass idx + 1
    const updated = { ...answers, [current.id]: idx + 1 };
    setAnswers(updated);
    
    if (step < DAILY_QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      try {
        await post('/api/collaborator/pulse/', updated);
        setSubmitted(true);
        toast.success('Daily check-in recorded — thank you! 🙏');
        if (onSubmitted) onSubmitted();
      } catch (err) {
        // Error already handled by useApi
      }
    }
  };

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-5 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
        <div className="text-center py-2">
          <div className="text-3xl mb-2">✅</div>
          <h3 className="text-sm font-bold text-slate-800">Check-in complete!</h3>
          <p className="text-xs text-slate-500 mt-1">Your manager has been anonymously notified of team wellness status.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-5 relative">
      <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
        <X size={16} />
      </button>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-primary-500" />
        <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">AI Daily Check-in</span>
        <span className="ml-auto text-[10px] text-slate-400 font-medium">{step + 1} / {DAILY_QUESTIONS.length}</span>
      </div>
      {/* Progress dots */}
      <div className="flex gap-1.5 mb-4">
        {DAILY_QUESTIONS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-primary-500' : 'bg-primary-100'}`} />
        ))}
      </div>
      <p className="text-sm font-bold text-slate-800 mb-4">{current.label}</p>
      
      {loading ? (
        <div className="flex justify-center items-center py-6"><Loader2 className="animate-spin text-primary-500" /></div>
      ) : (
        <div className="flex justify-between gap-2">
          {current.emoji.map((em, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all hover:scale-105 hover:border-primary-300 hover:bg-white ${
                answers[current.id] === idx + 1 ? 'border-primary-500 bg-white shadow-sm' : 'border-transparent bg-white/60'
              }`}
            >
              <span className="text-2xl">{em}</span>
              <span className="text-[9px] font-bold text-slate-500 text-center leading-tight">{current.labels[idx]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { get, loading } = useApi();
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, actRes, taskRes] = await Promise.all([
          get('/api/collaborator/dashboard/summary'),
          get('/api/collaborator/dashboard/activity'),
          get('/api/collaborator/onboarding/tasks')
        ]);
        setSummary(sumRes);
        setActivities(actRes);
        setTasks(taskRes);
        if (sumRes && !sumRes.pulse_submitted_today) {
          setShowPulse(true);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [get]);

  if (loading && !summary) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary-500 w-8 h-8" /></div>;
  }

  const pendingTasks = tasks.filter(t => !t.is_completed).slice(0, 3);
  const firstName = user?.full_name?.split(' ')[0] || 'Alex';

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{todayStr}</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome back, {firstName} 👋</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.success('Expense form opened')}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
          >
            <Receipt size={16} />
            <span>Expense</span>
          </button>
          <button 
            onClick={() => toast.success('Leave request form opened')}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Request Time Off</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN COLUMN */}
        <div className="lg:col-span-8 space-y-8">

          {/* AI DAILY PULSE — Show if not dismissed */}
          {showPulse && (
            <section>
              <DailyPulse onClose={() => setShowPulse(false)} onSubmitted={() => setShowPulse(false)} />
            </section>
          )}

          {/* ACTION REQUIRED INBOX */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                {pendingTasks.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                Action Required
              </h2>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {pendingTasks.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm font-medium">You're all caught up! No pending tasks.</div>
                ) : (
                  pendingTasks.map((task) => (
                    <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors group flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5"><AlertCircle size={18} className="text-red-500" /></div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{task.title} 📝</h3>
                          <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                        </div>
                      </div>
                      <button onClick={() => toast('Opening task viewer...')} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition-colors whitespace-nowrap">
                        Review & Complete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* RECENT REQUESTS TABLE */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Activity</h2>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium">Details</th>
                    <th className="py-3 px-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activities.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-slate-500 text-xs">No recent activity found.</td>
                    </tr>
                  ) : (
                    activities.map((act, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800 capitalize">{act.type}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{act.text}</td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {act.timestamp ? new Date(act.timestamp).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Time Off Balance — Dark Card */}
          <div className="bg-[#0f121d] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <Calendar size={64} />
            </div>
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Time Off Balance 🌴</h3>
            <div className="mb-6">
              <span className="text-5xl font-black tracking-tight">{summary?.remaining_leave_days || 0}</span>
              <span className="text-lg text-white/70 ml-2 font-medium">Days</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3">
                <span className="text-white/70">Pending Requests</span>
                <span className="font-bold text-yellow-400">{summary?.pending_leave_requests || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3">
                <span className="text-white/70">Onboarding Progress</span>
                <span className="font-bold text-primary-400">{summary?.onboarding_progress_pct || 0}%</span>
              </div>
            </div>
            <button
              onClick={() => toast.success('Leave request form opened')}
              className="w-full mt-4 py-2 text-xs font-bold text-white/70 hover:text-white border border-white/20 rounded-lg hover:bg-white/5 transition-all flex justify-center items-center gap-1"
            >
              Request leave <ArrowRight size={12} />
            </button>
          </div>

          {/* Recent Payslips */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-800">Recent Payslips 💳</h3>
              <FileText size={16} className="text-slate-400" />
            </div>
            <div className="space-y-2">
              {['July 2026', 'June 2026', 'May 2026'].map((month, i) => (
                <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer" onClick={() => toast.success(`Downloading ${month} payslip`)}>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                      <span className="text-[10px] font-bold">PDF</span>
                    </div>
                    <span className="font-medium text-slate-700">{month}</span>
                  </div>
                  <Download size={14} className="text-slate-400" />
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all flex justify-center items-center gap-1">
              View full archive <ArrowUpRight size={12} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
