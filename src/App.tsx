/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Stethoscope,
  ShieldAlert,
  Calendar,
  LogOut,
  Moon,
  Sun,
  User,
  Heart,
  Droplets,
  Zap,
  Clock
} from 'lucide-react';
import { SymptomEntry, HealthState, RiskLevel } from './types';
import { analyzeHealthState, SYMPTOM_TAXONOMY } from './services/healthEngine';
import { SYMBOLIC_DATA } from './services/demoData';
import AnalysisView from './components/AnalysisView';
import PopulationView from './components/PopulationView';

// --- Sub-components ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => (
  <div className="w-16 lg:w-20 h-screen border-r border-gray-100 dark:border-white/5 flex flex-col items-center py-6 gap-8 sticky top-0 bg-white/50 dark:bg-black/20 backdrop-blur-sm z-50">
    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
      <div className="w-4 h-4 border-2 border-white rounded-full"></div>
    </div>
    <nav className="flex flex-col gap-4 flex-1">
      <button onClick={() => setActiveTab('dashboard')} className={`sidebar-icon ${activeTab === 'dashboard' ? 'active' : ''}`} title="Dashboard"><LayoutDashboard size={20} /></button>
      <button onClick={() => setActiveTab('analysis')} className={`sidebar-icon ${activeTab === 'analysis' ? 'active' : ''}`} title="Temporal Analysis"><Activity size={20} /></button>
      <button onClick={() => setActiveTab('population')} className={`sidebar-icon ${activeTab === 'population' ? 'active' : ''}`} title="Population Data"><Users size={20} /></button>
      <button onClick={() => setActiveTab('settings')} className={`sidebar-icon ${activeTab === 'settings' ? 'active' : ''}`} title="Settings"><Settings size={20} /></button>
    </nav>
    <button className="sidebar-icon mt-auto"><LogOut size={20} /></button>
  </div>
);

