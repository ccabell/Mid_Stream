/**
 * HITL Transformation Tests
 *
 * Tests the transformation functions with various data structures
 * to identify where failures occur.
 */

import { describe, it, expect } from 'vitest';
import { transformExtractionToHITLDraft, normalizeExtractionOutput } from './transformExtraction';
import type { ExtractionOutput } from '../../types';

// Minimal valid V2 format data
const minimalV2Data: ExtractionOutput = {
  prompt_1: {
    parsed_json: {
      extraction_version: '3.0',
      pass: 1,
      visit_context: {
        visit_type: { value: 'initial_consultation', evidence: [] },
        reason_for_visit: { value: 'Botox consultation', evidence: [] },
        referred_by: { value: null },
        motivating_event: { value: null },
      },
      patient_goals: {
        primary_concern: { value: 'Forehead wrinkles', evidence: [] },
        secondary_concerns: { value: ['Crow\'s feet'], evidence: [] },
        goals: { value: ['Look younger'], evidence: [] },
        anticipated_outcomes: { value: ['Smoother skin'], evidence: [] },
      },
      areas: {
        treatment_areas: { value: ['Forehead'] },
        concern_areas: { value: ['Eyes'] },
      },
      interests: {
        stated_interests: { value: [] },
        future_interests: [],
      },
      offerings: [
        {
          name: 'Botox',
          type: 'service',
          disposition: 'performed',
          area: 'Forehead',
          quantity: '20 units',
          value: 300,
        },
      ],
    } as any,
    raw_response: '',
  },
  prompt_2: {
    parsed_json: {
      extraction_version: '3.0',
      pass: 2,
      outcome: {
        status: { value: 'treatment_performed' },
        summary: { value: 'Patient received Botox' },
      },
      next_steps: [],
      patient_signals: {
        intent_score: { value: 80 },
        objections: [],
        hesitations: [],
        concerns: [],
      },
      visit_checklist: [],
    } as any,
    raw_response: '',
  },
};

// Minimal valid legacy format data
const minimalLegacyData: ExtractionOutput = {
  prompt_1: {
    parsed_json: {
      extraction_version: '3.0',
      pass: 1,
      visit_context: {
        visit_type: 'initial_consultation',
        reason_for_visit: 'Botox consultation',
        referred_by: null,
        motivating_event: null,
      },
      patient_goals: {
        primary_concern: 'Forehead wrinkles',
        secondary_concerns: ['Crow\'s feet'],
        goals: ['Look younger'],
        anticipated_outcomes: ['Smoother skin'],
      },
      areas: {
        treatment_areas: ['Forehead'],
        concern_areas: ['Eyes'],
      },
      interests: {
        stated_interests: [],
        future_interests: [],
      },
      offerings: [
        {
          name: 'Botox',
          type: 'service',
          disposition: 'performed',
          area: 'Forehead',
          quantity: '20 units',
          value: 300,
          guidance_discovery: {
            provider_guided: true,
            guidance_type: null,
            patient_reception: 'engaged',
            reception_evidence: null,
            guidance_rationale: null,
          },
        },
      ],
    } as any,
    raw_response: '',
  },
  prompt_2: {
    parsed_json: {
      extraction_version: '3.0',
      pass: 2,
      outcome: {
        status: 'treatment_performed',
        summary: 'Patient received Botox',
      },
      next_steps: [],
      patient_signals: {
        commitment_level: 'committed',
      },
      objections: [],
      hesitations: [],
      concerns: [],
      visit_checklist: [],
    } as any,
    raw_response: '',
  },
};

// Empty/minimal data - edge case
const emptyData: ExtractionOutput = {
  prompt_1: {
    parsed_json: {} as any,
    raw_response: '',
  },
  prompt_2: {
    parsed_json: {} as any,
    raw_response: '',
  },
};

// Partially populated data
const partialData: ExtractionOutput = {
  prompt_1: {
    parsed_json: {
      patient_goals: {
        primary_concern: 'Test concern',
      },
    } as any,
    raw_response: '',
  },
  prompt_2: {
    parsed_json: {
      outcome: {
        status: 'thinking',
      },
    } as any,
    raw_response: '',
  },
};

// Null arrays
const nullArraysData: ExtractionOutput = {
  prompt_1: {
    parsed_json: {
      patient_goals: {
        primary_concern: 'Test',
        secondary_concerns: null,
        goals: null,
        anticipated_outcomes: null,
      },
      offerings: null,
    } as any,
    raw_response: '',
  },
  prompt_2: {
    parsed_json: {
      objections: null,
      hesitations: null,
      concerns: null,
      visit_checklist: null,
    } as any,
    raw_response: '',
  },
};

