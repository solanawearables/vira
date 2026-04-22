/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { MapPin, ShieldAlert, Users } from 'lucide-react';
import { MOCK_POPULATION_DATA } from '../services/demoData';

export default function PopulationView() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-light tracking-tight">Population Intelligence</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Global anonymized symptom vector detection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
        {/* Map Placeholder */}
        <div className="lg:col-span-8 glass-card bg-white dark:bg-black/20 overflow-hidden relative border border-gray-100 dark:border-white/5">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#e5e7eb_1.5px,transparent:1.5px)] [background-size:24px_24px] dark:bg-[radial-gradient(#1f2937_1.5px,transparent:1.5px)]" />
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-full h-full">
               {/* Pulse Points */}
               {MOCK_POPULATION_DATA.map((point, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="absolute group pointer-events-auto"
                   style={{ top: `${25 + i * 20}%`, left: `${30 + i * 25}%` }}
                 >
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center relative cursor-pointer border
                     ${point.intensity > 0.7 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-indigo-600/10 border-indigo-600/20 text-indigo-600'}`}
                   >
                     <MapPin size={20} />
                     <div className={`absolute inset-0 rounded-full animate-ping opacity-20
                       ${point.intensity > 0.7 ? 'bg-red-500' : 'bg-indigo-600'}`} 
                     />
                     
                     <div className="hidden group-hover:block absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-4 glass-card border border-gray-200 dark:border-white/10 z-20 min-w-[180px]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{point.region}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {point.symptoms.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-[8px] font-mono font-bold uppercase tracking-tighter">{s}</span>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-white/5">
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Vector Score</span>
                          <span className={`text-[10px] font-mono font-bold ${point.intensity > 0.7 ? 'text-red-500' : 'text-indigo-600'}`}>
                            {(point.intensity * 100).toFixed(1)}%
                          </span>
                        </div>
                     </div>
                   </div>
                 </motion.div>
               ))}
            </div>
          </div>

          <div className="absolute bottom-6 left-6 p-4 glass-card bg-white/80 dark:bg-black/60 border-gray-100 dark:border-white/10">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">Signal Legend</h4>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span className="text-[9px] font-bold uppercase tracking-tight text-gray-500">Anomaly Target</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                <span className="text-[9px] font-bold uppercase tracking-tight text-gray-500">Escalation Signal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-8 flex flex-col gap-8 flex-1 bg-white/40 dark:bg-black/20">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Network Insights</h3>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-gray-400">Network Anomaly</span>
                  <span className="text-red-600">ALERT (72%)</span>
                </div>
                <div className="w-full h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[72%]" />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h5 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Cluster Signals</h5>
                <div className="space-y-3">
                  {MOCK_POPULATION_DATA.map((signal, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/40 dark:bg-black/40 border border-gray-100 dark:border-white/10 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <ShieldAlert size={14} className={signal.intensity > 0.7 ? 'text-red-500' : 'text-indigo-600'} />
                          <span className="text-[10px] font-bold uppercase tracking-tight">{signal.region}</span>
                        </div>
                        <span className="text-[9px] font-mono text-gray-400">T-2.1h</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium leading-tight">Increased variance of <span className="text-indigo-600 font-bold">{signal.symptoms.join(' & ')}</span> detected in locale.</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto py-4 border-t border-gray-100 dark:border-white/5 flex items-center gap-4">
              <div className="p-2.5 bg-indigo-600/10 text-indigo-600 rounded-lg">
                <Users size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-tight">Active Nodes</p>
                <p className="text-[9px] font-mono text-gray-400">12,402 IDENTITIES PROTECTED</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
