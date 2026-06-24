import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Search, Filter, MoreHorizontal, CheckCircle, Clock, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../services/useApi';

const Lifecycle = () => {
  const [activeTab, setActiveTab] = useState('onboarding');
  const [lifecycles, setLifecycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [generating, setGenerating] = useState(false);

  const { get, post } = useApi();

  const fetchLifecycles = async () => {
    try {
      setLoading(true);
      const data = await get('/api/hr/dashboard/active-lifecycles');
      setLifecycles(data);
    } catch (error) {
      toast.error('Failed to load active lifecycles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLifecycles();
  }, []);

  const openModal = async (type) => {
    setModalType(type);
    setShowModal(true);
    setSelectedEmp('');
    try {
      const data = await get('/api/hr/directory/');
      // filter out employees that are already in a lifecycle to keep it clean, or just show all
      setEmployees(data);
    } catch (err) {
      toast.error('Failed to load employee list');
    }
  };

  const submitGeneration = async () => {
    if (!selectedEmp) return;
    
    setGenerating(true);
    const loadingToast = toast.loading(`AI is generating the ${modalType} plan...`);
    try {
      await post('/api/hr/lifecycle/generate', {
        employee_id: parseInt(selectedEmp),
        lifecycle_type: modalType
      });
      toast.success(`${modalType} plan created successfully by AI!`, { id: loadingToast });
      setShowModal(false);
      fetchLifecycles();
    } catch (error) {
      toast.error(`Failed to generate ${modalType} plan (maybe they already have one?)`, { id: loadingToast });
    } finally {
      setGenerating(false);
    }
  };

  const filteredData = lifecycles.filter(emp => 
    emp.lifecycle_type === activeTab &&
    emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onboardingCount = lifecycles.filter(e => e.lifecycle_type === 'onboarding').length;
  const offboardingCount = lifecycles.filter(e => e.lifecycle_type === 'offboarding').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Employee Journeys</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Lifecycle Management</h1>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => openModal('onboarding')} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2">
            <UserPlus size={16} />
            <span>New Onboarding</span>
          </button>
          <button onClick={() => openModal('offboarding')} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm">
            <UserMinus size={16} />
            <span>New Offboarding</span>
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="flex flex-wrap items-center gap-8 text-sm">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800 tracking-tight">{onboardingCount}</span>
          <div>
            <span className="text-slate-500 font-medium block text-xs">Active Onboarding</span>
            <span className="text-[10px] font-medium text-green-600">Active tracking</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800 tracking-tight">{offboardingCount}</span>
          <div>
            <span className="text-slate-500 font-medium block text-xs">Active Offboarding</span>
            <span className="text-[10px] font-medium text-red-600">Requires attention</span>
          </div>
        </div>
      </div>

      {/* TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'onboarding' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Onboarding ({onboardingCount})
          </button>
          <button
            onClick={() => setActiveTab('offboarding')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'offboarding' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Offboarding ({offboardingCount})
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search employee..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* PIPELINE TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : filteredData.length > 0 ? (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-medium">Employee</th>
                <th className="py-3 px-4 font-medium">Tasks</th>
                <th className="py-3 px-4 font-medium w-1/4">Progress</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((emp) => {
                const statusStr = emp.progress_pct === 100 ? 'Completed' : (emp.progress_pct > 30 ? 'On Track' : 'Just Started');
                return (
                  <tr key={emp.employee_id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => toast('Opening details pane...')}>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${emp.employee_name}`} alt="" className="w-full h-full" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors">{emp.employee_name}</div>
                          <div className="text-[11px] text-slate-500">{emp.job_title || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-bold text-slate-700">{emp.completed_tasks}</span>
                      <span className="text-xs text-slate-400"> of {emp.total_tasks}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all bg-primary-500`} style={{ width: `${emp.progress_pct}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 w-8">{emp.progress_pct}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                       <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border ${
                        statusStr === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {statusStr === 'Completed' ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {statusStr}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <MoreHorizontal size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors ml-auto" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <CheckCircle size={24} className="text-slate-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No active pipelines</h3>
            <p className="text-xs text-slate-500 mt-1">There are currently no employees in this phase.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-1 capitalize">AI {modalType} Generator</h3>
            <p className="text-sm text-slate-500 mb-6">Select a collaborator. The AI will generate a tailored plan based on their job title and department.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Collaborator</label>
                <select 
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  value={selectedEmp}
                  onChange={(e) => setSelectedEmp(e.target.value)}
                  disabled={generating}
                >
                  <option value="">-- Choose an employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.job_title || 'No Title'})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button 
                onClick={() => setShowModal(false)}
                disabled={generating}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitGeneration}
                disabled={!selectedEmp || generating}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lifecycle;
