import React, { useState, useEffect } from 'react';
import { Search, Upload, Mail, Phone, ArrowUpRight, Plus, X, Edit3, Archive, UserPlus, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../services/useApi';

// Modal: Create or Edit collaborator
const CollaboratorModal = ({ mode = 'create', initial = null, onClose, onSave }) => {
  const [form, setForm] = useState(initial || {
    name: '', jobTitle: '', systemRole: 'collaborator', dept: 'Engineering', email: '', phone: '',
    contract: 'CDI', manager: '', maxLeave: 25, salary: '',
    status: 'active', photo: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    onSave(form);
    toast.success(mode === 'create' ? `${form.name} added to the system!` : `${form.name} updated!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto animate-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{mode === 'create' ? '➕ Add New Collaborator' : '✏️ Edit Collaborator'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Will be assigned to a manager and system account created</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-50" onClick={() => toast('Photo upload opened')}>
              {form.photo ? <img src={form.photo} className="w-full h-full object-cover" alt="" /> : <span className="text-2xl">📷</span>}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Profile Photo</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Click to upload JPG, PNG (max 2MB)</p>
              <button onClick={() => toast('Photo upload opened')} className="mt-1.5 text-[10px] font-bold text-primary-600 hover:underline">Upload Photo</button>
            </div>
          </div>

          <Field label="Full Name *" value={form.name} onChange={v => set('name', v)} placeholder="e.g. Jean Dupont" />
          <Field label="Email *" value={form.email} onChange={v => set('email', v)} placeholder="jean.d@company.com" type="email" />
          <Field label="Job Title" value={form.jobTitle} onChange={v => set('jobTitle', v)} placeholder="e.g. Software Engineer" />
          <SelectField label="System Role" value={form.systemRole} onChange={v => set('systemRole', v)} options={['collaborator', 'manager', 'hr', 'executive', 'sysadmin']} />
          
          <Field label="Phone" value={form.phone} onChange={v => set('phone', v)} placeholder="+33 6 00 00 00 00" />
          <SelectField label="Department" value={form.dept} onChange={v => set('dept', v)} options={['Engineering', 'Product', 'Marketing', 'Sales', 'Finance', 'HR & Admin']} />
          <SelectField label="Contract Type" value={form.contract} onChange={v => set('contract', v)} options={['CDI', 'CDD', 'Intern', 'Freelance']} />
          <SelectField label="Status" value={form.status} onChange={v => set('status', v)} options={['active', 'onboarding', 'on_leave', 'offboarding', 'archived']} />

          <Field label="Max Leave Days / Year" value={form.maxLeave} onChange={v => set('maxLeave', Number(v))} type="number" placeholder="25" />
          <Field label="Monthly Salary (€)" value={form.salary} onChange={v => set('salary', v)} placeholder="e.g. 3500" type="number" />
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
            {mode === 'create' ? 'Create Collaborator' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder = '', type = 'text' }) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500" />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

// Lifecycle generation modal
const LifecycleModal = ({ employee, onClose }) => {
  const [type, setType] = useState('onboarding');
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const { post } = useApi();

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await post('/api/hr/lifecycle/generate', {
        employee_id: employee.id,
        lifecycle_type: type
      });
      setDone(true);
      toast.success(`AI ${type} plan generated for ${employee.full_name}!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">🤖 AI Lifecycle Generation</h2>
            <p className="text-xs text-slate-500 mt-0.5">For: <span className="font-bold text-primary-600">{employee.full_name}</span> — {employee.department}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex gap-3">
            {['onboarding', 'offboarding'].map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all capitalize ${type === t ? 'border-primary-500 text-primary-700 bg-primary-50' : 'border-slate-200 text-slate-500'}`}>
                {t === 'onboarding' ? '🚀' : '👋'} {t}
              </button>
            ))}
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-bold text-slate-700 mb-2">AI will generate based on:</p>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Department: <span className="font-semibold text-slate-700">{employee.department}</span></li>
              <li>• Role: <span className="font-semibold text-slate-700">{employee.job_title || employee.role}</span></li>
              <li>• Contract: <span className="font-semibold text-slate-700">{employee.contract_type}</span></li>
              <li>• Company policies from RAG knowledge base</li>
            </ul>
          </div>
          {done ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm font-bold text-green-800">Plan generated and sent to {employee.full_name}!</p>
              <p className="text-xs text-green-600 mt-1">Visible in Lifecycle Management and the collaborator's Onboarding tab.</p>
            </div>
          ) : (
            <button onClick={handleGenerate} disabled={generating}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
              <Sparkles size={16} className={generating ? 'animate-spin' : ''} />
              {generating ? 'AI is generating plan...' : `Generate ${type.charAt(0).toUpperCase() + type.slice(1)} Plan`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Directory = () => {
  const [filterDept, setFilterDept] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [lifecycleTarget, setLifecycleTarget] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { get, post, patch } = useApi();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await get('/api/hr/directory/');
      setEmployees(data);
    } catch (err) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(e => {
    const matchDept = filterDept === 'All' || e.department === filterDept;
    const matchSearch = e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        e.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        e.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDept && matchSearch;
  });

  const handleSave = async (form) => {
    const payload = {
      full_name: form.name,
      role: form.systemRole,
      job_title: form.jobTitle,
      department: form.dept,
      email: form.email,
      phone: form.phone,
      contract_type: form.contract,
      max_leave_days: Number(form.maxLeave) || 25,
      salary: Number(form.salary) || null,
      status: form.status,
    };

    try {
      if (editTarget) {
        await patch(`/api/hr/directory/${editTarget.id}`, payload);
      } else {
        await post('/api/hr/directory/', { ...payload, password: 'password123' });
      }
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save employee');
    }
  };

  const handleArchive = async (emp, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to archive ${emp.full_name}?`)) return;
    try {
      await post(`/api/hr/directory/${emp.id}/archive`);
      toast.success(`${emp.full_name} has been archived`);
      fetchEmployees();
    } catch (err) {
      toast.error('Failed to archive employee');
    }
  };

  return (
    <>
      {showCreate && <CollaboratorModal mode="create" onClose={() => setShowCreate(false)} onSave={handleSave} />}
      {editTarget && <CollaboratorModal mode="edit" initial={editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} />}
      {lifecycleTarget && <LifecycleModal employee={lifecycleTarget} onClose={() => setLifecycleTarget(null)} />}

      <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Company Database</p>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Employee Directory</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-800">{employees.filter(e => e.status !== 'Archived').length}</span>
              <span className="text-slate-500 font-medium text-sm">Active</span>
            </div>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2">
              <UserPlus size={14} />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search by name, role, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
            {['All', 'Engineering', 'Product', 'Marketing'].map(dept => (
              <button key={dept} onClick={() => setFilterDept(dept)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${filterDept === dept ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-medium">Employee</th>
                <th className="py-3 px-4 font-medium">Manager</th>
                <th className="py-3 px-4 font-medium">Contact</th>
                <th className="py-3 px-4 font-medium">Contract</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredEmployees.filter(e => e.status !== 'archived').map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => {
                  setEditTarget({
                    id: emp.id, name: emp.full_name, jobTitle: emp.job_title || '', systemRole: emp.role || 'collaborator', dept: emp.department || 'Engineering', 
                    email: emp.email, phone: emp.phone || '', contract: emp.contract_type || 'CDI', 
                    manager: '', maxLeave: emp.max_leave_days || 25, salary: emp.salary || '', status: emp.status
                  });
                }}>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${emp.full_name}`} alt="" className="w-full h-full" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors">{emp.full_name}</div>
                        <div className="text-[11px] text-slate-500">{emp.job_title || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-600">{emp.manager_id ? `ID: ${emp.manager_id}` : '—'}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600"><Mail size={10} className="text-slate-400" /> {emp.email}</div>
                      {emp.phone && <div className="flex items-center gap-1.5 text-xs text-slate-600"><Phone size={10} className="text-slate-400" /> {emp.phone}</div>}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${emp.contract_type === 'CDI' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                      {emp.contract_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border capitalize ${
                      emp.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' :
                      emp.status === 'onboarding' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      emp.status === 'offboarding' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                      'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditTarget({
                          id: emp.id, name: emp.full_name, jobTitle: emp.job_title || '', systemRole: emp.role || 'collaborator', dept: emp.department || 'Engineering', 
                          email: emp.email, phone: emp.phone || '', contract: emp.contract_type || 'CDI', 
                          manager: '', maxLeave: emp.max_leave_days || 25, salary: emp.salary || '', status: emp.status
                        });
                      }} title="Edit" className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setLifecycleTarget(emp); }} title="Generate Onboarding/Offboarding" className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors">
                        <Sparkles size={14} />
                      </button>
                      <button onClick={(e) => handleArchive(emp, e)} title="Archive" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                        <Archive size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
};

export default Directory;
