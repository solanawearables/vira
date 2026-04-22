/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SymptomEntry } from '../types';

const MOCK_USER_ID = 'user_james_123';

export const SYMBOLIC_DATA: SymptomEntry[] = [
  {
    id: '1',
    userId: MOCK_USER_ID,
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 48h ago
    symptom: 'Fatigue',
    severity: 3,
    metadata: {
      notes: 'Woke up feeling slightly sluggish'
    }
  },
  {
    id: '2',
    userId: MOCK_USER_ID,
    timestamp: Date.now() - 1000 * 60 * 60 * 36, // 36h ago
    symptom: 'Dry Cough',
    severity: 2,
  },
  {
    id: '3',
    userId: MOCK_USER_ID,
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 24h ago
    symptom: 'Headache',
    severity: 5,
    metadata: {
      temperature: 37.2
    }
  },
  {
    id: '4',
    userId: MOCK_USER_ID,
    timestamp: Date.now() - 1000 * 60 * 60 * 12, // 12h ago
    symptom: 'Fever',
    severity: 7,
    metadata: {
      temperature: 38.5
    }
  },
  {
    id: '5',
    userId: MOCK_USER_ID,
    timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4h ago
    symptom: 'Shortness of Breath',
    severity: 4,
  }
];

export const MOCK_POPULATION_DATA = [
  { region: 'Downtown', intensity: 0.8, symptoms: ['Cough', 'Fever'] },
  { region: 'Westside', intensity: 0.3, symptoms: ['Headache'] },
  { region: 'Eastside', intensity: 0.5, symptoms: ['Fatigue', 'Fever'] },
];
