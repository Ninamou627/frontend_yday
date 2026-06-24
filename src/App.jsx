import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Search, Bell, Mail } from 'lucide-react';
import Sidebar from './components/Sidebar';

// Collaborator Views
import { CollaboratorDashboard, CollaboratorAssistant, CollaboratorDocuments, CollaboratorOnboarding, CollaboratorSurveys } from './views/collaborator';

// Manager Views
import { ManagerDashboard, ManagerAlerts, ManagerApprovals, ManagerAI } from './views/manager';

// HR Views
import { HRDashboard, HRValidations, HRLifecycle, HRDirectory } from './views/hr';

// Executive Views
import { ExecutiveDashboard, ExecutiveSandbox, ExecutiveReports } from './views/executive';

// SysAdmin Views
import { SysAdminDashboard, SysAdminSecurity, SysAdminRBAC, SysAdminRAG } from './views/sysadmin';

// QVT Views
import { QVTDashboard, QVTSurveys, QVTRecommendations } from './views/qvt';

// Auth
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './views/auth/Login';

const ROLE_ROUTES = {
  collaborator: [
    { path: '/', element: <CollaboratorDashboard /> },
    { path: '/chat', element: <CollaboratorAssistant /> },
    { path: '/documents', element: <CollaboratorDocuments /> },
    { path: '/surveys', element: <CollaboratorSurveys /> },
    { path: '/onboarding', element: <CollaboratorOnboarding /> },
  ],
  manager: [
    { path: '/', element: <ManagerDashboard /> },
    { path: '/alerts', element: <ManagerAlerts /> },
    { path: '/approvals', element: <ManagerApprovals /> },
    { path: '/manager-ai', element: <ManagerAI /> },
  ],
  hr: [
    { path: '/', element: <HRDashboard /> },
    { path: '/validations', element: <HRValidations /> },
    { path: '/lifecycle', element: <HRLifecycle /> },
    { path: '/directory', element: <HRDirectory /> },
    { path: '/recommendations', element: <QVTRecommendations /> },
  ],
  executive: [
    { path: '/', element: <ExecutiveDashboard /> },
    { path: '/sandbox', element: <ExecutiveSandbox /> },
    { path: '/reports', element: <ExecutiveReports /> },
  ],
  sysadmin: [
    { path: '/', element: <SysAdminDashboard /> },
    { path: '/security', element: <SysAdminSecurity /> },
    { path: '/rbac', element: <SysAdminRBAC /> },
    { path: '/rag', element: <SysAdminRAG /> },
  ],
  qvt: [
    { path: '/', element: <QVTDashboard /> },
    { path: '/surveys', element: <QVTSurveys /> },
    { path: '/recommendations', element: <QVTRecommendations /> },
  ],
};

const ROLE_LABELS = {
  collaborator: 'Employee',
  manager: 'Manager',
  hr: 'HR Team',
  executive: 'Executive',
  sysadmin: 'SysAdmin',
  qvt: 'QVT Officer',
};

function AppContent() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Login />;
  }

  const currentRole = user.role || 'collaborator';
  const routes = ROLE_ROUTES[currentRole] || [];

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ className: 'text-sm font-bold', duration: 3000 }} />
      <div className="flex h-screen overflow-hidden bg-background text-slate-800 font-sans">
        {/* Sidebar */}
        <Sidebar role={currentRole} />
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-y-auto">
          {/* Top Navbar */}
          <header className="h-20 px-10 flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-md">
            <div>
              <h1 className="text-sm font-bold text-slate-900">
                {ROLE_LABELS[currentRole]} Workspace
              </h1>
              <p className="text-[11px] text-slate-500">{user.full_name}</p>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-white rounded-full px-4 py-2.5 shadow-sm border border-slate-100 w-80">
              <Search size={16} className="text-slate-400 mr-3" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
              />
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-[10px] text-slate-400 font-medium">
                <span>⌘</span> K
              </div>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-3 text-slate-400">
                <button onClick={() => toast('No new messages')} className="hover:text-primary-500 transition-colors p-2 rounded-xl hover:bg-primary-50">
                  <Mail size={18} />
                </button>
                <button onClick={() => toast('You have 3 unread notifications')} className="hover:text-primary-500 transition-colors p-2 rounded-xl hover:bg-primary-50 relative">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>

              <div className="h-6 w-px bg-slate-200"></div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-slate-900">{user.full_name}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{ROLE_LABELS[currentRole]}</div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                    <img src={user.photo_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.full_name}&backgroundColor=f97316`} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button onClick={logout} className="text-[10px] text-red-500 font-bold hover:underline">Logout</button>
                </div>
              </div>
            </div>
          </header>

          <div className="p-8 pb-24 w-full">
            <Routes>
              {routes.map((route, i) => (
                <Route key={`${currentRole}-${route.path}-${i}`} path={route.path} element={route.element} />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
