import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, CheckCircle, Activity, Github, Box } from 'lucide-react';
import api from '../../services/api';

const DevSecOps = () => {
  const [metrics, setMetrics] = useState({
    summary: { critical: 0, high: 0, medium: 0, low: 0 },
    history: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/devsecops/metrics');
      setMetrics(response.data.data);
    } catch (error) {
      console.error("Error fetching devsecops metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source) => {
    switch(source) {
      case 'sast': return <Activity className="w-5 h-5 text-blue-400" />;
      case 'sca': return <Box className="w-5 h-5 text-purple-400" />;
      case 'secrets': return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'container': return <Box className="w-5 h-5 text-indigo-400" />;
      default: return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DevSecOps Dashboard</h1>
          <p className="text-gray-500">Supervision centralisée de la sécurité du pipeline CI/CD (SAST, SCA, Trivy, Gitleaks).</p>
        </div>
        <button onClick={fetchMetrics} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Rafraîchir
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Critiques</h3>
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-600">{metrics.summary.critical}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Élevés</h3>
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-orange-600">{metrics.summary.high}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Moyens</h3>
                <Shield className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-yellow-600">{metrics.summary.medium}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Faibles</h3>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">{metrics.summary.low}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Historique des Scans</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Répertoire</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vulnérabilités</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.history.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        Aucun scan enregistré. Déclenchez le pipeline GitHub Actions.
                      </td>
                    </tr>
                  ) : (
                    metrics.history.map((scan, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getSourceIcon(scan.source)}
                            <span className="ml-2 text-sm font-medium text-gray-900 capitalize">{scan.source}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <Github className="w-4 h-4 mr-2" />
                            {scan.repo}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(scan.date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {scan.metrics.critical > 0 && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">{scan.metrics.critical} Crit</span>}
                            {scan.metrics.high > 0 && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">{scan.metrics.high} High</span>}
                            {scan.metrics.medium > 0 && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">{scan.metrics.medium} Med</span>}
                            {scan.metrics.critical === 0 && scan.metrics.high === 0 && scan.metrics.medium === 0 && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Clean</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DevSecOps;
