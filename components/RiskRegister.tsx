import React, { useState } from 'react';
import { Risk } from '../types';
import { RISK_LEVEL_COLORS, RISK_STATUS_COLORS } from '../constants';
import { Edit2, Trash2, Search, Filter } from 'lucide-react';

interface RiskRegisterProps {
  risks: Risk[];
  onEdit: (risk: Risk) => void;
  onDelete: (id: string) => void;
}

const RiskRegister: React.FC<RiskRegisterProps> = ({ risks, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');

  const filteredRisks = risks.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          r.asset.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = filterLevel === 'All' || r.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
      
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 rounded-t-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search risks, assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-slate-500" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">ID / Asset</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-1/3">Risk Description</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center">Score</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Level</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Status</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRisks.length > 0 ? filteredRisks.map((risk) => (
              <tr key={risk.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4 align-top">
                  <div className="font-mono text-xs text-slate-400 mb-1">{risk.id.slice(0, 8)}</div>
                  <div className="font-medium text-slate-800">{risk.asset}</div>
                </td>
                <td className="p-4 align-top">
                  <div className="font-semibold text-slate-800 mb-1">{risk.title}</div>
                  <div className="text-sm text-slate-500 mb-1">
                    <span className="font-medium text-slate-600">Threat:</span> {risk.threat}
                  </div>
                  <div className="text-sm text-slate-500">
                    <span className="font-medium text-slate-600">Vuln:</span> {risk.vulnerability}
                  </div>
                </td>
                <td className="p-4 align-top text-center">
                  <div className="inline-block px-3 py-1 bg-slate-100 rounded-full font-bold text-slate-700">
                    {risk.score}
                  </div>
                </td>
                <td className="p-4 align-top">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${RISK_LEVEL_COLORS[risk.level]}`}>
                    {risk.level}
                  </span>
                </td>
                <td className="p-4 align-top">
                   <span className={`px-2 py-1 rounded-md text-xs font-medium ${RISK_STATUS_COLORS[risk.status]}`}>
                    {risk.status}
                  </span>
                </td>
                <td className="p-4 align-top text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(risk)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Risk"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(risk.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Risk"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={32} className="opacity-20" />
                    <p>No risks found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-slate-200 text-xs text-slate-400 bg-slate-50 rounded-b-xl flex justify-between">
        <span>Showing {filteredRisks.length} of {risks.length} risks</span>
        <span>SecureRisk ISMS v1.0</span>
      </div>
    </div>
  );
};

export default RiskRegister;