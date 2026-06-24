import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, ArrowRight, PlayCircle, FileText, User, Loader2, Sparkles, Building, Settings, ListTodo } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../services/useApi';
import { useAuth } from '../../context/AuthContext';

const Onboarding = () => {
  const { user } = useAuth();
  const { get, patch } = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await get('/api/collaborator/onboarding/progress');
      setData(res);
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Failed to load onboarding plan');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleTask = async (taskId, currentStatus) => {
    try {
      // Optimistic update
      const updatedTasks = data.tasks.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t);
      const completed = updatedTasks.filter(t => t.is_completed).length;
      const total = updatedTasks.length;
      
      setData({
        ...data,
        tasks: updatedTasks,
        completed_tasks: completed,
        progress_pct: Math.round((completed / total) * 100)
      });
      
      if (!currentStatus) toast.success('Task marked as complete!');
      
      await patch('/api/collaborator/onboarding/toggle', { task_id: taskId });
    } catch (err) {
      toast.error('Failed to update task');
      fetchData(); // Revert on failure
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  if (!data || !data.tasks || data.tasks.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center max-w-5xl mx-auto">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
          <Sparkles size={24} className="text-slate-300" />
        </div>
        <h3 className="text-sm font-bold text-slate-700">No active journey found</h3>
        <p className="text-xs text-slate-500 mt-1">You don't have an active onboarding or offboarding plan.</p>
      </div>
    );
  }

  const { progress_pct, completed_tasks, total_tasks, tasks, lifecycle_type } = data;

  // Group tasks into milestones by day
  const milestonesMap = {};
  tasks.forEach(t => {
    if (!milestonesMap[t.day_target]) {
      milestonesMap[t.day_target] = { day: t.day_target, title: `Day ${t.day_target} Goals`, tasks: 0, completedTasks: 0 };
    }
    milestonesMap[t.day_target].tasks++;
    if (t.is_completed) milestonesMap[t.day_target].completedTasks++;
  });
  
  const steps = Object.values(milestonesMap).sort((a, b) => a.day - b.day).map(s => {
    const isCompleted = s.completedTasks === s.tasks;
    const isActive = s.completedTasks > 0 && !isCompleted;
    return {
      ...s,
      status: isCompleted ? 'completed' : (isActive ? 'active' : 'pending'),
      icon: isCompleted ? CheckCircle2 : (isActive ? Clock : Circle)
    };
  });

  // Calculate current active day (first day that is not fully completed)
  const currentStep = steps.find(s => s.status !== 'completed') || steps[steps.length - 1];
  const currentDay = currentStep ? currentStep.day : 0;

  const categoryIcons = {
    'IT': Settings,
    'Admin': FileText,
    'Culture': Building,
    'Meetings': User,
    'General': ListTodo
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1 capitalize">My {lifecycle_type} Journey</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome to WASL, {user?.full_name?.split(' ')[0]}</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-800">{currentDay}</span>
            <span className="text-slate-500 font-medium">Target Day</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-800">{progress_pct}%</span>
            <span className="text-slate-500 font-medium">Complete</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN - TIMELINE */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Milestones</h2>
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 relative">
            
            {/* Connecting line */}
            <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-slate-100 z-0"></div>

            <div className="space-y-8 relative z-10">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white border-2 ${
                      step.status === 'completed' ? 'border-green-500 text-green-500' :
                      step.status === 'active' ? 'border-primary-500 text-primary-500' :
                      'border-slate-200 text-slate-300'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-xs mt-1 ${step.status === 'pending' ? 'text-slate-300' : 'text-slate-500'}`}>
                        {step.desc}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          step.status === 'completed' ? 'bg-green-50 text-green-600' :
                          step.status === 'active' ? 'bg-primary-50 text-primary-600' :
                          'bg-slate-50 text-slate-400'
                        }`}>
                          Day {step.day}
                        </span>
                        <span className={`text-[10px] font-medium ${step.status === 'pending' ? 'text-slate-300' : 'text-slate-400'}`}>
                          {step.completedTasks}/{step.tasks} tasks
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - ACTIVE TASKS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">All Tasks</h2>
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{total_tasks - completed_tasks} Remaining</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {tasks.map((task, i) => {
                const Icon = categoryIcons[task.category] || ListTodo;
                return (
                  <div key={task.id} className={`p-4 transition-colors flex items-center justify-between group ${task.is_completed ? 'bg-slate-50/50' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleTask(task.id, task.is_completed)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                          task.is_completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-transparent hover:border-green-500'
                        }`}
                      >
                        <CheckCircle2 size={14} />
                      </button>
                      <div>
                        <div className={`font-bold text-sm ${task.is_completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`flex items-center gap-1 text-[10px] font-bold ${task.is_completed ? 'text-slate-400' : 'text-slate-600'}`}>
                            Day {task.day_target}
                          </span>
                          <span className="text-slate-300 text-[10px]">•</span>
                          <span className={`flex items-center gap-1 text-[10px] font-medium ${task.is_completed ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Icon size={10} /> {task.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Onboarding;