describe('normalizeExtractionOutput', () => {
  it('should handle V2 format data', () => {
    expect(() => normalizeExtractionOutput(minimalV2Data)).not.toThrow();
  });

  it('should handle legacy format data', () => {
    expect(() => normalizeExtractionOutput(minimalLegacyData)).not.toThrow();
  });

  it('should handle empty data', () => {
    expect(() => normalizeExtractionOutput(emptyData)).not.toThrow();
  });

  it('should handle partial data', () => {
    expect(() => normalizeExtractionOutput(partialData)).not.toThrow();
  });

  it('should handle null arrays', () => {
    expect(() => normalizeExtractionOutput(nullArraysData)).not.toThrow();
  });
});

describe('transformExtractionToHITLDraft', () => {
  it('should transform V2 format data', () => {
    const result = transformExtractionToHITLDraft(minimalV2Data);
    expect(result).toBeDefined();
    expect(result.patientSummary).toBeDefined();
    expect(result.treatments).toBeInstanceOf(Array);
    expect(result.recommendations).toBeInstanceOf(Array);
    expect(result.needsAttention).toBeDefined();
    expect(result.checklist).toBeDefined();
  });

  it('should transform legacy format data', () => {
    const result = transformExtractionToHITLDraft(minimalLegacyData);
    expect(result).toBeDefined();
    expect(result.patientSummary.primaryConcern.value).toBe('Forehead wrinkles');
    expect(result.treatments.length).toBeGreaterThan(0);
  });

  it('should handle empty data without throwing', () => {
    expect(() => transformExtractionToHITLDraft(emptyData)).not.toThrow();
    const result = transformExtractionToHITLDraft(emptyData);
    expect(result.patientSummary.primaryConcern.value).toBe('');
    expect(result.treatments).toEqual([]);
    expect(result.recommendations).toEqual([]);
  });

  it('should handle partial data without throwing', () => {
    expect(() => transformExtractionToHITLDraft(partialData)).not.toThrow();
    const result = transformExtractionToHITLDraft(partialData);
    expect(result.patientSummary.primaryConcern.value).toBe('Test concern');
  });

  it('should handle null arrays without throwing', () => {
    expect(() => transformExtractionToHITLDraft(nullArraysData)).not.toThrow();
    const result = transformExtractionToHITLDraft(nullArraysData);
    expect(result.patientSummary.secondaryConcerns).toEqual([]);
    expect(result.patientSummary.goals).toEqual([]);
    expect(result.treatments).toEqual([]);
  });

  it('should produce valid draft structure', () => {
    const result = transformExtractionToHITLDraft(minimalLegacyData);

    // Check all required fields exist
    expect(result.patientSummary).toHaveProperty('primaryConcern');
    expect(result.patientSummary).toHaveProperty('secondaryConcerns');
    expect(result.patientSummary).toHaveProperty('goals');
    expect(result.patientSummary).toHaveProperty('anticipatedOutcomes');
    expect(result.patientSummary).toHaveProperty('timeline');

    expect(result.needsAttention).toHaveProperty('objections');
    expect(result.needsAttention).toHaveProperty('hesitations');
    expect(result.needsAttention).toHaveProperty('concerns');

    expect(result.checklist).toHaveProperty('items');
    expect(result.checklist).toHaveProperty('completionRate');
    expect(result.checklist).toHaveProperty('criticalItemsComplete');

    expect(result.settings).toHaveProperty('language');
  });
});

// Run a quick self-test if executed directly
if (typeof window === 'undefined') {
  console.log('Running HITL transformation tests...\n');

  const tests = [
    { name: 'V2 format', data: minimalV2Data },
    { name: 'Legacy format', data: minimalLegacyData },
    { name: 'Empty data', data: emptyData },
    { name: 'Partial data', data: partialData },
    { name: 'Null arrays', data: nullArraysData },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = transformExtractionToHITLDraft(test.data);
      if (result && result.patientSummary && result.treatments !== undefined) {
        console.log(`✓ ${test.name}: PASSED`);
        passed++;
      } else {
        console.log(`✗ ${test.name}: FAILED - Invalid result structure`);
        failed++;
      }
    } catch (error) {
      console.log(`✗ ${test.name}: FAILED - ${error}`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}
