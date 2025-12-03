import React, { useState, useEffect } from 'react';
import { Risk, AppView } from './types';
import Dashboard from './components/Dashboard';
import RiskRegister from './components/RiskRegister';
import RiskForm from './components/RiskForm';
import { LayoutDashboard, FileSpreadsheet, Plus, ShieldCheck, Settings, LogOut, Loader2, WifiOff } from 'lucide-react';
import { api } from './api';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getRisks();
      setRisks(data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Please ensure "node server.js" is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRisk = async (risk: Risk) => {
    try {
      if (editingRisk) {
        const updated = await api.updateRisk(risk);
        setRisks(prev => prev.map(r => r.id === updated.id ? updated : r));
      } else {
        const created = await api.createRisk(risk);
        setRisks(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
      setEditingRisk(null);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to save risk: ${msg}. Check console for details.`);
    }
  };

  const handleDeleteRisk = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this risk assessment?')) {
      try {
        await api.deleteRisk(id);
        setRisks(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        alert("Failed to delete risk.");
      }
    }
  };

  const handleEditRisk = (risk: Risk) => {
    setEditingRisk(risk);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingRisk(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">SecureRisk</h1>
            <span className="text-xs text-slate-500 uppercase tracking-wider">ISMS Pro</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setCurrentView(AppView.DASHBOARD)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentView === AppView.DASHBOARD 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button
            onClick={() => setCurrentView(AppView.REGISTER)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentView === AppView.REGISTER 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet size={20} />
            <span className="font-medium">Risk Register</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 text-sm transition-colors text-slate-400 hover:text-white">
            <Settings size={18} />
            Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 text-sm transition-colors text-slate-400 hover:text-white">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">
            {currentView === AppView.DASHBOARD ? 'Executive Overview' : 'Risk Management Register'}
          </h2>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all font-medium text-sm"
            >
              <Plus size={18} />
              New Assessment
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
               <img src="https://picsum.photos/100/100" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 relative">
           {error && (
             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
               <WifiOff size={24} />
               <div className="flex-1">
                 <h4 className="font-bold">Connection Error</h4>
                 <p className="text-sm">{error}</p>
               </div>
               <button onClick={fetchRisks} className="px-3 py-1 bg-white border border-red-200 rounded text-sm hover:bg-red-50">Retry</button>
             </div>
           )}

           {isLoading ? (
             <div className="flex flex-col items-center justify-center h-96 text-slate-400">
               <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
               <p>Loading risk data...</p>
             </div>
           ) : (
             <>
               {currentView === AppView.DASHBOARD && (
                 <Dashboard risks={risks} />
               )}
               
               {currentView === AppView.REGISTER && (
                 <RiskRegister 
                    risks={risks} 
                    onEdit={handleEditRisk} 
                    onDelete={handleDeleteRisk}
                  />
               )}
             </>
           )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <RiskForm
          initialData={editingRisk}
          onSave={handleSaveRisk}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingRisk(null);
          }}
        />
      )}
    </div>
  );
};

export default App;