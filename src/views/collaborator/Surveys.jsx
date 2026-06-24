import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, ArrowRight, Loader2, Sparkles, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../services/useApi';
import { DailyPulse } from './Dashboard';

const Surveys = () => {
  const { get, loading } = useApi();
  const [surveys, setSurveys] = useState([]);
  const [activePulse, setActivePulse] = useState(false);
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [pulseSubmittedToday, setPulseSubmittedToday] = useState(false);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const [data, stats] = await Promise.all([
          get('/api/collaborator/pulse/surveys'),
          get('/api/collaborator/pulse/stats', { silent: true })
        ]);
        setSurveys(data || []);
        if (stats) {
          setPulseSubmittedToday(stats.already_submitted_today);
        }
      } catch (err) {
        console.error('Failed to load surveys:', err);
      }
    };
    fetchSurveys();
  }, [get]);

  const handleOpenSurvey = (survey) => {
    if (survey.survey_type === 'ai_pulse') {
      setActivePulse(true);
    } else {
      setActiveSurvey(survey);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* HEADER */}
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">Feedback & Wellness</p>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Surveys</h1>
        <p className="text-sm text-slate-500 mt-2">
          Participate in active surveys and AI pulses to help improve the workplace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {surveys.length > 0 ? surveys.map((survey) => (
          <div key={survey.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 hover:border-primary-300 transition-colors group cursor-pointer" onClick={() => handleOpenSurvey(survey)}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${survey.survey_type === 'ai_pulse' ? 'bg-primary-50 text-primary-600' : 'bg-slate-50 text-slate-600'}`}>
                  {survey.survey_type === 'ai_pulse' ? <Sparkles size={18} /> : <MessageSquare size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{survey.title}</h3>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{survey.code}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border bg-green-50 text-green-700 border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Active
              </span>
            </div>
            
            <p className="text-xs text-slate-500 mb-4 line-clamp-2">
              {survey.survey_type === 'ai_pulse' 
                ? 'Daily pulse aggregated to measure team sentiment and wellness securely and anonymously.'
                : 'A classic survey requiring your direct feedback on specific company or team matters.'}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                {survey.survey_type === 'ai_pulse' && pulseSubmittedToday ? (
                  <span className="text-green-500 flex items-center gap-1"><CheckCircle size={12} /> Completed for today</span>
                ) : (
                  <><AlertCircle size={12} /> Pending your response</>
                )}
              </div>
              
              {!(survey.survey_type === 'ai_pulse' && pulseSubmittedToday) && (
                <button className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                  Start <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <CheckCircle className="text-slate-300 w-12 h-12 mb-3" />
            <h3 className="text-sm font-bold text-slate-700">All caught up!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              There are no active surveys requiring your attention right now.
            </p>
          </div>
        )}
      </div>

      {/* MODALS */}
      {activePulse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActivePulse(false)}>
          <div className="w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <DailyPulse onClose={() => setActivePulse(false)} onSubmitted={() => { setActivePulse(false); setPulseSubmittedToday(true); }} />
          </div>
        </div>
      )}

      {activeSurvey && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveSurvey(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{activeSurvey.title}</h2>
                <p className="text-xs text-slate-500">Classic Survey • Anonymous</p>
              </div>
              <button onClick={() => setActiveSurvey(null)} className="text-slate-400 hover:text-slate-600 p-2">
                <X size={20} />
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <MessageSquare className="text-slate-300 w-12 h-12 mb-3" />
              <p className="text-sm font-bold text-slate-700">Coming Soon</p>
              <p className="text-xs text-slate-500 mt-1">Dynamic survey forms are being integrated.</p>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setActiveSurvey(null)} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Surveys;
