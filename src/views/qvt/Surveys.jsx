import React, { useState, useEffect } from 'react';
import { Plus, BarChart2, Search, ArrowUpRight, MessageCircle, Sparkles, Users, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Minus, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../services/useApi';

const STRESS_EMOJI = ['😌', '🙂', '😐', '😟', '🤯'];
const WORKLOAD_EMOJI = ['😴', '😊', '👍', '😓', '🚨'];
const SATISFACTION_EMOJI = ['😍', '😄', '😐', '😕', '😞'];

const STRESS_LABELS = ['Calm', 'Relaxed', 'Moderate', 'Stressed', 'Overwhelmed'];
const WORKLOAD_LABELS = ['Light', 'Balanced', 'Normal', 'Heavy', 'Overloaded'];
const SATISFACTION_LABELS = ['Great', 'Good', 'Average', 'Low', 'Poor'];

const PulseCard = ({ pulse }) => {
  const [expanded, setExpanded] = useState(false);
  const rate = pulse.total_employees > 0 ? Math.round((pulse.responses / pulse.total_employees) * 100) : 0;

  // Convert avg values (1-5) to 0-4 index for emoji display
  const stressIdx = Math.round(pulse.avg_stress) - 1;
  const workloadIdx = Math.round(pulse.avg_workload) - 1;
  const satisfactionIdx = Math.round(pulse.avg_satisfaction) - 1;

  const questions = [
    { q: 'How stressed did you feel this week?', emoji: STRESS_EMOJI, avg: Math.max(0, stressIdx), avgLabel: STRESS_LABELS[Math.max(0, stressIdx)] },
    { q: 'Is your workload manageable?', emoji: WORKLOAD_EMOJI, avg: Math.max(0, workloadIdx), avgLabel: WORKLOAD_LABELS[Math.max(0, workloadIdx)] },
    { q: 'Overall satisfaction this week?', emoji: SATISFACTION_EMOJI, avg: Math.max(0, satisfactionIdx), avgLabel: SATISFACTION_LABELS[Math.max(0, satisfactionIdx)] },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div
        className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-500 flex-shrink-0">
            <Sparkles size={15} />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
              {pulse.department} — Pulse
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded-md">AI Pulse</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
              <Users size={10} /> {pulse.department} · {pulse.responses}/{pulse.total_employees} responses · {rate}% rate
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border ${
            pulse.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            {pulse.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
            {pulse.status === 'active' ? 'Active' : 'Closed'}
          </span>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/40">
          {/* Questions summary */}
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-700 mb-2">{q.q}</p>
                <div className="flex gap-2 justify-between">
                  {q.emoji.map((em, idx) => (
                    <div key={idx} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border-2 transition-all ${
                      q.avg === idx ? 'border-primary-400 bg-primary-50' : 'border-transparent bg-slate-50'
                    }`}>
                      <span className="text-xl">{em}</span>
                      {q.avg === idx && (
                        <span className="text-[8px] font-bold text-primary-600 bg-primary-100 px-1 rounded">Avg</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-right">Team average: <span className="font-bold text-slate-700">{q.avgLabel}</span></p>
              </div>
            ))}
          </div>
          {/* AI Summary */}
          {pulse.ai_summary && (
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-3">
              <p className="text-[10px] font-bold text-primary-700 mb-1 flex items-center gap-1"><Sparkles size={10} /> AI Analysis</p>
              <p className="text-xs text-primary-800 leading-relaxed">{pulse.ai_summary}</p>
            </div>
          )}
          <button onClick={() => toast('Drafting QVT intervention...')} className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors">
            Generate Intervention Recommendation →
          </button>
        </div>
      )}
    </div>
  );
};

const Surveys = () => {
  const { get, post, patch } = useApi();
  const [tab, setTab] = useState('pulses');
  const [filter, setFilter] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Data from API
  const [pulses, setPulses] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Create survey modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSurvey, setNewSurvey] = useState({ title: '', survey_type: 'classic', target: 'Company-wide', department: '' });
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pulsesRes, surveysRes, deptsRes] = await Promise.all([
        get('/api/qvt/surveys/pulse-by-department', { silent: true }),
        get('/api/qvt/surveys/', { silent: true }),
        get('/api/qvt/surveys/departments', { silent: true }),
      ]);
      setPulses(pulsesRes || []);
      setSurveys(surveysRes || []);
      setDepartments(deptsRes || []);
    } catch (err) {
      console.error('Failed to load surveys data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSurvey = async () => {
    if (!newSurvey.title.trim()) {
      toast.error('Please enter a survey title');
      return;
    }
    setCreating(true);
    try {
      await post('/api/qvt/surveys/', newSurvey);
      toast.success(`Survey "${newSurvey.title}" created successfully!`);
      setShowCreateModal(false);
      setNewSurvey({ title: '', survey_type: 'classic', target: 'Company-wide', department: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to create survey:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleCloseSurvey = async (surveyId, surveyTitle) => {
    try {
      await patch(`/api/qvt/surveys/${surveyId}/close`);
      toast.success(`Survey "${surveyTitle}" closed`);
      fetchData();
    } catch (err) {
      console.error('Failed to close survey:', err);
    }
  };

  const handleGenerateAiPulse = async () => {
    if (departments.length === 0) {
      toast.error('No departments found in the system');
      return;
    }
    setCreating(true);
    try {
      let created = 0;
      for (const dept of departments) {
        try {
          await post('/api/qvt/surveys/', {
            title: `Weekly Pulse — ${dept}`,
            survey_type: 'ai_pulse',
            target: dept,
            department: dept,
          });
          created++;
        } catch (err) {
          console.warn(`Pulse already exists or failed for ${dept}`, err);
        }
      }
      toast.success(`AI Pulse created for ${created} department(s)!`);
      fetchData();
    } catch (err) {
      console.error('Failed to generate AI Pulse:', err);
    } finally {
      setCreating(false);
    }
  };

  // Derived data
  const classicSurveys = surveys.filter(s => s.survey_type === 'classic');
  const activePulseCount = pulses.length;
  const activeClassicCount = classicSurveys.filter(s => s.status === 'active').length;

  const filteredSurveys = classicSurveys.filter(s => {
    const matchFilter = filter === 'all' || (filter === 'active' ? s.status === 'active' : s.status === 'closed');
    const matchSearch = !searchTerm || s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Feedback & Sentiment</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Pulse Surveys 💓</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleGenerateAiPulse} disabled={creating} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50">
            <Sparkles size={16} />
            <span>Generate AI Pulse</span>
          </button>
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2">
            <Plus size={16} />
            <span>New Survey</span>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {[
          { id: 'pulses', label: `✨ AI Pulses (${activePulseCount})` },
          { id: 'surveys', label: `📋 Classic Surveys (${activeClassicCount} active)` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${tab === t.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* AI PULSES TAB */}
      {tab === 'pulses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">AI-Generated Pulses by Department</h2>
            <span className="text-xs text-slate-500">Aggregated from daily Pulse check-ins. Answers are anonymous.</span>
          </div>
          {pulses.length > 0 ? (
            pulses.map((p, i) => <PulseCard key={i} pulse={p} />)
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-8 text-center">
              <Sparkles size={24} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 mb-1">No AI Pulses Yet</p>
              <p className="text-xs text-slate-500">Pulse data will appear here once employees submit daily check-ins.</p>
            </div>
          )}
        </div>
      )}

      {/* CLASSIC SURVEYS TAB */}
      {tab === 'surveys' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
              {[
                { id: 'active', label: `Active (${classicSurveys.filter(s => s.status === 'active').length})` },
                { id: 'closed', label: `Closed (${classicSurveys.filter(s => s.status === 'closed').length})` },
                { id: 'all', label: 'All' }
              ].map(t2 => (
                <button key={t2.id} onClick={() => setFilter(t2.id)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === t2.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {t2.label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search surveys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-medium">Survey Name</th>
                  <th className="py-3 px-4 font-medium">Target & Date</th>
                  <th className="py-3 px-4 font-medium w-1/4">Response Rate</th>
                  <th className="py-3 px-4 font-medium">AI Sentiment</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSurveys.length > 0 ? filteredSurveys.map((survey) => {
                  const total = survey.total_target || 1;
                  const responses = survey.responses_count || 0;
                  const rate = Math.round((responses / total) * 100);
                  const sentiment = survey.sentiment_score;
                  const launchedDate = survey.launched_at ? new Date(survey.launched_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

                  return (
                    <tr key={survey.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <MessageCircle size={14} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors">{survey.title}</div>
                            <div className="text-[10px] text-slate-400">{survey.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs font-medium text-slate-700">{survey.target}</div>
                        <div className="text-[10px] text-slate-500">Launched: {launchedDate}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-500">{responses} / {total}</span>
                            <span className="text-slate-700">{rate}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-800 rounded-full transition-all" style={{ width: `${rate}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {sentiment !== null && sentiment !== undefined ? (
                          <div className="flex items-center gap-2">
                            {sentiment >= 70 ? <ThumbsUp size={14} className="text-green-500" /> : sentiment >= 50 ? <Minus size={14} className="text-yellow-500" /> : <ThumbsDown size={14} className="text-red-500" />}
                            <span className={`text-xs font-bold ${sentiment >= 70 ? 'text-green-600' : sentiment >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{sentiment}/100</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border ${survey.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {survey.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                          {survey.status === 'active' ? 'Active' : 'Closed'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {survey.status === 'active' ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCloseSurvey(survey.id, survey.title); }}
                            className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Close survey
                          </button>
                        ) : (
                          <button className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            View report <ArrowUpRight size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">No surveys found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE SURVEY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Create New Survey</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Survey Title</label>
                <input
                  type="text"
                  value={newSurvey.title}
                  onChange={(e) => setNewSurvey({...newSurvey, title: e.target.value})}
                  placeholder="e.g. Q3 Wellness Check"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Type</label>
                <select
                  value={newSurvey.survey_type}
                  onChange={(e) => setNewSurvey({...newSurvey, survey_type: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="classic">Classic Survey</option>
                  <option value="ai_pulse">AI Pulse Campaign</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Target Audience</label>
                <select
                  value={newSurvey.target}
                  onChange={(e) => setNewSurvey({...newSurvey, target: e.target.value, department: e.target.value !== 'Company-wide' ? e.target.value : ''})}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="Company-wide">Company-wide</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">
                Cancel
              </button>
              <button
                onClick={handleCreateSurvey}
                disabled={creating}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Survey'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Surveys;
