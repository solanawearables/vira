/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, User, Heart, Droplets, Activity, TrendingUp, Shield } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface UserProfile {
  displayName: string;
  bio: string;
  heartRate: number;
  bloodPressure: string;
  spo2: number;
  respRate: number;
}

export default function SettingsView({ user }: { user: FirebaseUser }) {
  const [profile, setProfile] = useState<UserProfile>({
    displayName: user.displayName || '',
    bio: '',
    heartRate: 72,
    bloodPressure: '120/80',
    spo2: 98,
    respRate: 14
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...profile,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error updating profile", error);
      setMessage('Failed to update profile');
    }
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-light tracking-tight">Identity & Baselines</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Manage your health profile and biometric baselines</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Info */}
        <div className="glass-card p-8 flex flex-col gap-6 bg-white/40 dark:bg-black/20">
          <div className="flex items-center gap-3 text-indigo-600">
            <User size={18} />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Clinical Identity</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Public Name</label>
              <input 
                type="text" 
                value={profile.displayName}
                onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                className="w-full p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-600/20 text-sm"
                placeholder="How should the engine refer to you?"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Health Bio</label>
              <textarea 
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                rows={3}
                className="w-full p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-600/20 text-sm"
                placeholder="Chronic conditions, allergies, or general context..."
              />
            </div>
          </div>
        </div>

        {/* Biometrics */}
        <div className="glass-card p-8 flex flex-col gap-6 bg-white/40 dark:bg-black/20">
          <div className="flex items-center gap-3 text-indigo-600">
            <Shield size={18} />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Baseline Metrics</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Heart Rate (bpm)</label>
              <div className="relative">
                <Heart size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="number" 
                  value={profile.heartRate}
                  onChange={(e) => setProfile({...profile, heartRate: parseInt(e.target.value)})}
                  className="w-full p-4 pl-10 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-600/20 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Blood Pressure</label>
              <div className="relative">
                <Droplets size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={profile.bloodPressure}
                  onChange={(e) => setProfile({...profile, bloodPressure: e.target.value})}
                  className="w-full p-4 pl-10 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-600/20 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">SpO2 (%)</label>
              <div className="relative">
                <Activity size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="number" 
                  value={profile.spo2}
                  onChange={(e) => setProfile({...profile, spo2: parseInt(e.target.value)})}
                  className="w-full p-4 pl-10 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-600/20 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Resp Rate</label>
              <div className="relative">
                <TrendingUp size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="number" 
                  value={profile.respRate}
                  onChange={(e) => setProfile({...profile, respRate: parseInt(e.target.value)})}
                  className="w-full p-4 pl-10 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-600/20 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        {message && (
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest"
          >
            {message}
          </motion.span>
        )}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="ml-auto flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? 'Syncing...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
