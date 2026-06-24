import React, { useState, useEffect } from 'react';
import { Server, Activity, Database, Shield, RefreshCw, AlertTriangle, ArrowRight, Terminal, Loader2, ShieldAlert, Users, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../services/useApi';

const Dashboard = () => {
  const { get } = useApi();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await get('/api/admin/dashboard/overview');
      setOverview(res);
    } catch (err) {
      console.error('Failed to load dashboard overview:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  const statusConfig = {
    Operational: { color: 'text-green-500 bg-green-50 border-green-100', dot: 'bg-green-500', label: 'All systems healthy' },
    Degraded: { color: 'text-yellow-500 bg-yellow-50 border-yellow-100', dot: 'bg-yellow-500', label: 'Investigating issues' },
    Critical: { color: 'text-red-500 bg-red-50 border-red-100', dot: 'bg-red-500', label: 'Incident in progress' },
  };

  const status = statusConfig[overview?.global_status] || statusConfig.Operational;

  const ragStatusConfig = {
    indexed: { color: 'text-green-600 bg-green-50 border-green-100', label: 'Indexed' },
    processing: { color: 'text-yellow-600 bg-yellow-50 border-yellow-100 animate-pulse', label: 'Syncing' },
    queued: { color: 'text-slate-600 bg-slate-50 border-slate-200', label: 'Queued' },
    failed: { color: 'text-red-600 bg-red-50 border-red-100', label: 'Failed' },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">System Supervision</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">AI & Infrastructure</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { fetchOverview(); toast.success('Dashboard refreshed'); }} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button onClick={() => toast.success('Triggering forced RAG synchronization...')} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2">
            <Database size={14} />
            <span>Force Sync RAG</span>
          </button>
        </div>
      </div>

      {/* METRICS ROW - Telemetry style */}
      <div className="flex flex-wrap items-center gap-10 text-sm">
        <div className="flex items-baseline gap-2">
          <span className={`flex items-center gap-2 px-2 py-1 rounded border font-bold text-xs ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${status.dot}`}></span>
            {overview?.global_status || 'Operational'}
          </span>
          <div className="ml-2">
            <span className="text-slate-500 font-medium block text-xs">Global Status</span>
            <span className="text-[10px] font-medium text-slate-400">{status.label}</span>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800 tracking-tight">{overview?.total_rag_chunks?.toLocaleString() || 0}</span>
          <div>
            <span className="text-slate-500 font-medium block text-xs">RAG Vectors</span>
            <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5">{overview?.total_rag_documents || 0} documents</span>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800 tracking-tight">{overview?.blocked_prompts_24h || 0}</span>
          <div>
            <span className="text-slate-500 font-medium block text-xs">Blocked Prompts</span>
            <span className="text-[10px] font-medium text-red-500">Last 24h</span>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800 tracking-tight">{overview?.total_users || 0}</span>
          <div>
            <span className="text-slate-500 font-medium block text-xs">Users</span>
            <span className="text-[10px] font-bold text-green-600">{overview?.active_users || 0} active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* RAG INDEX STATUS */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">RAG Knowledge Base Status</h2>
              <span className="text-xs text-slate-500 font-medium">Vector DB: pgvector</span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 font-medium">Corpus Name</th>
                    <th className="py-3 px-4 font-medium">Vectors</th>
                    <th className="py-3 px-4 font-medium">Size</th>
                    <th className="py-3 px-4 font-medium">Last Sync</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overview?.rag_corpus?.length > 0 ? overview.rag_corpus.map((doc) => {
                    const cfg = ragStatusConfig[doc.status] || ragStatusConfig.queued;
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800 text-xs flex items-center gap-2">
                          <Database size={12} className="text-slate-400" /> {doc.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[10px]">{doc.chunks.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">{doc.file_size_mb ? `${doc.file_size_mb} MB` : '—'}</td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">{doc.last_sync}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">No RAG documents found in the knowledge base</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* SYSTEM WARNINGS */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={14} className="text-yellow-500" /> System Warnings
              </h2>
              {overview?.total_security_alerts > 0 && (
                <span className="text-xs text-red-500 font-bold">{overview.total_security_alerts} unresolved</span>
              )}
            </div>
            {overview?.warnings?.length > 0 ? (
              <div className="space-y-3">
                {overview.warnings.map((warning) => (
                  <div key={warning.id} className={`bg-white rounded-xl border shadow-sm p-4 border-l-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    warning.severity === 'critical' ? 'border-red-200 border-l-red-500' : 'border-yellow-200 border-l-yellow-500'
                  }`}>
                    <div className="flex items-start gap-3">
                      <ShieldAlert size={18} className={`mt-0.5 flex-shrink-0 ${warning.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'}`} />
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{warning.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 font-mono max-w-md truncate">{warning.description}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-[9px] font-bold rounded uppercase tracking-wider ${
                      warning.severity === 'critical' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                    }`}>
                      {warning.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-green-200 shadow-sm p-4 border-l-4 border-l-green-500 flex items-center gap-3">
                <Shield size={18} className="text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">All Clear</h3>
                  <p className="text-xs text-slate-500 mt-0.5">No active warnings or critical security incidents.</p>
                </div>
              </div>
            )}
          </section>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">

          {/* RECENT ACTIVITY - DARK CARD */}
          <div className="bg-[#0f121d] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500 rounded-full blur-3xl opacity-20"></div>
             <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></span> Recent Activity
             </h3>
             <div className="space-y-4">
              {overview?.recent_activity?.length > 0 ? overview.recent_activity.map((activity, i) => (
                <div key={i} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
                  <div className="text-xs font-bold text-white mb-1">{activity.user_name}</div>
                  <div className="flex justify-between text-[10px] text-white/50 font-mono">
                    <span>{activity.module} — {activity.action}</span>
                    <span className="text-primary-400">{activity.timestamp}</span>
                  </div>
                </div>
              )) : (
                <div className="text-xs text-white/40 text-center py-4">No recent activity</div>
              )}
             </div>
          </div>

          {/* SYSTEM STATS CARD */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">System Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Users size={14} className="text-slate-400" /> Total Users
                </div>
                <span className="text-sm font-bold text-slate-800">{overview?.total_users || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <FileText size={14} className="text-slate-400" /> RAG Documents
                </div>
                <span className="text-sm font-bold text-slate-800">{overview?.total_rag_documents || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Database size={14} className="text-slate-400" /> Total Vectors
                </div>
                <span className="text-sm font-bold text-slate-800">{overview?.total_rag_chunks?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Shield size={14} className="text-slate-400" /> Security Alerts
                </div>
                <span className={`text-sm font-bold ${overview?.total_security_alerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {overview?.total_security_alerts || 0}
                </span>
              </div>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Admin Shortcuts</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors flex items-center justify-between group">
                Database Backups <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors flex items-center justify-between group">
                Clear API Caches <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors flex items-center justify-between group">
                Model Parameters <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
