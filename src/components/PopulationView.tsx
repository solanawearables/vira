/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { MapPin, ShieldAlert, Users, Radar } from 'lucide-react';

export default function PopulationView({ isDarkMode }: { isDarkMode: boolean }) {
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
            <div className="relative w-full h-full flex flex-col items-center justify-center gap-6">
               <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="text-indigo-600/20"
               >
                <Radar size={120} strokeWidth={1} />
               </motion.div>
               <div className="flex flex-col items-center gap-1 z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Scanning for Anomalies</p>
                <p className="text-[9px] font-mono text-gray-300">Establishing secure uplink to population vector network...</p>
               </div>
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
                <div className="flex-1 border border-dashed border-gray-100 dark:border-white/10 rounded-xl flex flex-col items-center justify-center p-8 gap-3 opacity-40">
                  <ShieldAlert size={24} className="text-gray-300" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 text-center">No unauthorized anomalies detected</p>
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
