import React, { useState } from 'react';
import { Risk, UserRole } from '../types';
import { RISK_LEVEL_COLORS, RISK_STATUS_COLORS } from '../constants';
import { Edit2, Trash2, Search, Filter, Download, ChevronLeft, ChevronRight, ArrowUpDown, Lock } from 'lucide-react';

interface RiskRegisterProps {
  risks: Risk[];
  userRole: UserRole;
  onEdit: (risk: Risk) => void;
  onDelete: (id: string) => void;
}

const ITEMS_PER_PAGE = 10;

const RiskRegister: React.FC<RiskRegisterProps> = ({ risks, userRole, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Risk; direction: 'asc' | 'desc' } | null>(null);

  // Filter Logic
  const filteredRisks = risks.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          r.asset.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = filterLevel === 'All' || r.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  // Sort Logic
  const sortedRisks = React.useMemo(() => {
    let sortableItems = [...filteredRisks];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // @ts-ignore - simplified sorting for this example
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        // @ts-ignore
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredRisks, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedRisks.length / ITEMS_PER_PAGE);
  const currentRisks = sortedRisks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const requestSort = (key: keyof Risk) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // CSV Export Logic
  const handleExport = () => {
    const headers = ["ID", "Asset", "Title", "Threat", "Vulnerability", "Score", "Level", "Status", "Owner", "Treatment Plan"];
    const rows = sortedRisks.map(r => [
      r.id, 
      `"${r.asset.replace(/"/g, '""')}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.threat.replace(/"/g, '""')}"`,
      `"${r.vulnerability.replace(/"/g, '""')}"`,
      r.score,
      r.level,
      r.status,
      `"${r.owner.replace(/"/g, '""')}"`,
      `"${r.treatmentPlan.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `risk_register_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canEdit = userRole === 'Admin' || userRole === 'Analyst';
  const canDelete = userRole === 'Admin';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
      
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 rounded-t-xl">
        <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
                type="text"
                placeholder="Search risks, assets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            </div>
            
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                title="Export to CSV"
            >
                <Download size={18} />
                <span className="hidden sm:inline">Export</span>
            </button>
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
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('asset')}>
                <div className="flex items-center gap-1">ID / Asset <ArrowUpDown size={12} /></div>
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-1/3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('title')}>
                <div className="flex items-center gap-1">Risk Description <ArrowUpDown size={12} /></div>
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('score')}>
                <div className="flex items-center gap-1 justify-center">Score <ArrowUpDown size={12} /></div>
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('level')}>
                <div className="flex items-center gap-1">Level <ArrowUpDown size={12} /></div>
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('status')}>
                <div className="flex items-center gap-1">Status <ArrowUpDown size={12} /></div>
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentRisks.length > 0 ? currentRisks.map((risk) => (
              <tr key={risk.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4 align-top">
                  <div className="font-mono text-xs text-slate-400 mb-1" title={risk.id}>{risk.id.slice(0, 8)}...</div>
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
                  <div className={`inline-block px-3 py-1 rounded-full font-bold text-slate-700 ${risk.score >= 12 ? 'bg-orange-100' : 'bg-slate-100'}`}>
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
                    {canEdit ? (
                      <button
                        onClick={() => onEdit(risk)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Risk"
                      >
                        <Edit2 size={16} />
                      </button>
                    ) : (
                      <div className="p-2 text-slate-300" title="Read Only"><Lock size={16}/></div>
                    )}
                    
                    {canDelete && (
                      <button
                        onClick={() => onDelete(risk.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Risk"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
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

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-between items-center">
        <span className="text-xs text-slate-500">
            Showing {Math.min(filteredRisks.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} to {Math.min(filteredRisks.length, currentPage * ITEMS_PER_PAGE)} of {filteredRisks.length} results
        </span>
        
        {totalPages > 1 && (
            <div className="flex gap-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                <div className="flex items-center px-2 text-sm font-medium text-slate-700">
                    Page {currentPage} of {totalPages}
                </div>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default RiskRegister;