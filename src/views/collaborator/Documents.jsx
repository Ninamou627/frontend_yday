import React, { useState, useEffect } from 'react';
import { FileText, Download, Plus, Search, Eye, FileBadge, FileLock, Sparkles, Clock, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { marked } from 'marked';
import toast from 'react-hot-toast';
import { useApi } from '../../services/useApi';
import { useAuth } from '../../context/AuthContext';

const typeIcons = {
  'Payroll': { icon: FileLock, color: 'text-purple-500', bg: 'bg-purple-50' },
  'HR': { icon: FileBadge, color: 'text-blue-500', bg: 'bg-blue-50' },
  'Legal': { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-100' },
  'AI Generated': { icon: Sparkles, color: 'text-primary-500', bg: 'bg-primary-50' },
};

const Documents = () => {
  const { user } = useAuth();
  const { get, post, loading } = useApi();
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [docs, setDocs] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch documents from real backend
  const fetchDocs = async () => {
    try {
      let url = '/api/collaborator/documents/';
      const params = new URLSearchParams();
      if (filter !== 'All') params.append('doc_type', filter);
      if (searchQuery) params.append('search', searchQuery);
      
      const data = await get(`${url}?${params.toString()}`);
      setDocs(data);
    } catch (err) {
      // Error handled by useApi toast
    } finally {
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [filter, searchQuery]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    toast('AI is generating your document...', { icon: '🤖' });
    try {
      const newDoc = await post('/api/collaborator/documents/generate', {
        document_name: `Work Certificate — ${user?.full_name || 'Employee'}`,
        doc_type: 'AI Generated'
      });
      setDocs(prev => [newDoc, ...prev]);
      toast.success('Certificate generated and added! 🎉');
    } catch (err) {
      // Error handled by useApi toast
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate a beautiful PDF dynamically
  const handleDownload = async (e, doc) => {
    e.stopPropagation();
    if (doc.hr_validated === 'pending') {
      toast.error('This document is pending HR validation and cannot be downloaded yet.');
      return;
    }
    
    toast.success(`Generating PDF for ${doc.name}...`);
    
    // Fallback content if file_path is empty
    let markdownContent = doc.file_path || `
# ${doc.name}
**Type:** ${doc.doc_type}
**Date:** ${new Date(doc.created_at || Date.now()).toLocaleDateString()}
**Status:** Validated

*This document was generated automatically.*
    `;

    // Convert Markdown to HTML
    const htmlContent = marked.parse(markdownContent);

    // Create a temporary container for rendering
    const container = document.createElement('div');
    container.innerHTML = `
      <div style="padding: 40px; font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6;">
        <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="margin: 0; font-size: 24px; color: #0f172a; font-weight: 900; letter-spacing: -0.5px;">WASL</h1>
            <p style="margin: 5px 0 0; font-size: 12px; color: #64748b; font-weight: 500; text-transform: uppercase;">Official Document</p>
          </div>
          <div style="text-align: right; font-size: 10px; color: #94a3b8;">
            Ref: DOC-${doc.id}-${new Date().getFullYear()}<br/>
            Date: ${new Date().toLocaleDateString()}
          </div>
        </div>
        <div class="pdf-body" style="font-size: 12px;">
          ${htmlContent}
        </div>
        <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center;">
          This document is electronically generated and validated by the HR department.<br/>
          WASL Platform © ${new Date().getFullYear()}
        </div>
      </div>
    `;
    
    // Add some inline styles for markdown elements
    const style = document.createElement('style');
    style.innerHTML = `
      .pdf-body h1 { font-size: 18px; color: #0f172a; margin-top: 20px; margin-bottom: 10px; }
      .pdf-body h2 { font-size: 16px; color: #1e293b; margin-top: 15px; margin-bottom: 8px; }
      .pdf-body h3 { font-size: 14px; color: #334155; margin-top: 10px; margin-bottom: 5px; }
      .pdf-body p { margin-bottom: 10px; }
      .pdf-body strong { color: #0f172a; }
      .pdf-body ul, .pdf-body ol { margin-left: 20px; margin-bottom: 10px; }
      .pdf-body table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      .pdf-body th, .pdf-body td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
      .pdf-body th { background-color: #f8fafc; font-weight: 600; color: #334155; }
    `;
    container.appendChild(style);

    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename: `${doc.name.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(container).save().then(() => {
      toast.success('PDF Download complete! 🎉');
    }).catch(err => {
      toast.error('Failed to generate PDF');
      console.error(err);
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Personal Vault</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Documents 📂</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-60"
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
          </button>
          <button onClick={() => toast.success('Manual request form opened')} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2">
            <Plus size={16} />
            <span>Request</span>
          </button>
        </div>
      </div>

      {/* AI Banner if AI docs exist */}
      {docs.some(d => d.source === 'AI Agent') && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 flex items-center gap-3 text-sm">
          <Sparkles size={16} className="text-primary-500 flex-shrink-0" />
          <p className="text-primary-700 font-medium text-xs">
            AI-generated documents are available immediately for download. They are also submitted to HR for validation.
          </p>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
          {['All', 'Payroll', 'HR', 'Legal', 'AI Generated'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                filter === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'AI Generated' && <Sparkles size={10} />}
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* DOCUMENT TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto relative min-h-[200px]">
        {initialLoad ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <Loader2 className="animate-spin text-primary-500" size={32} />
          </div>
        ) : docs.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 py-12">
            <FileText size={48} className="mb-4 opacity-50" />
            <p className="text-sm font-medium">No documents found.</p>
          </div>
        ) : null}
        
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="py-3 px-4 font-medium">Document Name</th>
              <th className="py-3 px-4 font-medium">Category</th>
              <th className="py-3 px-4 font-medium">Source</th>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {docs.map((doc) => {
              const typeStyle = typeIcons[doc.doc_type] || { icon: FileText, color: 'text-slate-500', bg: 'bg-slate-100' };
              const Icon = typeStyle.icon;
              const formattedDate = new Date(doc.created_at).toLocaleDateString();

              return (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={(e) => handleDownload(e, doc)}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeStyle.bg} ${typeStyle.color}`}>
                        <Icon size={14} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">DOC-{doc.id} • {doc.file_size_mb} MB</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-bold text-slate-600">{doc.doc_type}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      doc.source === 'AI Agent' ? 'bg-primary-50 text-primary-700 border-primary-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {doc.source === 'AI Agent' && '✨ '}{doc.source}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-medium text-slate-500">{formattedDate}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      doc.hr_validated === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                      doc.hr_validated === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                      doc.status === 'available' ? 'bg-green-50 text-green-700 border-green-100' :
                      doc.status === 'generating' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                      'bg-orange-50 text-orange-700 border-orange-100'
                    }`}>
                      {doc.hr_validated === 'pending' && <Clock size={9} />}
                      {doc.hr_validated === 'rejected' && <XCircle size={9} />}
                      {doc.hr_validated === 'validated' && doc.status === 'available' && <CheckCircle2 size={9} />}
                      {doc.hr_validated === 'pending' ? 'Pending HR Validation' : 
                       doc.hr_validated === 'rejected' ? 'Rejected by HR' : 
                       doc.status.charAt(0).toUpperCase() + doc.status.slice(1).replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className={`flex items-center justify-end gap-2 transition-opacity ${doc.hr_validated === 'pending' ? 'opacity-50 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'}`}>
                      <button onClick={(e) => handleDownload(e, doc)} disabled={doc.hr_validated === 'pending'} className={`p-2 rounded-md transition-colors ${doc.hr_validated === 'pending' ? 'text-slate-300' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`} title="Preview">
                        <Eye size={16} />
                      </button>
                      <button onClick={(e) => handleDownload(e, doc)} disabled={doc.hr_validated === 'pending'} className={`p-2 rounded-md transition-colors ${doc.hr_validated === 'pending' ? 'text-slate-300' : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50'}`} title="Download">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Documents;
