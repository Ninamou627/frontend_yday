import React, { useState, useEffect, useRef } from 'react';
import { Database, Upload, Search, Filter, MoreHorizontal, FileText, CheckCircle2, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../services/useApi';

const RAG = () => {
  const [docs, setDocs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [accessScope, setAccessScope] = useState('all');
  const fileInputRef = useRef(null);
  const api = useApi();

  const fetchDocs = async () => {
    try {
      const data = await api.get('/api/admin/rag/documents');
      setDocs(data || []);
    } catch (err) {
      toast.error('Failed to load knowledge base');
    }
  };

  useEffect(() => {
    fetchDocs();
    // Auto refresh while syncing
    const interval = setInterval(() => {
      setDocs(prev => {
        if (prev.some(d => d.status === 'queued' || d.status === 'processing')) {
          fetchDocs();
        }
        return prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'general');
    formData.append('access_scope', accessScope);

    try {
      await api.post('/api/admin/rag/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded. Indexing started.');
      fetchDocs();
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document from the knowledge base?')) return;
    try {
      await api.delete(`/api/admin/rag/documents/${id}`);
      toast.success('Document removed');
      fetchDocs();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Vector Database Management</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">RAG Knowledge Base</h1>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 text-sm mr-4 hidden md:flex">
            <Database size={16} className="text-primary-500" />
            <span className="font-bold text-slate-700">pgvector</span>
            <span className="text-slate-400 font-medium ml-1">
              {(docs || []).reduce((acc, doc) => acc + (doc.chunks_count || 0), 0)} total chunks
            </span>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2">
            <Upload size={16} />
            <span>Import Knowledge</span>
          </button>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.txt,.docx,.md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN LIST */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-medium">Corpus Name</th>
                  <th className="py-3 px-4 font-medium">Vector Size</th>
                  <th className="py-3 px-4 font-medium">Access Scope</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!docs || docs.length === 0) ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">No documents in knowledge base. Upload one to start.</td>
                  </tr>
                ) : docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                          <FileText size={14} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors">{doc.original_name}</div>
                          <div className="text-[10px] text-slate-400">ID: {doc.id} • {new Date(doc.uploaded_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-medium text-slate-600">{doc.chunks_count || 0} chunks</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-50 text-slate-600 border-slate-200 uppercase">
                        {doc.access_scope}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
                        doc.status === 'indexed' ? 'bg-green-50 text-green-700 border-green-100' :
                        (doc.status === 'queued' || doc.status === 'processing') ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                        doc.status === 'failed' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {doc.status === 'indexed' && <CheckCircle2 size={10} />}
                        {(doc.status === 'queued' || doc.status === 'processing') && <RefreshCw size={10} className="animate-spin" />}
                        {doc.status === 'failed' && <AlertCircle size={10} />}
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDEBAR - UPLOAD TOOL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 relative overflow-hidden">
            {isUploading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <RefreshCw size={24} className="text-primary-500 animate-spin mb-3" />
                <p className="text-sm font-bold text-slate-800">Processing Document...</p>
              </div>
            )}
            
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Upload size={16} className="text-primary-500" /> Quick Ingest
            </h3>
            
            {/* Compact Drag & Drop */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/50 transition-all cursor-pointer group mb-5"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-white flex items-center justify-center mx-auto mb-3 shadow-sm transition-colors">
                <FileText size={20} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
              </div>
              <p className="text-sm font-bold text-slate-700 mb-1">Click or drag file here</p>
              <p className="text-[10px] text-slate-400">PDF, DOCX, TXT up to 10MB</p>
            </div>

            {/* Quick Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Access Scope</label>
                <select 
                  value={accessScope}
                  onChange={(e) => setAccessScope(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                >
                  <option value="all">All Roles (Public Internal)</option>
                  <option value="hr">HR Only</option>
                  <option value="management">Management & HR</option>
                  <option value="sysadmin">SysAdmin Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RAG;
