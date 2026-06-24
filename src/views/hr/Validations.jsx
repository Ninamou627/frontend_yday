import React, { useState, useEffect } from 'react';
import { FileCheck, Search, Filter, Eye, CheckCircle, XCircle, ArrowUpRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../services/useApi';

const Validations = () => {
  const [filter, setFilter] = useState('pending');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get, patch } = useApi();

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await get(`/api/hr/validations/?status_filter=all`);
      setDocs(data);
    } catch (error) {
      toast.error('Failed to load validation queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const filteredDocs = filter === 'all' ? docs : docs.filter(d => 
    filter === 'pending' ? d.hr_validated === 'pending' : d.hr_validated !== 'pending'
  );

  const pendingCount = docs.filter(d => d.hr_validated === 'pending').length;
  const aiGeneratedCount = docs.filter(d => d.source === 'AI Agent').length;
  const aiPercentage = docs.length > 0 ? Math.round((aiGeneratedCount / docs.length) * 100) : 0;

  const handleAction = async (action, docId, employee) => {
    try {
      const loadingToast = toast.loading(`${action === 'validate' ? 'Approving' : 'Rejecting'} document...`);
      await patch(`/api/hr/validations/${docId}`, { action });
      toast.success(`Document ${action === 'validate' ? 'approved' : 'rejected'} for ${employee}`, { id: loadingToast });
      fetchDocs();
    } catch (error) {
      toast.error(`Failed to process document`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Document Control</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Validation Queue</h1>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
            <span className="text-2xl font-black text-slate-800">{pendingCount}</span>
            <span className="text-slate-500 font-medium">Pending Review</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-800">{aiPercentage}%</span>
            <span className="text-slate-500 font-medium">AI Generated</span>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
          {[
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'processed', label: 'Processed' },
            { id: 'all', label: 'All Documents' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500 font-medium">
            No documents found for this filter.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-medium">Employee</th>
                <th className="py-3 px-4 font-medium">Document Name</th>
                <th className="py-3 px-4 font-medium">Source</th>
                <th className="py-3 px-4 font-medium">Date Submitted</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${doc.owner_name}`} alt="" className="w-full h-full" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{doc.owner_name}</div>
                        <div className="text-[10px] text-slate-400">User #{doc.owner_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <FileCheck size={14} className="text-slate-400" />
                      <span className="font-medium text-slate-700">{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      doc.source === 'AI Agent' ? 'bg-primary-50 text-primary-700 border-primary-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {doc.source}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border ${
                      doc.hr_validated === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                      doc.hr_validated === 'validated' ? 'bg-green-50 text-green-700 border-green-100' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {doc.hr_validated}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {doc.hr_validated === 'pending' ? (
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleAction('reject', doc.id, doc.owner_name)} className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-md transition-colors border border-red-200">
                          Reject
                        </button>
                        <button onClick={() => handleAction('validate', doc.id, doc.owner_name)} className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-md transition-colors">
                          Approve
                        </button>
                      </div>
                    ) : (
                      <button className="text-xs font-medium text-slate-400 hover:text-slate-600 flex items-center gap-1 justify-end w-full">
                        View record <ArrowUpRight size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Validations;
