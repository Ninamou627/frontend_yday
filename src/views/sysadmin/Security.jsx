import React, { useState, useEffect } from 'react';
import { ShieldAlert, Download, Filter, Search, Terminal, AlertOctagon, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../services/useApi';

const Security = () => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get, patch } = useApi();

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const [auditRes, alertsRes] = await Promise.all([
        get('/api/admin/security/audit?limit=100'),
        get('/api/admin/security/alerts?include_resolved=true')
      ]);

      const formattedLogs = [
        ...alertsRes.map(a => ({
          _id: a.id,
          id: `ALRT-${String(a.id).padStart(4, '0')}`,
          level: a.severity.charAt(0).toUpperCase() + a.severity.slice(1),
          type: a.alert_type,
          target: a.description,
          source: a.user_id ? `USR-${a.user_id}` : 'Unknown',
          ip: a.ip_address || 'Unknown',
          time: new Date(a.created_at).toLocaleString(),
          status: a.is_resolved ? 'Resolved' : 'Active',
          isAlert: true,
          raw_date: new Date(a.created_at).getTime()
        })),
        ...auditRes.map(a => ({
          _id: a.id,
          id: `AUD-${String(a.id).padStart(4, '0')}`,
          level: a.severity.charAt(0).toUpperCase() + a.severity.slice(1),
          type: a.action,
          target: a.resource_type || 'System',
          source: a.user_email || `USR-${a.user_id}` || 'SYS',
          ip: a.ip_address || 'System',
          time: new Date(a.created_at).toLocaleString(),
          status: 'Logged',
          isAlert: false,
          raw_date: new Date(a.created_at).getTime()
        }))
      ].sort((a, b) => b.raw_date - a.raw_date);

      setLogs(formattedLogs);
    } catch (err) {
      toast.error('Failed to fetch security telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const resolveAlert = async (id) => {
    try {
      await patch(`/api/admin/security/alerts/${id}`, { resolve: true });
      toast.success('Alert marked as resolved');
      fetchSecurityData();
    } catch (err) {
      toast.error('Failed to resolve alert');
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchFilter = filter === 'All' || l.level === filter;
    const matchSearch = l.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        l.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        l.source.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const activeAlertsCount = logs.filter(l => l.isAlert && l.status === 'Active').length;
  const promptInjectionsCount = logs.filter(l => {
    const t = l.type.toLowerCase();
    return t.includes('prompt_injection') || t.includes('prompt injection') || t.includes('role_manipulation') || t.includes('data_exfiltration');
  }).length;
  const dataLeakCount = logs.filter(l => l.type.toLowerCase().includes('bulk_export') || l.type.toLowerCase().includes('bulk export') || l.type.toLowerCase().includes('leak') || l.type.toLowerCase().includes('data_exfiltration')).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Information Security</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Incident Feed & Logs</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.success('Exporting security logs as CSV...')} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm">
            <Download size={16} />
            <span>Export Logs</span>
          </button>
          <button onClick={() => toast.success('Lockdown mode activated! (Simulation)')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>Trigger Lockdown</span>
          </button>
        </div>
      </div>

      {/* INLINE METRICS */}
      <div className="flex flex-wrap items-center gap-10 text-sm">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-red-600 tracking-tight">{activeAlertsCount}</span>
          <div>
            <span className="text-slate-500 font-medium block text-xs">Active Alerts</span>
            <span className="text-[10px] font-bold text-slate-400">Require attention</span>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-purple-600 tracking-tight">{promptInjectionsCount}</span>
          <div>
            <span className="text-slate-500 font-medium block text-xs">Prompt Injections</span>
            <span className="text-[10px] font-bold text-slate-400">All Time</span>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-green-600 tracking-tight">{dataLeakCount}</span>
          <div>
            <span className="text-slate-500 font-medium block text-xs">Data Leak Events</span>
            <span className="text-[10px] font-bold text-slate-400">All Time</span>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
          {['All', 'Critical', 'Warning', 'Info'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filter === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'Critical' && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
              {tab === 'Warning' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>}
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-80 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Filter by IP, User ID, or Event..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* TERMINAL-STYLE LOG TABLE */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
          <Terminal size={14} className="text-slate-500" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Live Security Telemetry</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-900 text-slate-500 border-b border-slate-800 text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Event Type / Target</th>
                <th className="py-3 px-4">Source / IP</th>
                <th className="py-3 px-4">Action Taken</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className={`hover:bg-slate-800/50 transition-colors group ${log.status === 'Active' ? 'bg-red-950/20' : ''}`}>
                  <td className="py-3 px-4 text-slate-400">{log.time}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      log.level === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      log.level === 'Warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {log.level === 'Critical' && <AlertOctagon size={10} />}
                      {log.level === 'Warning' && <AlertTriangle size={10} />}
                      {log.level === 'Info' && <CheckCircle2 size={10} />}
                      {log.level}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-200 font-bold">{log.type}</div>
                    <div className="text-[10px] text-slate-500 max-w-[200px] truncate" title={log.target}>{log.target}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-300">{log.source}</div>
                    <div className="text-[10px] text-slate-500">{log.ip}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] ${
                      log.status === 'Active' ? 'text-red-400' :
                      log.status === 'Resolved' || log.status === 'Success' ? 'text-green-400' : 'text-slate-400'
                    }`}>
                      [{log.status}]
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    {log.isAlert && log.status === 'Active' ? (
                      <button onClick={() => resolveAlert(log._id)} className="px-2 py-1 text-[10px] bg-red-900 hover:bg-red-800 text-red-100 rounded border border-red-800 transition-colors">
                        Resolve
                      </button>
                    ) : (
                      <button className="px-2 py-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
                        Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Security;
