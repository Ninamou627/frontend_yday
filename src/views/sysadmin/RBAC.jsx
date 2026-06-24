import React, { useState, useEffect } from 'react';
import { Lock, Save, RotateCcw, Search, ShieldCheck, UserCog, Mail, Key, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../services/useApi';

const AccountModal = ({ user, onClose, onRefresh }) => {
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { patch, post } = useApi();

  const handleSave = async () => {
    try {
      setLoading(true);
      await patch(`/api/admin/rbac/accounts/${user.id}`, { role });
      if (password) {
        await post(`/api/admin/rbac/accounts/${user.id}/reset-password`, { new_password: password });
      }
      toast.success(`Account for ${user.name} updated successfully`);
      onRefresh();
      onClose();
    } catch (err) {
      toast.error('Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Account Configuration</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage system access for <span className="font-bold">{user.name}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Mail size={12}/> Email (Login ID)</label>
            <input type="text" value={user.email} disabled className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 bg-slate-50 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Key size={12}/> Reset Password</label>
            <div className="flex gap-2">
              <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <button onClick={() => setPassword(Math.random().toString(36).slice(-8))} className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">Generate</button>
            </div>
            {password && <p className="text-[10px] text-yellow-600 font-bold mt-1">Make sure to securely share this with the user.</p>}
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><ShieldCheck size={12}/> System Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
              <option value="collaborator">Collaborator</option>
              <option value="manager">Manager</option>
              <option value="hr">HR Admin</option>
              <option value="executive">Executive</option>
              <option value="sysadmin">SysAdmin</option>
              <option value="qvt">QVT Specialist</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RBAC = () => {
  const [tab, setTab] = useState('Accounts');
  const [hasChanges, setHasChanges] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { get, post } = useApi();

  const roles = ['Collaborator', 'Manager', 'HR', 'Executive', 'Sysadmin', 'QVT'];
  
  const defaultResources = [
    '/api/profile/self', '/api/team/*', '/api/employees/*', 
    '/api/kpi/global', '/api/security/*', '/api/rag/*', '/api/qvt/heatmaps'
  ];

  const fetchRBAC = async () => {
    try {
      setLoading(true);
      const [accRes, permRes] = await Promise.all([
        get('/api/admin/rbac/accounts'),
        get('/api/admin/rbac/permissions')
      ]);

      setAccounts(accRes.map(a => ({
        id: a.id,
        name: a.full_name,
        email: a.email,
        role: a.role,
        status: a.status === 'active' ? 'Active' : 'Pending Setup',
        lastLogin: 'Active'
      })));

      // Build matrix
      const builtMatrix = defaultResources.map(res => {
        const row = { route: res };
        roles.forEach(r => {
          const roleKey = r.toLowerCase();
          const perm = permRes.find(p => p.resource === res && p.role === roleKey);
          row[roleKey] = perm ? perm.can_read : false;
        });
        return row;
      });
      setMatrix(builtMatrix);
    } catch (err) {
      toast.error('Failed to load RBAC data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRBAC();
  }, []);

  const savePermissions = async () => {
    try {
      // Optimistically we just save all true permissions as can_read=True
      for (const row of matrix) {
        for (const role of roles) {
          const roleKey = role.toLowerCase();
          await post('/api/admin/rbac/permissions', {
            role: roleKey,
            resource: row.route,
            can_read: row[roleKey] === true,
            can_create: row[roleKey] === true,
            can_update: row[roleKey] === true,
            can_delete: false,
            can_validate: false
          });
        }
      }
      toast.success('RBAC policies updated successfully');
      setHasChanges(false);
    } catch (err) {
      toast.error('Failed to save policies');
    }
  };

  const togglePermission = (rowIndex, role) => {
    const roleKey = role.toLowerCase();
    const newMatrix = [...matrix];
    newMatrix[rowIndex][roleKey] = !newMatrix[rowIndex][roleKey];
    setMatrix(newMatrix);
    setHasChanges(true);
  };

  const filteredAccounts = accounts.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {editUser && <AccountModal user={editUser} onClose={() => setEditUser(null)} onRefresh={fetchRBAC} />}

      <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Access Control</p>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Identity & RBAC</h1>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {['Accounts', 'Matrix'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {tab === 'Accounts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">User Accounts</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Search accounts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 font-medium">User</th>
                    <th className="py-3 px-4 font-medium">System Role</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Last Login</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredAccounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 text-sm">{acc.name}</div>
                        <div className="text-[11px] text-slate-500">{acc.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border bg-slate-100 text-slate-600 border-slate-200 uppercase">
                          <Lock size={10} /> {acc.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border ${acc.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                          {acc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">{acc.lastLogin}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button onClick={() => setEditUser(acc)} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm">
                          <UserCog size={14} /> Configure
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'Matrix' && (
          <>
            <div className={`transition-all duration-300 ${hasChanges ? 'opacity-100 translate-y-0 h-auto mb-4' : 'opacity-0 -translate-y-4 h-0 overflow-hidden m-0'}`}>
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 text-primary-700">
                  <ShieldCheck size={18} />
                  <span className="text-sm font-bold">Unsaved policy changes detected.</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setHasChanges(false)} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5">
                    <RotateCcw size={14} /> Discard
                  </button>
                  <button onClick={savePermissions} className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
                    <Save size={14} /> Save Policies
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-xs text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 font-bold sticky left-0 bg-slate-50/50 z-10 w-1/4 border-r border-slate-100">API Route / Resource</th>
                    {roles.map((r, i) => (
                      <th key={i} className="py-3 px-4 text-center font-bold"><div className="flex flex-col items-center gap-1"><Lock size={12} className="text-slate-300" />{r}</div></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={roles.length + 1} className="py-12 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : matrix.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-700 font-bold sticky left-0 bg-white group-hover:bg-slate-50 transition-colors border-r border-slate-100">{p.route}</td>
                      {roles.map((role, j) => {
                        const roleKey = role.toLowerCase();
                        const val = p[roleKey];
                        return (
                          <td key={j} className="py-3.5 px-4 text-center">
                            {val === true ? (
                              <button onClick={() => togglePermission(i, role)} className="w-5 h-5 rounded bg-green-100 text-green-600 flex items-center justify-center mx-auto hover:ring-2 ring-green-200 transition-all cursor-pointer">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              </button>
                            ) : (
                              <button onClick={() => togglePermission(i, role)} className="w-5 h-5 rounded bg-slate-100 text-slate-300 flex items-center justify-center mx-auto hover:bg-red-50 hover:text-red-400 transition-all cursor-pointer">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </>
  );
};

export default RBAC;
