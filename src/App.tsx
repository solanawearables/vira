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
import { useAuth } from './components/AuthProvider.tsx';
import { db } from './lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { SymptomEntry, HealthState, RiskLevel } from './types';
import { analyzeHealthState, SYMPTOM_TAXONOMY } from './services/healthEngine';
import AnalysisView from './components/AnalysisView';
import PopulationView from './components/PopulationView';
import SettingsView from './components/SettingsView';

// --- Sub-components ---

const Sidebar = ({ activeTab, setActiveTab, onLogout }: { activeTab: string, setActiveTab: (t: string) => void, onLogout: () => void }) => (
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
    <button onClick={onLogout} className="sidebar-icon mt-auto" title="Sign Out"><LogOut size={20} /></button>
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
  const { user, loading, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeline, setTimeline] = useState<SymptomEntry[]>([]);
  const [healthState, setHealthState] = useState<HealthState | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAddingSymptom, setIsAddingSymptom] = useState(false);
  const [userProfile, setUserProfile] = useState({
    heartRate: 72,
    bloodPressure: '120/80',
    spo2: 98,
    respRate: 14
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync Profile
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setUserProfile(snap.data() as any);
      }
    });
    return unsubscribe;
  }, [user]);

  // Sync with Firestore
  useEffect(() => {
    if (!user) {
      setTimeline([]);
      return;
    }

    const q = query(
      collection(db, 'symptoms'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SymptomEntry[];
      
      setTimeline(data.sort((a, b) => a.timestamp - b.timestamp));
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    setHealthState(analyzeHealthState(timeline));
  }, [timeline]);

  const addSymptom = async (symptom: string, severity: number) => {
    const timestamp = Date.now();
    const newEntry = {
      userId: user?.uid || 'anonymous',
      timestamp,
      symptom,
      severity,
      createdAt: serverTimestamp()
    };

    if (user) {
      try {
        await addDoc(collection(db, 'symptoms'), newEntry);
      } catch (e) {
        console.error("Error adding symptom", e);
      }
    } else {
      // Local only for anonymous
      setTimeline([...timeline, { id: Math.random().toString(), ...newEntry } as any]);
    }
    
    setIsAddingSymptom(false);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#FBFBFB] dark:bg-[#0A0A0A]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center"
        >
          <div className="w-6 h-6 border-2 border-white rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  if (!user && activeTab !== 'dashboard') {
    // Optionally force login for specific tabs
  }

  const handleLogout = async () => {
    await logout();
    setActiveTab('dashboard');
  };

  return (
    <div className={`h-screen w-full ${isDarkMode ? 'dark' : ''} selection-indigo flex flex-col`}>
      <div className="flex flex-1 h-full bg-[#FBFBFB] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-[#F3F4F6] font-sans overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Background Grid Accent */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-20"></div>

          {/* Header */}
          <header className="h-16 border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-8 bg-white/50 dark:bg-black/20 backdrop-blur-md shrink-0 z-40 relative">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold tracking-tight uppercase">Vira <span className="text-indigo-600 font-medium text-[10px] ml-1 tracking-widest">v.0.4.2-STABLE</span></span>
            </div>
            <div className="flex items-center gap-6">
              {!user ? (
                <button 
                  onClick={login}
                  className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-sm hover:bg-indigo-700 transition-all"
                >
                  <User size={14} />
                  Connect Account
                </button>
              ) : (
                <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-colors ${timeline.length > 0 ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' : 'bg-gray-50 dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${timeline.length > 0 ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                  {timeline.length > 0 ? 'Inference Active' : 'Engine Ready'}
                </div>
              )}
              <div className="flex items-center gap-4">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-gray-400 hover:text-indigo-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <div className="flex items-center gap-2 pl-4 border-l border-gray-100 dark:border-white/10">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[100px]">
                      {user ? user.displayName || 'Authenticated' : 'Guest Identity'}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono tracking-tighter">
                      {user ? `UID: ${user.uid.substring(0, 8)}` : 'GUEST MODE'}
                    </span>
                  </div>
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-400 border border-gray-200 dark:border-white/10">
                      <User size={16} />
                    </div>
                  )}
                </div>
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
                      <div className="relative w-full h-full flex items-center justify-center">
                         {/* Technical Coordinate Grid */}
                         <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] [background-size:40px_40px] opacity-20"></div>
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4F46E505,transparent_70%)]"></div>
                         
                         {timeline.length > 0 ? (
                           timeline.slice(-5).map((entry, i) => (
                            <motion.div
                              key={entry.id || i}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute w-12 h-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-full flex flex-col items-center justify-center z-10 shadow-lg"
                              style={{ 
                                top: `${30 + (Math.sin(i * 1.5) * 25)}%`, 
                                left: `${50 + (Math.cos(i * 1.5) * 35)}%` 
                              }}
                            >
                              <div className={`w-2 h-2 rounded-full absolute -top-1 -right-1 ${entry.severity > 7 ? 'bg-red-500' : 'bg-indigo-500'} animate-pulse shadow-sm`}></div>
                              <span className="text-[10px] font-mono font-bold tracking-tighter">{entry.symptom.substring(0, 3).toUpperCase()}</span>
                              <span className="text-[8px] text-gray-400 font-mono">S{entry.severity}</span>
                            </motion.div>
                          ))
                         ) : (
                           <div className="flex flex-col items-center gap-4 opacity-30">
                             <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 dark:border-white/10 flex items-center justify-center">
                               <Activity size={40} className="text-gray-400" />
                             </div>
                             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Neutral State: Waiting for input</p>
                           </div>
                         )}
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
                      <MetricCard icon={Heart} label="Heart Rate" value={userProfile.heartRate} unit="bpm" trend={1.2} />
                      <MetricCard icon={Droplets} label="Blood Pressure" value={userProfile.bloodPressure} unit="mmHg" />
                      <MetricCard icon={Activity} label="SpO2" value={userProfile.spo2} unit="%" trend={-0.5} />
                      <MetricCard icon={TrendingUp} label="Resp Rate" value={userProfile.respRate} unit="bpm" />
                    </div>
                  </section>

                  {/* Right Rail: Inference */}
                  <section className="lg:col-span-3 border-l border-gray-100 dark:border-white/5 pl-8 flex flex-col gap-8 bg-gray-50/20 dark:bg-white/5 p-6 rounded-2xl">
                    <div>
                      <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Inference Vector</h2>
                      <div className="space-y-6">
                        {healthState?.risks.map((risk, index) => (
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
                        {(!healthState || healthState.timeline.length === 0) && (
                          <div className="py-8 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-xl flex items-center justify-center">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Awaiting Input Data</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {healthState && <RiskMeter level={healthState.riskLevel} />}

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

              {activeTab === 'analysis' && healthState && <AnalysisView state={healthState} isDarkMode={isDarkMode} />}
              {activeTab === 'analysis' && !healthState && (
                <div className="flex-1 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  Initializing Engine...
                </div>
              )}
              {activeTab === 'population' && <PopulationView isDarkMode={isDarkMode} />}
              {activeTab === 'settings' && user && <SettingsView user={user} />}
              {activeTab === 'settings' && !user && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Authentication Required</p>
                  <button onClick={login} className="px-6 py-3 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">Connect Account</button>
                </div>
              )}
            </AnimatePresence>
          </main>

          {/* Footer: Design pattern from HTML */}
          <footer className="h-12 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex items-center px-8 gap-12 shrink-0 overflow-x-auto whitespace-nowrap scrollbar-hide">
             <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">Active Status:</span>
              <div className="flex items-center gap-1.5">
                <div className="px-2 py-0.5 bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded text-[9px] font-mono">NODE IDENTIFIED</div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Real-time Telemetry Active</div>
              </div>
            </div>
            <div className="h-4 w-px bg-gray-200 dark:bg-white/10"></div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">System Integrity:</span>
              <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">ENCRYPTED END-TO-END</span>
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
                className="relative w-full max-w-md glass-card p-8 flex flex-col gap-6 bg-white dark:bg-[#0F0F0F]"
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
                      className="w-full p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-600/20"
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
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold mt-4 shadow-lg shadow-indigo-600/20"
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
