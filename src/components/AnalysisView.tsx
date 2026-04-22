/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { HealthState } from '../types';
import { Clock, TrendingUp, AlertCircle, FileText, ArrowRight, Activity } from 'lucide-react';

export default function AnalysisView({ state, isDarkMode }: { state: HealthState, isDarkMode: boolean }) {
  const downloadReport = () => {
    const report = {
      title: "Vira Health Intelligence - Clinical Summary",
      timestamp: new Date().toISOString(),
      patientId: "VRA-2024-X9",
      findings: {
        riskLevel: state.riskLevel,
        likelihoods: state.risks.map(r => ({ condition: r.condition, prob: (r.probability * 100).toFixed(1) + '%' })),
        patterns: state.patterns.map(p => p.description)
      },
      timeline: state.timeline
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VRA_Report_${Date.now()}.json`;
    a.click();
  };

  const chartData = state.timeline.map((entry) => ({
    time: new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    severity: entry.severity,
    symptom: entry.symptom
  }));

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-light tracking-tight">Temporal Analysis</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Deep-dive into causality & progression signatures</p>
        </div>
        <button 
          onClick={downloadReport}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-[11px] uppercase tracking-widest shadow-sm hover:bg-indigo-700 transition-all"
        >
          <FileText size={16} />
          Generate Physician Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col gap-2 bg-white/40 border-gray-100 dark:border-white/5 shadow-none">
          <div className="flex items-center gap-2 text-indigo-600">
            <Clock size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">Density</span>
          </div>
          <span className="text-3xl font-bold tracking-tighter">{state.timeline.length} Events</span>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Recorded over 48h</p>
        </div>
        <div className="glass-card p-6 flex flex-col gap-2 bg-white/40 border-gray-100 dark:border-white/5 shadow-none">
          <div className="flex items-center gap-2 text-red-500">
            <TrendingUp size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">Velocity</span>
          </div>
          <span className="text-3xl font-bold tracking-tighter">Medium</span>
          <p className="text-[10px] text-gray-400 font-bold uppercase">+2.5 Point escalation</p>
        </div>
        <div className="glass-card p-6 flex flex-col gap-2 bg-white/40 border-gray-100 dark:border-white/5 shadow-none">
          <div className="flex items-center gap-2 text-emerald-500">
            <AlertCircle size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Clarity</span>
          </div>
          <span className="text-3xl font-bold tracking-tighter">85%</span>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Pattern confidence</p>
        </div>
      </div>

      <div className="glass-card p-8 flex flex-col gap-6 bg-white/60 dark:bg-black/20 shadow-none">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Severity Timeline Vector</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1F2937' : '#E5E7EB'} />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(229, 231, 235, 0.5)',
                  backgroundColor: isDarkMode ? '#111827' : '#FFFFFF',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase' 
                }}
                itemStyle={{ color: '#4F46E5' }}
              />
              <Area 
                type="monotone" 
                dataKey="severity" 
                stroke="#4F46E5" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSev)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 flex flex-col gap-6 bg-white/40 dark:bg-black/20">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">System Trace</h3>
          <div className="flex-1 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-xl flex flex-col items-center justify-center p-8 gap-4 opacity-50">
            <Activity size={32} className="text-gray-300" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">
              Compiling Causal Relationship Matrix...
            </p>
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col gap-6 bg-white/40 dark:bg-black/20">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Protocol Recommendations</h3>
          <div className="flex flex-col gap-3">
            {state.recommendation.actions.map((action, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <div className="w-5 h-5 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                  <span className="text-[9px] font-mono font-bold">{i + 1}</span>
                </div>
                <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
