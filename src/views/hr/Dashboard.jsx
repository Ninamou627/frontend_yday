import React, { useState, useEffect } from 'react';
import { Activity, Search, FileCheck, Users, ArrowRight, ArrowUpRight, UserPlus, Clock, Loader2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApi } from '../../services/useApi';

const Dashboard = () => {
  const { get, loading } = useApi();
  const [kpis, setKpis] = useState(null);
  const [validationQueue, setValidationQueue] = useState([]);
  const [activeLifecycles, setActiveLifecycles] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [kpiRes, queueRes, lifecycleRes, actRes] = await Promise.all([
          get('/api/hr/dashboard/kpis'),
          get('/api/hr/dashboard/validation-queue'),
          get('/api/hr/dashboard/active-lifecycles'),
          get('/api/hr/dashboard/activity')
        ]);
        setKpis(kpiRes);
        setValidationQueue(queueRes);
        setActiveLifecycles(lifecycleRes);
        setActivities(actRes);
      } catch (err) {
        console.error("Error fetching HR dashboard data", err);
      }
    };
    fetchDashboardData();
  }, [get]);

  if (loading && !kpis) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary-500 w-8 h-8" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Human Resources</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">HR Command Center</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.success('Opening lifecycle wizard...')}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
          >
            <UserPlus size={16} />
            <span>New Onboarding</span>
          </button>
          <NavLink
            to="/hr/validations"
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2"
          >
            <FileCheck size={16} />
            <span>{kpis?.pending_validations || 0} Docs Pending</span>
          </NavLink>
        </div>
      </div>

      {/* METRICS ROW — Compact, inline */}
      <div className="flex flex-wrap items-center gap-8 text-sm">
        {[
          { label: 'Headcount', value: kpis?.total_headcount || 0, sub: 'Active & inactive', color: 'text-blue-600' },
          { label: 'Turnover', value: `${kpis?.turnover_rate || 0}%`, sub: 'Overall', color: 'text-green-600' },
          { label: 'Open Positions', value: kpis?.open_positions || 0, sub: 'To fill', color: 'text-yellow-600' },
          { label: 'Pending Docs', value: kpis?.pending_validations || 0, sub: 'Require action', color: 'text-red-600' },
        ].map((m, i) => (
          <div key={i} className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 tracking-tight">{m.value}</span>
            <div>
              <span className="text-slate-500 font-medium block text-xs">{m.label}</span>
              <span className={`text-[10px] font-medium ${m.color}`}>{m.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* MAIN COLUMN */}
        <div className="lg:col-span-8 space-y-8">

          {/* VALIDATION QUEUE */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                {validationQueue.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                Validation Queue
              </h2>
              <NavLink to="/hr/validations" className="text-xs font-medium text-slate-500 hover:text-primary-600 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </NavLink>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 font-medium">Employee</th>
                    <th className="py-3 px-4 font-medium">Document</th>
                    <th className="py-3 px-4 font-medium">Source</th>
                    <th className="py-3 px-4 font-medium">Date</th>
                    <th className="py-3 px-4 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validationQueue.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-500 text-sm">No documents pending validation.</td>
                    </tr>
                  ) : (
                    validationQueue.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors group">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${row.owner_name}`} alt="" className="w-full h-full" />
                            </div>
                            <span className="font-bold text-slate-800 text-sm">{row.owner_name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium text-xs">{row.name}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-100 text-slate-600 border-slate-200">{row.source}</span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">{new Date(row.created_at).toLocaleDateString()}</td>
                        <td className="py-3.5 px-4 text-right">
                          <NavLink to="/hr/validations" className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition-colors opacity-0 group-hover:opacity-100">
                            Review
                          </NavLink>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ACTIVE LIFECYCLES */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Lifecycles</h2>
              <NavLink to="/hr/lifecycle" className="text-xs font-medium text-slate-500 hover:text-primary-600 flex items-center gap-1">
                Manage <ArrowRight size={14} />
              </NavLink>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeLifecycles.length === 0 ? (
                <div className="col-span-2 p-6 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-200/60 shadow-sm">No active lifecycles.</div>
              ) : (
                activeLifecycles.map((emp, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => toast(`Opening ${emp.employee_name}'s lifecycle...`)}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${emp.employee_name}`} alt="" className="w-full h-full" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">{emp.employee_name}</div>
                          <div className="text-[10px] text-slate-500">{emp.job_title || 'Employee'}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        emp.lifecycle_type === 'onboarding' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                      }`}>
                        {emp.completed_tasks}/{emp.total_tasks} Tasks
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${emp.lifecycle_type === 'onboarding' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${emp.progress_pct}%` }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">

          {/* Dark card — Directory Quick Search */}
          <div className="bg-[#0f121d] rounded-2xl p-6 text-white shadow-xl">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Directory</h3>
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
              <input
                type="text"
                placeholder="Search employees..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder:text-white/40 transition-all"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3">
                <span className="text-white/70 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Onboarding</span>
                <span className="font-bold">{kpis?.onboarding_count || 0} active</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3">
                <span className="text-white/70 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Offboarding</span>
                <span className="font-bold">{kpis?.offboarding_count || 0} active</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3">
                <span className="text-white/70 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Total</span>
                <span className="font-bold">{kpis?.total_headcount || 0} employees</span>
              </div>
            </div>
            <NavLink to="/hr/directory" className="w-full mt-5 py-2 text-xs font-bold text-white/70 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-all flex justify-center items-center gap-1">
              Open Directory <ArrowUpRight size={12} />
            </NavLink>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-800">Activity</h3>
              <Clock size={16} className="text-slate-400" />
            </div>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-2">No recent activity.</div>
              ) : (
                activities.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0"></div>
                    <div>
                      <div className="text-xs font-medium text-slate-700 leading-relaxed">{item.text}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 capitalize">{item.type} • {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ''}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
