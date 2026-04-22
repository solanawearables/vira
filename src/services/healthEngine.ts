/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SymptomEntry, UserSymptomTimeline, DiseaseRisk, PatternMatch, RiskLevel, Recommendation, HealthState } from '../types';

// Mock Taxonomy of Symptoms
export const SYMPTOM_TAXONOMY = [
  'Fever', 'Dry Cough', 'Fatigue', 'Sore Throat', 'Headache', 
  'Shortness of Breath', 'Loss of Taste/Smell', 'Congestion',
  'Body Ache', 'Chills', 'Nausea', 'Dizziness'
];

/**
 * 2.2 Temporal Symptom Engine
 */
export function sortTimeline(entries: SymptomEntry[]): SymptomEntry[] {
  return [...entries].sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * 2.4/2.5 Simplified Probabilistic Inference & Pattern Detection
 * In a real system, this would be a more complex Bayesian network or ML model.
 */
export function analyzeHealthState(timeline: SymptomEntry[]): HealthState {
  const sorted = sortTimeline(timeline);
  
  // Detect patterns
  const patterns: PatternMatch[] = [];
  
  // Escalation detection
  if (sorted.length >= 3) {
    const lastThree = sorted.slice(-3);
    if (lastThree[2].severity > lastThree[0].severity) {
      patterns.push({
        id: 'p1',
        type: 'escalation',
        description: 'Symptom severity is showing an upward trend over the last 24-48 hours.',
        severity: 0.8,
        symptoms: lastThree.map(e => e.symptom)
      });
    }
  }

  // Cluster detection (many symptoms in short time)
  if (sorted.length >= 2) {
    const lastEntry = sorted[sorted.length - 1];
    const prevEntry = sorted[sorted.length - 2];
    const timeDiff = (lastEntry.timestamp - prevEntry.timestamp) / (1000 * 60 * 60); // hours
    if (timeDiff < 4) {
      patterns.push({
        id: 'p2',
        type: 'onset_cluster',
        description: 'Multiple symptoms appeared in rapid succession.',
        severity: 0.6,
        symptoms: [prevEntry.symptom, lastEntry.symptom]
      });
    }
  }

  // Simple Bayesian-style inference (Mapping symptoms to placeholders)
  const risks: DiseaseRisk[] = [
    { condition: 'Respiratory Infection', probability: 0.15, confidence: 0.8, trend: 'stable' },
    { condition: 'Viral Syndrome', probability: 0.05, confidence: 0.7, trend: 'stable' },
    { condition: 'Seasonal Allergy', probability: 0.02, confidence: 0.9, trend: 'stable' }
  ];

  // Adjust risks based on symptoms
  const symptoms = new Set(sorted.map(e => e.symptom));
  if (symptoms.has('Fever') && symptoms.has('Dry Cough')) {
    risks[0].probability = 0.65;
    risks[0].trend = 'rising';
  }
  if (symptoms.has('Fatigue') && symptoms.has('Body Ache')) {
    risks[1].probability = 0.45;
  }
  
  // Normalize (simplified)
  const total = risks.reduce((acc, r) => acc + r.probability, 0);
  risks.forEach(r => r.probability = r.probability / (total + 0.1));

  // Risk Scoring
  const maxProb = Math.max(...risks.map(r => r.probability));
  let riskLevel: RiskLevel = 'LOW';
  if (maxProb > 0.6 || patterns.some(p => p.severity > 0.7)) riskLevel = 'CRITICAL';
  else if (maxProb > 0.4) riskLevel = 'HIGH';
  else if (maxProb > 0.2) riskLevel = 'MEDIUM';

  // Recommendations
  const actions: string[] = [];
  if (riskLevel === 'CRITICAL') {
    actions.push('Contact a medical professional immediately', 'Monitor blood oxygen levels', 'Isolate from others');
  } else if (riskLevel === 'HIGH') {
    actions.push('Schedule a telehealth consultation', 'Rest and increase hydration', 'Monitor temperature every 4 hours');
  } else if (riskLevel === 'MEDIUM') {
    actions.push('Track symptoms twice daily', 'Over-the-counter support if needed', 'Light activity only');
  } else {
    actions.push('Continue tracking normally', 'Maintain healthy habits');
  }

  return {
    riskLevel,
    risks,
    patterns,
    recommendation: { level: riskLevel, actions },
    timeline: sorted
  };
}

/**
 * 2.11 Doctor Report Generator
 */
export function generateDoctorReport(state: HealthState) {
  return JSON.stringify(state, null, 2);
}
