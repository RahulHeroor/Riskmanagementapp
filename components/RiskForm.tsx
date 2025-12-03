import React, { useState, useEffect } from 'react';
import { Risk, RiskStatus } from '../types';
import { LIKELIHOOD_SCALE, IMPACT_SCALE, calculateRiskLevel } from '../constants';
import { generateRiskSuggestions, generateTreatmentPlan } from '../services/geminiService';
import { Wand2, Loader2, Save, X } from 'lucide-react';

interface RiskFormProps {
  initialData?: Risk | null;
  onSave: (risk: Risk) => void;
  onCancel: () => void;
}

const RiskForm: React.FC<RiskFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Risk>>({
    title: '',
    asset: '',
    threat: '',
    vulnerability: '',
    likelihood: 3,
    impact: 3,
    status: 'Open' as RiskStatus,
    owner: '',
    treatmentPlan: '',
  });

  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingTreatment, setLoadingTreatment] = useState(false);
  const [suggestions, setSuggestions] = useState<{ threats: string[], vulnerabilities: string[] }>({ threats: [], vulnerabilities: [] });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'likelihood' || name === 'impact' ? parseInt(value) : value
    }));
  };

  const handleAiSuggestions = async () => {
    if (!formData.asset) return;
    setLoadingSuggestions(true);
    const result = await generateRiskSuggestions(formData.asset || '', 'Enterprise ISMS');
    setSuggestions(result);
    setLoadingSuggestions(false);
  };

  const handleAiTreatment = async () => {
    if (!formData.title && !formData.threat) return;
    setLoadingTreatment(true);
    const plan = await generateTreatmentPlan(formData.title || '', formData.threat || '', formData.vulnerability || '');
    setFormData(prev => ({ ...prev, treatmentPlan: plan }));
    setLoadingTreatment(false);
  };

  // Helper to generate IDs that works in non-secure contexts (HTTP LAN)
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for environments where crypto.randomUUID is blocked
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const likelihood = formData.likelihood || 1;
    const impact = formData.impact || 1;
    const score = likelihood * impact;
    
    const newRisk: Risk = {
      id: initialData?.id || generateId(),
      title: formData.title || 'Untitled Risk',
      asset: formData.asset || 'Unknown Asset',
      threat: formData.threat || '',
      vulnerability: formData.vulnerability || '',
      likelihood,
      impact,
      score,
      level: calculateRiskLevel(score),
      status: formData.status || 'Open',
      owner: formData.owner || 'Unassigned',
      treatmentPlan: formData.treatmentPlan || '',
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newRisk);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">
            {initialData ? 'Edit Risk Assessment' : 'New Risk Assessment'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          
          {/* Identification Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
              Risk Identification
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Asset Name *</label>
                <div className="flex gap-2">
                  <input
                    required
                    name="asset"
                    value={formData.asset}
                    onChange={handleChange}
                    placeholder="e.g., Customer Database, Web Server"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={handleAiSuggestions}
                    disabled={!formData.asset || loadingSuggestions}
                    className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 border border-purple-200 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                  >
                    {loadingSuggestions ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                    Identify
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Risk Title *</label>
                <input
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Short description of the risk"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* AI Suggestions Panel */}
            {suggestions.threats.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Suggestions for {formData.asset}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-red-600 mb-1 block">Potential Threats</span>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.threats.map((t, i) => (
                        <button key={i} type="button" onClick={() => setFormData(prev => ({ ...prev, threat: t }))} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded hover:border-red-300 hover:bg-red-50 text-left transition-colors">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-orange-600 mb-1 block">Potential Vulnerabilities</span>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.vulnerabilities.map((v, i) => (
                        <button key={i} type="button" onClick={() => setFormData(prev => ({ ...prev, vulnerability: v }))} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded hover:border-orange-300 hover:bg-orange-50 text-left transition-colors">
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Threat</label>
                <input
                  name="threat"
                  value={formData.threat}
                  onChange={handleChange}
                  placeholder="e.g., Malware infection"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Vulnerability</label>
                <input
                  name="vulnerability"
                  value={formData.vulnerability}
                  onChange={handleChange}
                  placeholder="e.g., Unpatched OS"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Analysis Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
              Risk Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 block">Likelihood (1-5)</label>
                <select
                  name="likelihood"
                  value={formData.likelihood}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {LIKELIHOOD_SCALE.map(s => (
                    <option key={s.value} value={s.value}>{s.value} - {s.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 block">Impact (1-5)</label>
                <select
                  name="impact"
                  value={formData.impact}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {IMPACT_SCALE.map(s => (
                    <option key={s.value} value={s.value}>{s.value} - {s.label}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-100 rounded-lg p-3 flex flex-col justify-center items-center text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase">Calculated Score</span>
                <div className="text-3xl font-bold text-slate-800">{(formData.likelihood || 1) * (formData.impact || 1)}</div>
                <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-white border border-slate-200 mt-1">
                  {calculateRiskLevel((formData.likelihood || 1) * (formData.impact || 1))} Level
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Treatment Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
              Risk Treatment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {['Open', 'Mitigated', 'Accepted', 'Transferred', 'Avoided'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Owner</label>
                <input
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  placeholder="Department or Person"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-slate-600">Treatment Plan / Controls</label>
                <button
                  type="button"
                  onClick={handleAiTreatment}
                  disabled={loadingTreatment}
                  className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 font-medium disabled:opacity-50"
                >
                  {loadingTreatment ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                  Suggest Controls
                </button>
              </div>
              <textarea
                name="treatmentPlan"
                rows={3}
                value={formData.treatmentPlan}
                onChange={handleChange}
                placeholder="Describe mitigation strategy or controls..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </section>

        </form>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 flex items-center gap-2 transition-all hover:shadow-md"
          >
            <Save size={16} />
            Save Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskForm;