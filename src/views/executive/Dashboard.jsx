import React from 'react';
import { Download, TrendingUp, AlertTriangle, ArrowRight, ArrowUpRight, BarChart3, Users, DollarSign, Briefcase, Activity, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { NavLink } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">C-Suite Overview</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Global Company State</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.success('Board Report exported successfully')} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm">
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* METRICS ROW - Linear style */}
      <div className="flex flex-wrap items-center gap-10 text-sm">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-slate-800 tracking-tight">145</span>
          <div>
            <span className="text-slate-500 font-medium block text-xs">Total Headcount</span>
            <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5"><TrendingUp size={12} /> +12 YTD</span>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-slate-800 tracking-tight">€4.2M</span>
          <div>
            <span className="text-slate-500 font-medium block text-xs">Payroll YTD</span>
            <span className="text-[10px] font-bold text-red-600 flex items-center gap-0.5"><TrendingUp size={12} /> +2.4% vs LY</span>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800 tracking-tight">2.4%</span>
          <div>
            <span className="text-slate-500 font-medium block text-xs">Current Absenteeism</span>
            <span className="text-[10px] font-medium text-green-600 flex items-center gap-0.5"><TrendingUp size={12} className="rotate-180" /> -0.5% this month</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* DEPARTMENTAL BREAKDOWN */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Departmental Breakdown</h2>
              <span className="text-xs text-slate-500 font-medium">Real-time sync</span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 font-medium">Department</th>
                    <th className="py-3 px-4 font-medium">Headcount</th>
                    <th className="py-3 px-4 font-medium">Payroll (YTD)</th>
                    <th className="py-3 px-4 font-medium">Absences</th>
                    <th className="py-3 px-4 font-medium">QVT Sentiment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { dept: 'Engineering', hc: 68, pay: '€2.1M', abs: 3, qvt: 68, qvtColor: 'text-yellow-600' },
                    { dept: 'Sales', hc: 32, pay: '€1.2M', abs: 1, qvt: 82, qvtColor: 'text-green-600' },
                    { dept: 'Marketing', hc: 15, pay: '€350K', abs: 0, qvt: 75, qvtColor: 'text-green-600' },
                    { dept: 'Product', hc: 18, pay: '€420K', abs: 2, qvt: 65, qvtColor: 'text-yellow-600' },
                    { dept: 'HR & Admin', hc: 12, pay: '€280K', abs: 0, qvt: 88, qvtColor: 'text-green-600' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{row.dept}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{row.hc}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{row.pay}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {row.abs > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                            {row.abs} active
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">None</span>
                        )}
                      </td>
                      <td className={`py-3.5 px-4 font-bold text-xs ${row.qvtColor}`}>{row.qvt}/100</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CRITICAL ALERTS */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Strategic Risk Factors
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 border-l-4 border-l-red-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => toast('Opening details...')}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-red-600 font-bold text-xs">
                    <AlertTriangle size={14} /> Turnover Spike
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold">Engineering</span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Predictive models indicate a 15% probability of losing 3+ senior engineers next quarter due to compensation lag.
                </p>
                <div className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                  Financial Risk: <span className="text-red-600">~€240K</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow cursor-pointer" onClick={() => toast('Opening details...')}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-yellow-600 font-bold text-xs">
                    <AlertTriangle size={14} /> Hiring Bottleneck
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold">Sales</span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Time-to-hire for Enterprise Account Executives has increased to 45 days, threatening Q3 revenue targets.
                </p>
                <div className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                  Revenue Risk: <span className="text-yellow-600">~€1.2M pipeline</span>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">

          {/* EDUNAI DARK CARD - ACTIVITY SUMMARY */}
          <div className="bg-[#0f121d] rounded-2xl p-6 text-white shadow-xl">
             <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-5 flex items-center gap-2"><Activity size={14} /> Live Company Pulse</h3>
             <div className="space-y-4">
              {[
                { title: 'New Hires (Onboarding)', value: '4', icon: Users, color: 'text-blue-400' },
                { title: 'Currently on Leave', value: '6', icon: Calendar, color: 'text-yellow-400' },
                { title: 'Pending HR Validations', value: '8', icon: Clock, color: 'text-red-400' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0 hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg bg-white/10 ${item.color}`}>
                        <Icon size={14} />
                      </div>
                      <span className="text-sm font-medium text-white/80">{item.title}</span>
                    </div>
                    <span className="text-lg font-bold text-white">{item.value}</span>
                  </div>
                );
              })}
             </div>
          </div>

          {/* BOARD AGENDA */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5">
             <h3 className="text-sm font-bold text-slate-800 mb-4">Pending Board Decisions</h3>
             <div className="space-y-4">
              {[
                { title: 'Approve Q4 Hiring Budget', amount: '€250K', status: 'Pending Approval' },
                { title: 'Revise Remote Work Policy', amount: 'N/A', status: 'Under Review' },
              ].map((item, i) => (
                <div key={i} className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toast('Opening agenda item...')}>
                  <div className="text-sm font-bold text-slate-800 mb-1">{item.title}</div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Impact: <span className="font-semibold text-slate-700">{item.amount}</span></span>
                    <span className="text-primary-600 font-bold">{item.status}</span>
                  </div>
                </div>
              ))}
             </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Strategic Tools</h3>
            <div className="space-y-2">
              <NavLink to="/sandbox" className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-primary-200 hover:bg-primary-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-primary-600 shadow-sm">
                    <BarChart3 size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-primary-700">Financial Sandbox</div>
                    <div className="text-[10px] text-slate-500">Run simulations</div>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-slate-300 group-hover:text-primary-500" />
              </NavLink>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