const MetricCard = ({ icon: Icon, label, value, unit, trend, color }: any) => (
  <div className="glass-card p-4 flex flex-col gap-3 border border-gray-100 dark:border-white/5">
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <div className={`text-indigo-600 dark:text-indigo-400 opacity-60`}>
        <Icon size={14} />
      </div>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-xl font-bold tracking-tight">{value}</span>
      <span className="text-[10px] text-gray-400 font-mono">{unit}</span>
    </div>
    {trend && (
      <div className={`text-[10px] font-mono mt-1 ${trend > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% delta
      </div>
    )}
  </div>
);

const RiskMeter = ({ level }: { level: RiskLevel }) => {
  const config = {
    LOW: { color: 'emerald', bg: 'bg-emerald-500', text: 'STABLE', desc: 'Baseline normal.' },
    MEDIUM: { color: 'amber', bg: 'bg-amber-500', text: 'OBSERVATION', desc: 'Monitoring escalation.' },
    HIGH: { color: 'rose', bg: 'bg-rose-500', text: 'HIGH RISK', desc: 'Pattern confirmation.' },
    CRITICAL: { color: 'red', bg: 'bg-red-600', text: 'CRITICAL', desc: 'Rapid progression detected.' },
  }[level];

  return (
    <div className={`p-4 rounded-xl border ${level === 'CRITICAL' ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-gray-50 border-gray-100 dark:bg-white/5 dark:border-white/10'}`}>
      <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${level === 'CRITICAL' ? 'text-red-600' : 'text-gray-400'}`}>Risk Scoring</h3>
      <div className={`text-2xl font-bold leading-none mb-1 ${level === 'CRITICAL' ? 'text-red-700' : 'text-gray-900 dark:text-white'}`}>{config.text}</div>
      <p className={`text-[11px] leading-relaxed ${level === 'CRITICAL' ? 'text-red-600/80' : 'text-gray-500'}`}>{config.desc}</p>
    </div>
  );
};


export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeline, setTimeline] = useState<SymptomEntry[]>(SYMBOLIC_DATA);
  const [healthState, setHealthState] = useState<HealthState | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAddingSymptom, setIsAddingSymptom] = useState(false);

  useEffect(() => {
    setHealthState(analyzeHealthState(timeline));
  }, [timeline]);

  const addSymptom = (symptom: string, severity: number) => {
    const newEntry: SymptomEntry = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'user_james_123',
      timestamp: Date.now(),
      symptom,
      severity
    };
    setTimeline([...timeline, newEntry]);
    setIsAddingSymptom(false);
  };

  if (!healthState) return null;

  return (
    <div className={`${isDarkMode ? 'dark' : ''} selection-indigo`}>
      <div className="flex h-screen bg-[#FBFBFB] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-[#F3F4F6] font-sans overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-8 bg-white/50 dark:bg-black/20 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold tracking-tight uppercase">Vira <span className="text-indigo-600 font-medium text-[10px] ml-1 tracking-widest">v.0.4.2-STABLE</span></span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold tracking-wider uppercase border border-emerald-100 dark:border-emerald-900/30">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Live Inference Engine Active
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <div className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase px-2 py-1 bg-gray-50 dark:bg-white/5 rounded border border-gray-100 dark:border-white/10">UID: 8842-X-99 ALPHA</div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                  {/* Left Rail: Timeline (from design) */}
                  <section className="lg:col-span-3 border-r border-gray-100 dark:border-white/5 pr-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Symptom Timeline</h2>
                      <span className="text-[10px] font-mono text-gray-400">n={timeline.length}</span>
                    </div>
                    <div className="relative flex-1">
                      <div className="v-line left-[11px] top-4 bottom-4"></div>
                      <div className="space-y-8 relative">
                        {timeline.slice(-4).reverse().map((entry, idx) => (
                          <div key={entry.id} className="flex items-start gap-4" style={{ opacity: 1 - idx * 0.2 }}>
                            <div className="w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 flex items-center justify-center z-10 shrink-0 mt-1">
                              <div className={`w-2 h-2 rounded-full ${entry.severity > 7 ? 'bg-red-500' : entry.severity > 4 ? 'bg-amber-500' : 'bg-indigo-400'}`}></div>
                            </div>
                            <div>
                              <div className="text-[10px] text-gray-400 font-mono">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              <div className="text-sm font-semibold">{entry.symptom}</div>
                              <div className="text-[10px] text-gray-500">Sev: {entry.severity}/10</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setIsAddingSymptom(true)} className="w-full py-3 border border-dashed border-gray-200 dark:border-white/10 rounded-lg text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                      + Add Input
                    </button>
                  </section>

                  {/* Center: Mapping */}
                  <section className="lg:col-span-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-light tracking-tight">State Mapping</h2>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Vector Visualization</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 glass-card p-6 min-h-[400px] flex items-center justify-center relative overflow-hidden bg-white/40 dark:bg-black/20">
                      <div className="relative w-full h-full flex items-center justify-center opacity-70">
                         {/* Symbolic Body Visual mapped to the minimalist aesthetic */}
                         <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
                         <img 
                          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop" 
                          alt="Human Body" 
                          className="h-full object-contain grayscale opacity-30 mix-blend-multiply dark:mix-blend-lighten"
                        />
                        {timeline.slice(-3).map((entry, i) => (
                          <motion.div
                            key={entry.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute w-10 h-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-full flex flex-col items-center justify-center z-10 shadow-sm"
                            style={{ 
                              top: `${20 + i * 20}%`, 
                              left: `${40 + (i % 2 === 0 ? 15 : -15)}%` 
                            }}
                          >
                            <div className={`w-2 h-2 rounded-full absolute -top-1 -right-1 ${entry.severity > 7 ? 'bg-red-500' : 'bg-indigo-500'} animate-pulse`}></div>
                            <span className="text-[10px] font-mono font-bold">{entry.symptom.substring(0, 3).toUpperCase()}</span>
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="absolute bottom-4 right-4 flex gap-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Acute</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Vector</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <MetricCard icon={Heart} label="Heart Rate" value="72" unit="bpm" trend={1.2} />
                      <MetricCard icon={Droplets} label="Blood Pressure" value="120/80" unit="mmHg" />
                      <MetricCard icon={Activity} label="SpO2" value="98" unit="%" trend={-0.5} />
                      <MetricCard icon={TrendingUp} label="Resp Rate" value="14" unit="bpm" />
                    </div>
                  </section>

                  {/* Right Rail: Inference */}
                  <section className="lg:col-span-3 border-l border-gray-100 dark:border-white/5 pl-8 flex flex-col gap-8 bg-gray-50/20 dark:bg-white/5 p-6 rounded-2xl">
                    <div>
                      <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Inference Vector</h2>
                      <div className="space-y-6">
                        {healthState.risks.map((risk, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                              <span className="text-gray-500">{risk.condition}</span>
                              <span className="font-mono">{(risk.probability * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-1 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${risk.probability * 100}%` }}
                                className={`h-full ${risk.probability > 0.5 ? 'bg-red-500' : 'bg-indigo-500'}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <RiskMeter level={healthState.riskLevel} />

                    <div className="space-y-4">
                      <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Protocol Actions</h2>
                      <div className="space-y-2">
                        <button 
                          onClick={() => setActiveTab('analysis')}
                          className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest flex items-center justify-between group hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          <span>Generate Clinical Report</span>
                          <ArrowRight size={14} />
                        </button>
                        <button className="w-full py-3 px-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-[11px] font-bold uppercase tracking-widest flex items-center justify-between">
                          <span>Patient Dashboard</span>
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        </button>
                      </div>
                    </div>

                    <div className="mt-auto py-4 border-t border-gray-100 dark:border-white/5">
                      <p className="text-[9px] text-gray-400 font-medium italic leading-tight text-center">
                        Static probabilistic model. Not a clinical diagnosis. Output generated via inference engine-0.4.
                      </p>
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'analysis' && <AnalysisView state={healthState} />}
              {activeTab === 'population' && <PopulationView />}
            </AnimatePresence>
          </main>

          {/* Footer: Design pattern from HTML */}
          <footer className="h-12 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex items-center px-8 gap-12 shrink-0 overflow-x-auto whitespace-nowrap scrollbar-hide">
             <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">Population Cluster:</span>
              <div className="flex items-center gap-1.5">
                <div className="px-2 py-0.5 bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded text-[9px] font-mono">Cluster ID: NY-442</div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Symptom Spike (+14% Avg)</div>
              </div>
            </div>
            <div className="h-4 w-px bg-gray-200 dark:bg-white/10"></div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">System Integrity:</span>
              <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">HASH: 0x82f...a12 (VERIFIED)</span>
            </div>
            <div className="ml-auto flex gap-4 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              <span className="hover:text-indigo-600 cursor-pointer">Architecture</span>
              <span className="hover:text-indigo-600 cursor-pointer">Privacy</span>
            </div>
          </footer>
        </div>
      </div>

        {/* Modal: Add Symptom */}
        <AnimatePresence>
          {isAddingSymptom && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddingSymptom(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md glass-card p-8 flex flex-col gap-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Log Symptom</h2>
                  <button onClick={() => setIsAddingSymptom(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Select Symptom</label>
                    <select 
                      id="symptom-select"
                      className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-accent/20"
                    >
                      {SYMPTOM_TAXONOMY.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Severity (1-10)</label>
                    <input 
                      id="severity-input"
                      type="range" 
                      min="1" 
                      max="10" 
                      defaultValue="5"
                      className="w-full accent-brand-accent"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>MILD</span>
                      <span>MODERATE</span>
                      <span>SEVERE</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      const s = (document.getElementById('symptom-select') as HTMLSelectElement).value;
                      const v = parseInt((document.getElementById('severity-input') as HTMLInputElement).value);
                      addSymptom(s, v);
                    }}
                    className="w-full py-4 bg-brand-accent text-white rounded-xl font-bold mt-4 shadow-lg shadow-brand-accent/20"
                  >
                    Confirm & Update Timeline
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }
