import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, History, Search, FileText, Settings, Shield, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerAI = () => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    toast('AI is processing your query...');
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* LEFT SIDEBAR - HISTORY & CONTEXT */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-4">
        <button className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm">
          <Plus size={16} /> New Conversation
        </button>

        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">History</h3>
            <History size={14} className="text-slate-400" />
          </div>
          <div className="overflow-y-auto p-2 space-y-1">
            {[
              'Q3 Performance Review Drafts',
              'Conflict Resolution: Design Team',
              'Analyze Workload Distribution',
              'Team Building Ideas (Remote)',
              'Promotion criteria for Alex'
            ].map((item, i) => (
              <div key={i} className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md cursor-pointer truncate transition-colors">
                {item}
              </div>
            ))}
          </div>
        </div>
        
        {/* RAG Context Indicator */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-blue-500" />
            <span className="text-xs font-bold text-blue-700">Privacy & Context</span>
          </div>
          <p className="text-[10px] text-blue-600/80 leading-relaxed">
            AI has access to anonymized team performance data and HR policies. Private communications are excluded.
          </p>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Chat Header */}
        <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-primary-100 flex items-center justify-center">
              <Sparkles size={12} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Manager Copilot</h2>
              <p className="text-[10px] text-slate-500">Model: HR-RAG-v4 • Active</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <Settings size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          
          {/* AI Welcome */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="max-w-[85%]">
              <div className="text-[10px] font-bold text-slate-400 mb-1 ml-1">Copilot</div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700 leading-relaxed">
                Hello Alex. I've reviewed the latest team telemetry. I noticed a <strong>15% increase in overtime</strong> among the Engineering team. How would you like to proceed?
              </div>
            </div>
          </div>

          {/* User Message */}
          <div className="flex items-start gap-4 flex-row-reverse">
             <div className="w-8 h-8 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 shadow-sm border border-white">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=f97316" alt="" className="w-full h-full" />
            </div>
            <div className="max-w-[85%]">
              <div className="text-[10px] font-bold text-slate-400 mb-1 mr-1 text-right">You</div>
              <div className="bg-slate-800 text-white p-4 rounded-2xl rounded-tr-none shadow-sm text-sm leading-relaxed">
                Give me a breakdown of the workload. Who is most at risk?
              </div>
            </div>
          </div>

          {/* AI Response */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="max-w-[85%] w-full">
              <div className="text-[10px] font-bold text-slate-400 mb-1 ml-1">Copilot</div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700 leading-relaxed">
                Based on Jira commits and calendar density, here is the anonymized workload distribution:
                
                <div className="mt-4 border border-slate-100 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                      <tr>
                        <th className="px-3 py-2">Role Segment</th>
                        <th className="px-3 py-2">Avg Hrs/Wk</th>
                        <th className="px-3 py-2">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-3 py-2 font-medium">Senior Engineers (2)</td>
                        <td className="px-3 py-2 text-red-600 font-bold">54h</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 bg-red-50 text-red-700 rounded border border-red-100 font-bold">High</span></td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-medium">Mid/Junior (4)</td>
                        <td className="px-3 py-2 text-slate-700">41h</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 bg-green-50 text-green-700 rounded border border-green-100 font-bold">Low</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4">
                  I suggest shifting 2 minor projects to the Mid/Junior tier. Would you like me to draft a proposal for this?
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          {/* Quick Prompts */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            {['Draft proposal', 'Show meeting load', 'Prepare 1-on-1 agenda'].map((prompt, i) => (
              <button key={i} onClick={() => setInput(prompt)} className="text-[10px] font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-full whitespace-nowrap transition-colors">
                {prompt}
              </button>
            ))}
          </div>
          
          <div className="relative flex items-center bg-white border border-slate-300 rounded-xl shadow-sm focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all overflow-hidden p-1">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <FileText size={18} />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Message Copilot..." 
              className="flex-1 px-2 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <button 
              onClick={handleSend}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center mr-1 ${
                input.trim() ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              <Send size={16} />
            </button>
          </div>
          <div className="text-center mt-2">
             <span className="text-[9px] text-slate-400 font-medium">Copilot can make mistakes. Verify important metrics.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManagerAI;
