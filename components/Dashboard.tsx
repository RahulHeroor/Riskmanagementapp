import React from 'react';
import { Risk, RiskLevel } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ShieldAlert, ShieldCheck, Shield, TrendingUp } from 'lucide-react';

interface DashboardProps {
  risks: Risk[];
}

const COLORS = {
  Low: '#22c55e', // green-500
  Medium: '#eab308', // yellow-500
  High: '#f97316', // orange-500
  Critical: '#ef4444', // red-500
};

const Dashboard: React.FC<DashboardProps> = ({ risks }) => {
  // Calculate Stats
  const totalRisks = risks.length;
  const criticalRisks = risks.filter(r => r.level === 'Critical').length;
  const highRisks = risks.filter(r => r.level === 'High').length;
  const mitigatedRisks = risks.filter(r => r.status === 'Mitigated').length;

  // Data for Pie Chart
  const levelData = [
    { name: 'Critical', value: criticalRisks, color: COLORS.Critical },
    { name: 'High', value: highRisks, color: COLORS.High },
    { name: 'Medium', value: risks.filter(r => r.level === 'Medium').length, color: COLORS.Medium },
    { name: 'Low', value: risks.filter(r => r.level === 'Low').length, color: COLORS.Low },
  ].filter(d => d.value > 0);

  // Data for Status Chart
  const statusData = Object.entries(
    risks.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Matrix Heatmap Logic
  const getMatrixCount = (impact: number, likelihood: number) => {
    return risks.filter(r => r.impact === impact && r.likelihood === likelihood).length;
  };

  const MatrixCell = ({ i, l }: { i: number, l: number }) => {
    const count = getMatrixCount(i, l);
    const score = i * l;
    let bg = 'bg-green-100';
    if (score >= 20) bg = 'bg-red-400 text-white';
    else if (score >= 12) bg = 'bg-orange-300';
    else if (score >= 5) bg = 'bg-yellow-200';
    else bg = 'bg-green-200';

    return (
      <div className={`w-full h-16 ${bg} border border-white flex items-center justify-center relative group rounded-sm`}>
        {count > 0 && (
          <span className="font-bold text-lg">{count}</span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors cursor-pointer" title={`Impact: ${i}, Likelihood: ${l} (${count} risks)`}></div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Risks</p>
            <h3 className="text-3xl font-bold text-slate-800">{totalRisks}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Shield size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Critical Risks</p>
            <h3 className="text-3xl font-bold text-red-600">{criticalRisks}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-full">
            <ShieldAlert size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Mitigated</p>
            <h3 className="text-3xl font-bold text-green-600">{mitigatedRisks}</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
            <ShieldCheck size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Avg Risk Score</p>
            <h3 className="text-3xl font-bold text-slate-800">
              {totalRisks > 0 ? (risks.reduce((a, b) => a + b.score, 0) / totalRisks).toFixed(1) : 0}
            </h3>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-full">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Matrix */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Risk Heatmap Matrix</h3>
          <div className="flex">
            {/* Y-Axis Label */}
            <div className="flex flex-col justify-center items-center mr-2">
              <span className="text-sm font-semibold text-slate-500 -rotate-90 whitespace-nowrap">Likelihood</span>
            </div>
            
            <div className="flex-1">
              <div className="grid grid-rows-5 gap-1 mb-1">
                {[5, 4, 3, 2, 1].map(l => (
                  <div key={l} className="grid grid-cols-5 gap-1">
                     {[1, 2, 3, 4, 5].map(i => (
                       <MatrixCell key={`${l}-${i}`} l={l} i={i} />
                     ))}
                  </div>
                ))}
              </div>
              {/* X-Axis Label */}
              <div className="text-center mt-2">
                <span className="text-sm font-semibold text-slate-500">Impact</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2 px-8">
            <span>Low (1)</span>
            <span>High (5)</span>
          </div>
        </div>

        {/* Charts Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Risks by Level</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={levelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {levelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs">
              {levelData.map(d => (
                <div key={d.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                  {d.name}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Risks by Status</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;