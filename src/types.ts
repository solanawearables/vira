/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SymptomEntry {
  id: string;
  userId: string;
  timestamp: number;
  symptom: string;
  severity: number; // 1-10
  duration?: number; // hours
  metadata?: {
    temperature?: number;
    heartRate?: number;
    bloodPressure?: string;
    notes?: string;
  };
}

export interface UserSymptomTimeline {
  userId: string;
  entries: SymptomEntry[];
}

export interface DiseaseRisk {
  condition: string;
  probability: number; // 0-1
  confidence: number; // 0-1
  trend: 'rising' | 'falling' | 'stable';
}

export interface Recommendation {
  level: RiskLevel;
  actions: string[];
}

export interface PatternMatch {
  id: string;
  type: 'escalation' | 'cyclic' | 'onset_cluster' | 'delayed_chain';
  description: string;
  severity: number;
  symptoms: string[];
}

export interface HealthState {
  riskLevel: RiskLevel;
  risks: DiseaseRisk[];
  patterns: PatternMatch[];
  recommendation: Recommendation;
  timeline: SymptomEntry[];
}

export interface OutbreakSignal {
  region: string;
  symptoms: string[];
  intensity: number;
  confidence: number;
  timestamp: number;
}
