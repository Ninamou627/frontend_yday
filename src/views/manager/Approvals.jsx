import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Filter, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Approvals = () => {
  const [filter, setFilter] = useState('pending');

  const requests = [
    { id: 'LR-041', name: 'David Chen', type: 'Paid Leave', dates: 'Aug 12 — Aug 16', days: 4, reason: 'Family vacation', status: 'Pending', overlap: 'No conflicts' },
    { id: 'LR-040', name: 'Sarah Jenkins', type: 'Remote Work', dates: 'Aug 5 — Aug 9', days: 5, reason: 'Personal preference', status: 'Pending', overlap: '1 overlap (Elena)' },
    { id: 'LR-039', name: 'Elena Rodriguez', type: 'Sick Leave', dates: 'Jul 28 — Jul 29', days: 2, reason: 'Medical appointment', status: 'Pending', overlap: 'No conflicts' },
    { id: 'LR-038', name: 'Michael Chang', type: 'Paid Leave', dates: 'Sep 1 — Sep 5', days: 5, reason: 'Travel', status: 'Approved', overlap: null },
    { id: 'LR-037', name: 'Alex Mercer', type: 'Remote Work', dates: 'Jul 22 — Jul 23', days: 2, reason: 'Home repairs', status: 'Approved', overlap: null },
  ];

  const filtered = filter === 'all' ? requests : requests.filter(r =>
    filter === 'pending' ? r.status === 'Pending' : r.status === 'Approved'
  );

  const handleApprove = (name) => {
    toast.success(`Approved request for ${name}`);
  };

  const handleDeny = (name) => {
    toast.error(`Denied request for ${name}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Approval Queue</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Leave & Requests</h1>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black text-slate-800">3</span>
            <span className="text-slate-500 font-medium">Pending</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black text-slate-800">47</span>
            <span className="text-slate-500 font-medium">Team days left</span>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {[
          { key: 'pending', label: 'Pending (3)' },
          { key: 'approved', label: 'Approved' },
          { key: 'all', label: 'All' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              filter === tab.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REQUEST TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="py-3 px-4 font-medium">Employee</th>
              <th className="py-3 px-4 font-medium">Type</th>
              <th className="py-3 px-4 font-medium">Dates</th>
              <th className="py-3 px-4 font-medium">Duration</th>
              <th className="py-3 px-4 font-medium">Overlap</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${req.name}`} alt="" className="w-full h-full" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{req.name}</div>
                      <div className="text-[10px] text-slate-400">{req.id}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    req.type === 'Paid Leave' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    req.type === 'Sick Leave' ? 'bg-red-50 text-red-700 border-red-100' :
                    'bg-purple-50 text-purple-700 border-purple-100'
                  }`}>{req.type}</span>
                </td>
                <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">{req.dates}</td>
                <td className="py-3.5 px-4 text-xs font-bold text-slate-800">{req.days}d</td>
                <td className="py-3.5 px-4 text-xs text-slate-500">
                  {req.overlap ? (
                    <span className={req.overlap.includes('1 overlap') ? 'text-yellow-600 font-medium' : ''}>
                      {req.overlap}
                    </span>
                  ) : '—'}
                </td>
                <td className="py-3.5 px-4 text-right">
                  {req.status === 'Pending' ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleApprove(req.name)}
                        className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold rounded-md transition-colors border border-green-100"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDeny(req.name)}
                        className="px-3 py-1 bg-white hover:bg-red-50 text-red-600 text-xs font-bold rounded-md transition-colors border border-slate-200"
                      >
                        Deny
                      </button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium border border-green-100/50">
                      <CheckCircle size={12} /> Approved
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Approvals;
