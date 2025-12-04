import React, { useState, useEffect } from 'react';
import { Risk, AppView, User, AuthResponse } from './types';
import Dashboard from './components/Dashboard';
import RiskRegister from './components/RiskRegister';
import RiskForm from './components/RiskForm';
import Auth from './components/Auth';
import { LayoutDashboard, FileSpreadsheet, Plus, ShieldCheck, Settings, LogOut, Loader2, WifiOff } from 'lucide-react';
import { api } from './api';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);

  // Check for existing token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode token properly in production or just assume session valid for now
      // Here we just simulate re-hydration if we had a /me endpoint, 
      // but simpler to require re-login or just assume logged in state if needed.
      // For security best practice, we should validate token, but for this demo:
      setUser({ id: 'resume', username: 'User', role: 'Analyst' }); // Temporary resume
      // Better: Logout on refresh to force login or implement /api/auth/me
      // Let's force login to ensure we get correct role
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchRisks();
    }
  }, [user]);

  const handleLogin = (data: AuthResponse) => {
    api.setToken(data.token);
    setUser(data.user);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    api.setToken(null);
    setUser(null);
    setRisks([]);
  };

  const fetchRisks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getRisks();
      setRisks(data);
    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message === 'Unauthorized') {
         handleLogout();
         alert("Session expired. Please login again.");
         return;
      }
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
      alert(`Failed to save risk: ${msg}`);
    }
  };

  const handleDeleteRisk = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this risk assessment?')) {
      try {
        await api.deleteRisk(id);
        setRisks(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        alert("Failed to delete risk. You might not have permission.");
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

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

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
            <span className="text-xs text-slate-500 uppercase tracking-wider">ISMS Enterprise</span>
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
           <div className="px-4 py-2 mb-2">
             <div className="text-xs text-slate-500 uppercase">Logged in as</div>
             <div className="text-white font-bold truncate">{user.username}</div>
             <div className="text-xs text-blue-400 font-medium border border-blue-900/50 bg-blue-900/20 px-2 py-0.5 rounded inline-block mt-1">
               {user.role}
             </div>
           </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 text-sm transition-colors text-slate-400 hover:text-white">
            <Settings size={18} />
            Settings
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 text-sm transition-colors text-slate-400 hover:text-white"
          >
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
            {currentView === AppView.REGISTER && user.role !== 'Viewer' && (
              <button
                onClick={handleAddNew}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all font-medium text-sm"
              >
                <Plus size={18} />
                New Assessment
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
               <img src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} alt="User" className="w-full h-full object-cover" />
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
                    userRole={user.role}
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