import React, { useState } from 'react';
import { Sliders, Save, RefreshCw, ChevronDown, CheckCircle, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Sandbox = () => {
  const [turnover, setTurnover] = useState(15);
  const [hiring, setHiring] = useState(10);
  const [salaryInc, setSalaryInc] = useState(3);
  const [remote, setRemote] = useState(40);
  const [isRunning, setIsRunning] = useState(false);

  const handleSimulate = () => {
    setIsRunning(true);
    toast('Running AI Monte Carlo simulation...');
    setTimeout(() => {
      setIsRunning(false);
      toast.success('Simulation complete');
    }, 1500);
  };

  const baseHeadcount = 145;
  const avgSalary = 65000;
  const costPerHire = 8500;

  // Simple math for simulation display
  const projectedTurnoverCount = Math.round((turnover / 100) * baseHeadcount);
  const projectedHeadcount = baseHeadcount - projectedTurnoverCount + hiring;
  const projectedPayroll = (projectedHeadcount * avgSalary * (1 + (salaryInc/100))) / 1000000;
  const recruitmentCost = (hiring + projectedTurnoverCount) * costPerHire;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Interactive Financial Modeling</p>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Scenario Sandbox</h1>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm">
            <Save size={16} />
            <span>Save Scenario</span>
          </button>
          <button onClick={handleSimulate} disabled={isRunning} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50">
            <RefreshCw size={16} className={isRunning ? "animate-spin" : ""} />
            <span>{isRunning ? 'Calculating...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL - PARAMETERS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Input Parameters</h2>
            <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors">
              Load Preset <ChevronDown size={12} />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 space-y-8">
            
            {/* Control Group 1 */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Workforce Dynamics</h3>
              
              <div>
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block">Expected Turnover Rate</label>
                    <span className="text-[10px] text-slate-400">Current baseline: 12%</span>
                  </div>
                  <div className="bg-slate-100 px-3 py-1 rounded-md">
                    <span className="font-bold text-primary-600 text-sm">{turnover}%</span>
                  </div>
                </div>
                <input 
                  type="range" min="0" max="40" value={turnover} onChange={(e) => setTurnover(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block">New Hires (Next Qtr)</label>
                    <span className="text-[10px] text-slate-400">Approved budget: 8</span>
                  </div>
                  <div className="bg-slate-100 px-3 py-1 rounded-md">
                    <span className="font-bold text-primary-600 text-sm">+{hiring}</span>
                  </div>
                </div>
                <input 
                  type="range" min="0" max="50" value={hiring} onChange={(e) => setHiring(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>
            </div>

            {/* Control Group 2 */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Financial Policy</h3>
              
              <div>
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block">Global Salary Increase</label>
                    <span className="text-[10px] text-slate-400">Inflation adj: 2.5%</span>
                  </div>
                  <div className="bg-slate-100 px-3 py-1 rounded-md">
                    <span className="font-bold text-primary-600 text-sm">{salaryInc}%</span>
                  </div>
                </div>
                <input 
                  type="range" min="0" max="10" step="0.5" value={salaryInc} onChange={(e) => setSalaryInc(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block">Remote Work Adoption</label>
                    <span className="text-[10px] text-slate-400">Impacts office overhead</span>
                  </div>
                  <div className="bg-slate-100 px-3 py-1 rounded-md">
                    <span className="font-bold text-primary-600 text-sm">{remote}%</span>
                  </div>
                </div>
                <input 
                  type="range" min="0" max="100" value={remote} onChange={(e) => setRemote(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL - OUTPUT */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Projected Outcomes (12 Mo)</h2>
            <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
              <CheckCircle size={12} /> Sync: Live
            </div>
          </div>

          <div className={`transition-opacity duration-300 ${isRunning ? 'opacity-50' : 'opacity-100'}`}>
            
            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5">
                <div className="flex items-center gap-2 text-slate-500 mb-3">
                  <Users size={16} /> <span className="text-xs font-bold uppercase">End Headcount</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-slate-800">{projectedHeadcount}</span>
                  <span className={`text-xs font-bold flex items-center gap-0.5 ${projectedHeadcount >= baseHeadcount ? 'text-green-500' : 'text-red-500'}`}>
                    {projectedHeadcount >= baseHeadcount ? <TrendingUp size={14} /> : <TrendingDown size={14} />} 
                    {Math.abs(projectedHeadcount - baseHeadcount)} vs today
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 border-t-4 border-t-primary-500">
                <div className="flex items-center gap-2 text-slate-500 mb-3">
                  <DollarSign size={16} /> <span className="text-xs font-bold uppercase">Annual Payroll</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-slate-800">€{projectedPayroll.toFixed(2)}M</span>
                  <span className="text-xs font-bold text-slate-400">Total Run Rate</span>
                </div>
              </div>
            </div>

            {/* Financial Impact Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-700">Financial Impact Breakdown</h3>
              </div>
              <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 font-medium text-slate-600">Cost of Turnover ({projectedTurnoverCount} departing)</td>
                    <td className="py-4 px-5 text-right font-bold text-red-500">-€{((projectedTurnoverCount * 12000)/1000).toFixed(1)}k</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 font-medium text-slate-600">Recruitment Agency Fees ({hiring} hires)</td>
                    <td className="py-4 px-5 text-right font-bold text-red-500">-€{(recruitmentCost/1000).toFixed(1)}k</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 font-medium text-slate-600">Salary Adjustments (+{salaryInc}%)</td>
                    <td className="py-4 px-5 text-right font-bold text-red-500">-€{(((baseHeadcount * avgSalary * (salaryInc/100)))/1000).toFixed(1)}k</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 font-medium text-slate-600 flex items-center gap-2">
                      Office Overhead Savings ({remote}% remote)
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">Credit</span>
                    </td>
                    <td className="py-4 px-5 text-right font-bold text-green-600">+€{((baseHeadcount * (remote/100) * 2000)/1000).toFixed(1)}k</td>
                  </tr>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td className="py-4 px-5 font-bold text-slate-800 uppercase text-xs">Net Financial Variance</td>
                    <td className="py-4 px-5 text-right font-black text-slate-800">
                      -€{(((projectedTurnoverCount * 12000) + recruitmentCost + (baseHeadcount * avgSalary * (salaryInc/100)) - (baseHeadcount * (remote/100) * 2000))/1000).toFixed(1)}k
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Sandbox;
