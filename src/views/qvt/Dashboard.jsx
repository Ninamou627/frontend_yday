import React, { useState, useEffect } from 'react';
import { HeartPulse, Smile, Frown, ArrowRight, ArrowUpRight, TrendingUp, TrendingDown, AlertTriangle, MessageCircle, FileText, Loader2 } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApi } from '../../services/useApi';

const Dashboard = () => {
  const { get } = useApi();
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [kpiRes, heatRes, recRes, survRes] = await Promise.all([
          get('/api/qvt/dashboard/kpis'),
          get('/api/qvt/dashboard/heatmap'),
          get('/api/qvt/recommendations/'),
          get('/api/qvt/surveys/'),
        ]);
        setKpis(kpiRes);
        setHeatmap(heatRes || []);
        setRecommendations(recRes || []);
        setSurveys(survRes || []);
      } catch (e) {
        console.error('QVT Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [get]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary-500 w-8 h-8" /></div>;
  }

  // Compute heatmap display data
  const getStressColor = (val) => {
    if (val >= 3.5) return 'bg-red-500';
    if (val >= 2.5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getEngagementLabel = (sat) => {
    if (sat <= 1.5) return 'Very High';
    if (sat <= 2.5) return 'High';
    if (sat <= 3.5) return 'Medium';
    return 'Low';
  };

  // Find department with highest stress for the alert
  const highestStressDept = heatmap.length > 0
    ? heatmap.reduce((max, d) => d.avg_stress > max.avg_stress ? d : max, heatmap[0])
    : null;

  // Interventions: show the latest recommendations
  const activeRecs = recommendations.slice(0, 4);

  const statusStyleMap = {
    pending_hr: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    approved: 'bg-green-50 text-green-700 border-green-100',
    rejected: 'bg-red-50 text-red-700 border-red-100',
    implemented: 'bg-blue-50 text-blue-700 border-blue-100',
  };

  const statusLabelMap = {
    pending_hr: 'Pending HR',
    approved: 'Approved',
    rejected: 'Rejected',
    implemented: 'Implemented',
  };

  // Recent pulse surveys (latest 3)
  const recentSurveys = surveys.filter(s => s.survey_type === 'ai_pulse').slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">QVT & Wellness Analytics</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Wellness Command Center</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/recommendations')} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2">
            <FileText size={16} />
            <span>New Recommendation</span>
          </button>
          <NavLink to="/surveys" className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm">
            <MessageCircle size={16} />
            <span>Launch Pulse</span>
          </NavLink>
        </div>
      </div>

      {/* METRICS ROW — from real KPIs */}
      <div className="flex flex-wrap items-center gap-10 text-sm">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-slate-800 tracking-tight">{kpis?.global_wellness_score ?? '—'}</span>
          <span className="text-lg font-bold text-slate-400">/10</span>
          <div className="ml-2">
            <span className="text-slate-500 font-medium block text-xs">Global Wellness Score</span>
            <span className={`text-[10px] font-bold flex items-center gap-0.5 ${kpis?.wellness_trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpis?.wellness_trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {kpis?.wellness_trend >= 0 ? '+' : ''}{kpis?.wellness_trend ?? 0} this quarter
            </span>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800 tracking-tight">{kpis?.high_stress_pct ?? 0}%</span>
          <div>
            <span className="text-slate-500 font-medium block text-xs">High Stress Indicators</span>
            <span className="text-[10px] font-bold text-red-600 flex items-center gap-0.5">
              <AlertTriangle size={12} /> {kpis?.total_pulse_responses ?? 0} pulse responses analyzed
            </span>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800 tracking-tight">{kpis?.pulse_response_rate ?? 0}%</span>
          <div>
            <span className="text-slate-500 font-medium block text-xs">Pulse Response Rate</span>
            <span className="text-[10px] font-medium text-slate-400">{kpis?.total_employees ?? 0} active employees</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* CRITICAL ALERTS INBOX */}
          {highestStressDept && highestStressDept.avg_stress >= 3.0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Action Required
                </h2>
              </div>
              <div className="bg-white rounded-xl border border-red-200 shadow-sm p-4 border-l-4 border-l-red-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Sustained Workload Warning — {highestStressDept.department}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Avg stress level: {highestStressDept.avg_stress.toFixed(1)}/5 across {highestStressDept.pulse_count} pulse responses from {highestStressDept.employee_count} employees.
                    </p>
                  </div>
                </div>
                <button onClick={() => navigate('/recommendations')} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-md transition-colors whitespace-nowrap border border-red-100">
                  Draft Intervention
                </button>
              </div>
            </section>
          )}

          {/* DEPARTMENT RISK MATRIX — from /heatmap API */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Department Risk Matrix</h2>
              <span className="text-xs text-slate-500 font-medium">Anonymized telemetry • {heatmap.length} departments</span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
              {heatmap.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No pulse data available yet. Launch a pulse survey to start collecting data.</div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 font-medium">Department</th>
                      <th className="py-3 px-4 font-medium w-1/4">Stress Level</th>
                      <th className="py-3 px-4 font-medium">Engagement</th>
                      <th className="py-3 px-4 font-medium text-center">Responses</th>
                      <th className="py-3 px-4 font-medium text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {heatmap
                      .sort((a, b) => b.avg_stress - a.avg_stress)
                      .map((dept, i) => {
                        const stressPct = Math.round((dept.avg_stress / 5) * 100);
                        return (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-800 text-xs">{dept.department}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${getStressColor(dept.avg_stress)} rounded-full`} style={{ width: `${stressPct}%` }}></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 w-12 text-right">{dept.avg_stress.toFixed(1)}/5</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-xs font-medium text-slate-600">{getEngagementLabel(dept.avg_satisfaction)}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{dept.pulse_count}</span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {dept.avg_stress >= 3.5 ? <TrendingUp size={14} className="text-red-500 ml-auto" /> :
                               dept.avg_stress <= 2.0 ? <TrendingDown size={14} className="text-green-500 ml-auto" /> :
                               <span className="text-slate-300 font-bold ml-auto">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </div>
          </section>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* INTERVENTIONS — from real recommendations */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-800">Active Interventions</h3>
              <NavLink to="/recommendations" className="text-slate-400 hover:text-primary-600 transition-colors">
                <ArrowUpRight size={16} />
              </NavLink>
            </div>
            <div className="space-y-4">
              {activeRecs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No recommendations yet. Create one from the Draft tab.</p>
              ) : activeRecs.map((rec) => (
                <div key={rec.id} className="p-3 border border-slate-100 rounded-lg hover:border-slate-300 transition-colors cursor-pointer" onClick={() => navigate('/recommendations')}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs font-bold text-slate-800 pr-2">{rec.title}</div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${statusStyleMap[rec.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {statusLabelMap[rec.status] || rec.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Target: {rec.department}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DARK CARD - RECENT PULSES — from real surveys */}
          <div className="bg-[#0f121d] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
             <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-5">Recent Pulse Surveys</h3>
             <div className="space-y-4">
              {recentSurveys.length === 0 ? (
                <p className="text-white/40 text-xs text-center py-3">No AI Pulse surveys launched yet.</p>
              ) : recentSurveys.map((pulse) => (
                <div key={pulse.id} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
                  <div className="text-sm font-bold text-white mb-1">{pulse.title}</div>
                  <div className="flex justify-between text-[11px] text-white/50">
                    <span>Resp: {pulse.responses_count ?? 0}</span>
                    <span>Sentiment: <span className={`font-bold ${(pulse.sentiment_score ?? 0) >= 60 ? 'text-green-400' : 'text-yellow-400'}`}>{pulse.sentiment_score ?? '—'}%</span></span>
                  </div>
                </div>
              ))}
             </div>
             <NavLink to="/surveys" className="w-full mt-5 py-2 text-xs font-bold text-white/70 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-all flex justify-center items-center gap-1">
              View All Surveys <ArrowRight size={12} />
            </NavLink>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
