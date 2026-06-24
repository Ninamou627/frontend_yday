import React, { useState } from 'react';
import { FileText, Send, Sparkles, Building, Target, Clock, ArrowRight, CheckCircle, Eye, ThumbsUp, ThumbsDown, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

// Backend handles data now

const RecDetailModal = ({ rec, onClose, onDecision }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto animate-in zoom-in duration-200">
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border mb-2 inline-block ${
            rec.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' :
            rec.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
            'bg-slate-100 text-slate-600 border-slate-200'
          }`}>{rec.priority} Priority</span>
          <h2 className="text-lg font-bold text-slate-800">{rec.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Submitted by {rec.submitter_name} · {new Date(rec.created_at).toLocaleDateString()}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex-shrink-0 ml-4"><X size={20} /></button>
      </div>
      <div className="p-6 space-y-5">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-[10px] font-bold text-red-700 uppercase tracking-wide mb-1 flex items-center gap-1"><AlertTriangle size={10} /> Problem / Rationale</p>
          <p className="text-sm text-slate-700 leading-relaxed">{rec.rationale}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-1 flex items-center gap-1"><Target size={10} /> Recommended Action</p>
          <p className="text-sm text-slate-700 leading-relaxed">{rec.action}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide mb-1 flex items-center gap-1"><CheckCircle size={10} /> Expected Impact</p>
          <p className="text-sm text-slate-700 leading-relaxed">{rec.impact}</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span className="font-bold">Evidence sources:</span>
          {rec.evidence_sources ? rec.evidence_sources.split(',').map(ev => (
            <span key={ev.trim()} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-mono font-bold">{ev.trim()}</span>
          )) : <span className="italic">None</span>}
        </div>
      </div>
      {rec.status === 'pending_hr' && (
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={() => { onDecision(rec.id, 'reject'); onClose(); }} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center gap-2">
            <ThumbsDown size={14} /> Decline
          </button>
          <button onClick={() => { onDecision(rec.id, 'approve'); onClose(); }} className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
            <ThumbsUp size={14} /> Approve & Forward
          </button>
        </div>
      )}
    </div>
  </div>
);

import { useApi } from '../../services/useApi';

const Recommendations = () => {
  const { get, post, patch } = useApi();
  const [tab, setTab] = useState('inbox');
  const [target, setTarget] = useState('Engineering');
  const [viewRec, setViewRec] = useState(null);
  const [recs, setRecs] = useState([]);
  
  // Draft Form
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [rationale, setRationale] = useState('');
  const [action, setAction] = useState('');
  const [impact, setImpact] = useState('');

  const fetchRecs = async () => {
    try {
      const data = await get('/api/qvt/recommendations/');
      setRecs(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchRecs();
  }, [get]);

  const handleDecision = async (id, newStatus) => {
    try {
      await patch(`/api/hr/recommendations/${id}`, { action: newStatus, note: '' });
      toast.success(newStatus === 'approve' ? 'Recommendation approved & forwarded to management!' : 'Recommendation declined.');
      fetchRecs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDraftSubmit = async () => {
    if (!title || !rationale || !action) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await post('/api/qvt/recommendations/', {
        title,
        department: target,
        priority,
        rationale,
        action,
        expected_impact: impact || 'To be determined',
        evidence_sources: ''
      });
      toast.success('Recommendation submitted to HR inbox!');
      setTitle(''); setRationale(''); setAction(''); setImpact('');
      setTab('history');
      fetchRecs();
    } catch (e) {
      console.error(e);
    }
  };

  const inbox = recs.filter(r => r.status === 'pending_hr');
  const history = recs.filter(r => r.status !== 'pending_hr');

  return (
    <>
      {viewRec && <RecDetailModal rec={viewRec} onClose={() => setViewRec(null)} onDecision={handleDecision} />}

      <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Interventions & QVT</p>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Wellness Recommendations 💊</h1>
          </div>
          <div className="flex items-center gap-3">
            {inbox.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-lg">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                {inbox.length} Pending HR Review
              </span>
            )}
            <button onClick={() => setTab('draft')} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2">
              <Send size={16} />
              <span>New Recommendation</span>
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
          {[
            { id: 'inbox', label: `📥 HR Inbox (${inbox.length})` },
            { id: 'history', label: '📋 History' },
            { id: 'draft', label: '✏️ New Draft' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${tab === t.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* HR INBOX TAB */}
        {tab === 'inbox' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Recommendations sent by the QVT team that require HR validation before being forwarded to management.</p>
            {inbox.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-12 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-bold text-slate-800">All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">No recommendations pending review.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {inbox.map(rec => (
                    <div key={rec.id} className="p-5 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-1.5 self-stretch rounded-full flex-shrink-0 ${rec.priority === 'High' ? 'bg-red-500' : rec.priority === 'Medium' ? 'bg-yellow-500' : 'bg-slate-300'}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{rec.title}</h3>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${rec.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>{rec.priority}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-2 line-clamp-2 leading-relaxed">{rec.rationale}</p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1"><Building size={10} /> {rec.department}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1"><Clock size={10} /> {new Date(rec.created_at).toLocaleDateString()}</span>
                              <span>·</span>
                              <span>From: {rec.submitter_name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => setViewRec(rec)} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5">
                            <Eye size={12} /> Review
                          </button>
                          <button onClick={() => handleDecision(rec.id, 'approve')} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5">
                            <ThumbsUp size={12} /> Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && (
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {history.map(rec => (
                <div key={rec.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setViewRec(rec)}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-bold text-sm text-slate-800 group-hover:text-primary-600 transition-colors pr-2">{rec.title}</div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap capitalize ${
                      rec.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                      rec.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                      rec.status === 'implemented' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>{rec.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><Building size={10} /> {rec.department}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(rec.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DRAFT TAB */}
        {tab === 'draft' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Draft New Recommendation</h2>
                <button onClick={() => toast('AI is analyzing recent surveys...')} className="text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors">
                  <Sparkles size={14} /> Auto-draft with AI
                </button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Program Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Q3 Stress Prevention Workshop" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Target Department</label>
                    <select value={target} onChange={e => setTarget(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
                      <option>Engineering</option>
                      <option>Sales</option>
                      <option>Marketing</option>
                      <option>Product</option>
                      <option>HR & Admin</option>
                      <option>Company-wide</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Rationale & Evidence</label>
                  <textarea value={rationale} onChange={e => setRationale(e.target.value)} rows={4} placeholder="Link this to specific survey results or AI pulse data..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white resize-none transition-all"></textarea>
                  <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1"><CheckCircle size={10} className="text-green-500" /> Employee identities are completely anonymized.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Recommended Action</label>
                  <textarea value={action} onChange={e => setAction(e.target.value)} rows={3} placeholder="Describe the specific intervention steps..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white resize-none transition-all"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Expected Impact</label>
                  <textarea value={impact} onChange={e => setImpact(e.target.value)} rows={2} placeholder="e.g. 15% reduction in burnout..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white resize-none transition-all"></textarea>
                </div>
                <button onClick={handleDraftSubmit} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                  <Send size={16} /> Submit to HR →
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default Recommendations;
