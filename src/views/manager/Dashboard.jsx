import React, { useState } from 'react';
import { Users, AlertTriangle, Calendar, ChevronRight, ArrowUpRight, Clock, TrendingDown, ArrowRight, Plus, FileText, X, CheckCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';

const AbsenceModal = ({ onClose }) => {
  const [collab, setCollab] = useState('Sarah Jenkins');
  const [type, setType] = useState('Sick Leave');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!from || !to) { toast.error('Please fill in both dates'); return; }
    toast.success(`${type} recorded for ${collab}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Record Absence / Sick Leave</h2>
            <p className="text-xs text-slate-500 mt-0.5">For a member of your team</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Team Member</label>
            <select
              value={collab}
              onChange={e => setCollab(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option>Sarah Jenkins</option>
              <option>David Chen</option>
              <option>Elena Rodriguez</option>
              <option>Michael Chang</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Absence Type</label>
            <div className="flex gap-2 flex-wrap">
              {['Sick Leave', 'Unjustified', 'Family Emergency', 'Other'].map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    type === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">From</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">To</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Manager Notes (Optional)</label>
            <textarea
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Medical certificate received, context..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">Record Absence</button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);

  const team = [
    { name: 'Sarah Jenkins', role: 'Senior Engineer', status: 'At risk', statusColor: 'bg-red-500', flag: '🔥 Burnout signals detected' },
    { name: 'David Chen', role: 'Frontend Developer', status: 'On leave', statusColor: 'bg-yellow-500', flag: '🏖️ Returns Aug 28' },
    { name: 'Elena Rodriguez', role: 'Backend Engineer', status: 'Active', statusColor: 'bg-green-500', flag: null },
    { name: 'Michael Chang', role: 'QA Engineer', status: 'Active', statusColor: 'bg-green-500', flag: null },
  ];

  const absences = [
    { name: 'David Chen', type: 'Sick Leave', from: 'Aug 20', to: 'Aug 28', status: 'Validated' },
    { name: 'Sarah Jenkins', type: 'Unjustified', from: 'Aug 15', to: 'Aug 15', status: 'Pending HR' },
  ];

  return (
    <>
      {showAbsenceModal && <AbsenceModal onClose={() => setShowAbsenceModal(false)} />}

      <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Team Performance — Engineering Squad</p>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Your Direct Reports</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowAbsenceModal(true)}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <FileText size={14} />
              <span>Record Absence</span>
            </button>
            <NavLink to="/alerts" className="px-4 py-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
              <AlertTriangle size={14} />
              <span>3 Alerts</span>
            </NavLink>
            <NavLink to="/approvals" className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2">
              <Clock size={14} />
              <span>5 Pending</span>
            </NavLink>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* MAIN COLUMN */}
          <div className="lg:col-span-8 space-y-8">

            {/* TEAM TABLE — only own team */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">My Team ({team.length} reports)</h2>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Scope: Direct Reports Only</span>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 font-medium">Name</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium">Notes / Flags</th>
                      <th className="py-3 px-4 font-medium text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {team.map((member, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => toast(`Opening profile: ${member.name}`)}>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${member.name}`} alt="" className="w-full h-full" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors">{member.name}</div>
                              <div className="text-[11px] text-slate-500">{member.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border" style={{
                            backgroundColor: member.status === 'At risk' ? '#fef2f2' : member.status === 'On leave' ? '#fefce8' : '#f0fdf4',
                            borderColor: member.status === 'At risk' ? '#fecaca50' : member.status === 'On leave' ? '#fef08a50' : '#bbf7d050',
                            color: member.status === 'At risk' ? '#dc2626' : member.status === 'On leave' ? '#ca8a04' : '#16a34a',
                          }}>
                            <span className={`w-1.5 h-1.5 rounded-full ${member.statusColor}`}></span>
                            {member.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">{member.flag || '—'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ABSENCE REGISTER */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Absence Register</h2>
                <button onClick={() => setShowAbsenceModal(true)} className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  <Plus size={12} /> Record new
                </button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 font-medium">Collaborator</th>
                      <th className="py-3 px-4 font-medium">Type</th>
                      <th className="py-3 px-4 font-medium">Period</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {absences.map((a, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800 text-sm">{a.name}</td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600">{a.type}</td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">{a.from} → {a.to}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border ${
                            a.status === 'Validated' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                          }`}>
                            {a.status === 'Validated' ? <CheckCircle size={10} /> : <Clock size={10} />}
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* PRIORITY ALERT */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Top AI Alert
                </h2>
                <NavLink to="/alerts" className="text-xs font-medium text-slate-500 hover:text-primary-600 flex items-center gap-1">
                  All alerts <ArrowRight size={14} />
                </NavLink>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-red-50">
                      <AlertTriangle size={16} className="text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">🔥 Burnout Risk — Sarah Jenkins</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-lg">
                        15% increase in out-of-hours activity over 3 weeks. No 1-on-1 meetings in 6 months.
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2 italic">AI Explainability: Based on work-hours & meeting frequency. No private data accessed.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => toast('Scheduling 1-on-1...')} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition-colors">
                      Schedule 1-on-1
                    </button>
                    <button onClick={() => toast('Opening workload view...')} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-md transition-colors">
                      Adjust Workload
                    </button>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0f121d] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-5">Team Pulse 💓</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-white/70 text-sm">Avg. Engagement</span>
                  <span className="text-2xl font-black">72%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <div className="flex justify-between items-baseline border-t border-white/10 pt-3">
                  <span className="text-white/70 text-sm">Absenteeism</span>
                  <span className="font-bold text-green-400 flex items-center gap-1"><TrendingDown size={14} /> 2.4%</span>
                </div>
                <div className="flex justify-between items-baseline border-t border-white/10 pt-3">
                  <span className="text-white/70 text-sm">Sick leaves this month</span>
                  <span className="font-bold text-yellow-400">2</span>
                </div>
                <div className="flex justify-between items-baseline border-t border-white/10 pt-3">
                  <span className="text-white/70 text-sm">Upcoming leaves</span>
                  <span className="font-bold">3 <span className="text-white/50 text-xs font-normal">next 14d</span></span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-800">Upcoming</h3>
                <Calendar size={16} className="text-slate-400" />
              </div>
              <div className="space-y-3">
                {[
                  { event: '1-on-1 with Elena', time: 'Tomorrow, 10:00', type: 'Meeting' },
                  { event: 'David Chen returns', time: 'Aug 28', type: 'Leave' },
                  { event: 'Q3 Review deadline', time: 'Sep 1', type: 'Deadline' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0"></div>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{item.event}</div>
                      <div className="text-[11px] text-slate-500">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
