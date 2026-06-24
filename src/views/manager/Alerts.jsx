import React from 'react';
import { AlertTriangle, Info, ArrowRight, Shield, TrendingDown, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const SEVERITY = {
  High: { border: 'border-l-red-500', label: 'bg-red-50 text-red-700 border-red-100', icon: 'text-red-500' },
  Medium: { border: 'border-l-yellow-500', label: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: 'text-yellow-500' },
  Low: { border: 'border-l-blue-500', label: 'bg-blue-50 text-blue-700 border-blue-100', icon: 'text-blue-500' },
};

import { useApi } from '../../services/useApi';

const Alerts = () => {
  const { get, patch } = useApi();
  const [alerts, setAlerts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fetchAlerts = async () => {
    try {
      const data = await get('/api/manager/alerts/');
      setAlerts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAlerts();
  }, [get]);

  const handleResolve = async (id) => {
    try {
      await patch(`/api/manager/alerts/${id}`);
      toast.success('Alert resolved');
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  // Compute counts
  const unacknowledged = alerts.filter(a => !a.is_resolved);
  const highCount = unacknowledged.filter(a => a.severity.toLowerCase() === 'high').length;
  const medCount = unacknowledged.filter(a => a.severity.toLowerCase() === 'medium').length;
  const lowCount = unacknowledged.filter(a => a.severity.toLowerCase() === 'low').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">AI-Powered Detection</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Predictive Alerts</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-slate-600 font-medium">{highCount} High</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <span className="text-slate-600 font-medium">{medCount} Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-slate-600 font-medium">{lowCount} Low</span>
          </div>
        </div>
      </div>

      {/* ALERT LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-12 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-bold text-slate-800">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1">No AI alerts requiring your attention.</p>
          </div>
        ) : alerts.map((alert) => {
          const sevKey = alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1);
          const sev = SEVERITY[sevKey] || SEVERITY.Low;
          return (
            <div key={alert.id} className={`bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden border-l-4 ${sev.border} ${alert.is_resolved ? 'opacity-60' : ''}`}>
              <div className="p-5">
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className={`${sev.icon} mt-0.5 flex-shrink-0`} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-800 capitalize">{alert.alert_type.replace('_', ' ')} — {alert.employee_name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize ${sev.label}`}>{alert.severity}</span>
                        {alert.is_resolved && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-100 text-slate-600">Resolved</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-2xl">{alert.description}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium flex-shrink-0 whitespace-nowrap">{new Date(alert.created_at).toLocaleDateString()}</span>
                </div>

                {/* Explainability + Actions row */}
                <div className="flex items-end justify-between gap-4 ml-8 flex-col sm:flex-row mt-4">
                  <div className="flex items-start gap-1.5 max-w-md">
                    <Shield size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      <span className="font-semibold text-slate-500">Explainability:</span> Based on real-time HR and QVT telemetry. Employee data remains secure.
                    </p>
                  </div>
                  {!alert.is_resolved && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-md transition-colors bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        Acknowledge & Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Alerts;
