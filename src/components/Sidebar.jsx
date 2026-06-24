import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Users,
  ShieldAlert,
  Activity,
  Settings,
  HeartPulse,
  LineChart,
  Database,
  Lock,
  Plus
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';

const ROLE_NAVIGATION = {
  collaborator: [
    { section: 'OVERVIEW' },
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', badge: null },
    { name: 'HR Assistant', icon: MessageSquare, path: '/chat', badge: '2' },
    { name: 'My Documents', icon: FileText, path: '/documents', badge: null },
    { name: 'Surveys', icon: MessageSquare, path: '/surveys', badge: '1' },
    { section: 'ONBOARDING' },
    { name: 'Journey', icon: Activity, path: '/onboarding', badge: null },
  ],
  manager: [
    { section: 'OVERVIEW' },
    { name: 'Team Dashboard', icon: Users, path: '/', badge: null },
    { name: 'Alerts Feed', icon: ShieldAlert, path: '/alerts', badge: '3' },
    { name: 'Leave Approvals', icon: FileText, path: '/approvals', badge: '5' },
    { section: 'MANAGEMENT' },
    { name: 'Manager AI', icon: MessageSquare, path: '/manager-ai', badge: null },
  ],
  hr: [
    { section: 'OVERVIEW' },
    { name: 'Global KPI', icon: LayoutDashboard, path: '/', badge: null },
    { name: 'Validations', icon: FileText, path: '/validations', badge: '8' },
    { name: 'Lifecycles', icon: Activity, path: '/lifecycle', badge: null },
    { section: 'DATABASE' },
    { name: 'Directory', icon: Users, path: '/directory', badge: null },
    { section: 'WELLNESS' },
    { name: 'Recommendations', icon: HeartPulse, path: '/recommendations', badge: null },
  ],
  executive: [
    { section: 'OVERVIEW' },
    { name: 'Financials', icon: LineChart, path: '/', badge: null },
    { name: 'Sandbox', icon: Activity, path: '/sandbox', badge: null },
    { section: 'COMPLIANCE' },
    { name: 'Reports', icon: FileText, path: '/reports', badge: null },
  ],
  sysadmin: [
    { section: 'SUPERVISION' },
    { name: 'AI Health', icon: Activity, path: '/', badge: null },
    { name: 'Security Logs', icon: ShieldAlert, path: '/security', badge: '1' },
    { section: 'CONFIGURATION' },
    { name: 'RBAC Matrix', icon: Lock, path: '/rbac', badge: null },
    { name: 'RAG DB', icon: Database, path: '/rag', badge: null },
  ],
  qvt: [
    { section: 'OVERVIEW' },
    { name: 'Heatmaps', icon: HeartPulse, path: '/', badge: null },
    { name: 'Pulse Surveys', icon: MessageSquare, path: '/surveys', badge: null },
    { section: 'ACTIONS' },
    { name: 'Recommendations', icon: FileText, path: '/recommendations', badge: null },
  ]
};

const Sidebar = ({ role }) => {
  const items = ROLE_NAVIGATION[role] || [];

  return (
    <aside className="w-64 bg-[#0f121d] text-white h-full flex flex-col shadow-xl z-20">
      <div className="h-20 flex items-center px-8 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="font-bold text-xl tracking-tight uppercase">Wasl</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto hide-scrollbar">
        {items.map((item, idx) => {
          if (item.section) {
            return (
              <div key={idx} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mt-8 mb-3 flex items-center gap-2">
                {item.section} <span className="text-[8px] opacity-50">↗</span>
              </div>
            );
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all w-full text-left ${isActive && item.path === '/' ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`
              }
            >
              <Icon size={20} className={item.path === '/' ? 'text-primary-500' : 'opacity-70'} />
              <span className="flex-1 text-sm">{item.name}</span>
              {item.badge && (
                <span className="w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center text-[10px] font-bold shadow-lg shadow-primary-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Styled CTA Card like in the design */}
      <div className="p-6">
        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center text-center backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors" onClick={() => toast.success('New Request flow initiated')}>
          <button className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/30 mb-3 hover:scale-105 transition-transform pointer-events-none">
            <Plus size={20} />
          </button>
          <span className="text-sm font-bold text-white mb-1 uppercase tracking-wide">New Request</span>
          <span className="text-[10px] text-slate-400 uppercase">Ask AI ↗</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
