/**
 * HITL Transformation Test Script
 *
 * Run with: npx tsx scripts/test-hitl.ts
 */

import { transformExtractionToHITLDraft, normalizeExtractionOutput } from '../src/agents/hitl/utils/transformExtraction';
import type { ExtractionOutput } from '../src/agents/types';

console.log('='.repeat(60));
console.log('HITL TRANSFORMATION TEST SUITE');
console.log('='.repeat(60));
console.log('');

// Test data sets
const testCases: { name: string; data: ExtractionOutput }[] = [
  {
    name: 'V2 Format (FieldWithEvidence)',
    data: {
      prompt_1: {
        parsed_json: {
          extraction_version: '3.0',
          pass: 1,
          visit_context: {
            visit_type: { value: 'initial_consultation', evidence: [] },
            reason_for_visit: { value: 'Botox consultation', evidence: [] },
            referred_by: { value: null },
            motivating_event: { value: 'Wedding in 3 months' },
          },
          patient_goals: {
            primary_concern: { value: 'Forehead wrinkles', evidence: [] },
            secondary_concerns: { value: ["Crow's feet", 'Frown lines'], evidence: [] },
            goals: { value: ['Look younger', 'Feel confident'], evidence: [] },
            anticipated_outcomes: { value: ['Smoother skin'], evidence: [] },
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
          patient_signals: {
            intent_score: { value: 80 },
            objections: [],
            hesitations: [],
            concerns: [],
          },
          visit_checklist: [
            { item_label: 'Consent obtained', completed: true },
          ],
        } as any,
        raw_response: '',
      },
    },
  },
  {
    name: 'Legacy Format (Direct Values)',
    data: {
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
            secondary_concerns: ["Crow's feet"],
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
          visit_checklist: [
            {
              item_id: 'consent',
              item_label: 'Consent obtained',
              category: 'safety',
              completed: true,
              critical: true,
              evidence: null,
            },
          ],
        } as any,
        raw_response: '',
      },
    },
  },
  {
    name: 'Empty Data',
    data: {
      prompt_1: { parsed_json: {} as any, raw_response: '' },
      prompt_2: { parsed_json: {} as any, raw_response: '' },
    },
  },
  {
    name: 'Null/Undefined Arrays',
    data: {
      prompt_1: {
        parsed_json: {
          patient_goals: {
            primary_concern: 'Test',
            secondary_concerns: null,
            goals: undefined,
            anticipated_outcomes: null,
          },
          offerings: null,
        } as any,
        raw_response: '',
      },
      prompt_2: {
        parsed_json: {
          objections: null,
          hesitations: undefined,
          concerns: null,
          visit_checklist: null,
        } as any,
        raw_response: '',
      },
    },
  },
  {
    name: 'Missing nested objects',
    data: {
      prompt_1: {
        parsed_json: {
          // No patient_goals at all
          // No visit_context at all
          // No offerings at all
        } as any,
        raw_response: '',
      },
      prompt_2: {
        parsed_json: {
          // No objections/hesitations/concerns
          // No visit_checklist
        } as any,
        raw_response: '',
      },
    },
  },
  {
    name: 'Mixed V2 and Legacy',
    data: {
      prompt_1: {
        parsed_json: {
          patient_goals: {
            primary_concern: { value: 'V2 format concern' }, // V2
            secondary_concerns: ['Legacy array item'], // Legacy
            goals: { value: ['V2 goal'] }, // V2
          },
          offerings: [
            { name: 'Service', type: 'service', disposition: 'discussed' },
          ],
        } as any,
        raw_response: '',
      },
      prompt_2: {
        parsed_json: {
          patient_signals: {
            objections: [{ type: 'price', statement: 'Too expensive' }],
          },
          objections: [{ type: 'timing', statement: 'Need to think' }], // Both formats
        } as any,
        raw_response: '',
      },
    },
  },
];

let passed = 0;
let failed = 0;
const failures: { name: string; error: string; stack?: string }[] = [];

for (const testCase of testCases) {
  console.log(`Testing: ${testCase.name}`);
  console.log('-'.repeat(40));

  try {
    // Test normalization
    console.log('  1. Normalizing extraction output...');
    const normalized = normalizeExtractionOutput(testCase.data);
    console.log('     ✓ Normalization succeeded');

    // Test transformation
    console.log('  2. Transforming to HITL draft...');
    const draft = transformExtractionToHITLDraft(testCase.data);
    console.log('     ✓ Transformation succeeded');

    // Validate structure
    console.log('  3. Validating draft structure...');
    const checks = [
      ['patientSummary', draft.patientSummary],
      ['patientSummary.primaryConcern', draft.patientSummary?.primaryConcern],
      ['patientSummary.secondaryConcerns', draft.patientSummary?.secondaryConcerns],
      ['patientSummary.goals', draft.patientSummary?.goals],
      ['treatments', draft.treatments],
      ['recommendations', draft.recommendations],
      ['needsAttention', draft.needsAttention],
      ['needsAttention.objections', draft.needsAttention?.objections],
      ['needsAttention.hesitations', draft.needsAttention?.hesitations],
      ['needsAttention.concerns', draft.needsAttention?.concerns],
      ['checklist', draft.checklist],
      ['checklist.items', draft.checklist?.items],
      ['settings', draft.settings],
    ];

    let structureValid = true;
    for (const [name, value] of checks) {
      if (value === undefined) {
        console.log(`     ✗ Missing: ${name}`);
        structureValid = false;
      }
    }

    // Check arrays are actually arrays
    const arrayChecks = [
      ['secondaryConcerns', draft.patientSummary?.secondaryConcerns],
      ['goals', draft.patientSummary?.goals],
      ['treatments', draft.treatments],
      ['recommendations', draft.recommendations],
      ['objections', draft.needsAttention?.objections],
      ['hesitations', draft.needsAttention?.hesitations],
      ['concerns', draft.needsAttention?.concerns],
      ['checklist.items', draft.checklist?.items],
    ];

    for (const [name, value] of arrayChecks) {
      if (!Array.isArray(value)) {
        console.log(`     ✗ Not an array: ${name} (got ${typeof value})`);
        structureValid = false;
      }
    }

    if (structureValid) {
      console.log('     ✓ Structure valid');
      console.log(`  ✓ PASSED\n`);
      passed++;
    } else {
      console.log(`  ✗ FAILED (invalid structure)\n`);
      failed++;
      failures.push({ name: testCase.name, error: 'Invalid draft structure' });
    }
  } catch (error) {
    const err = error as Error;
    console.log(`  ✗ FAILED: ${err.message}`);
    console.log(`     Stack: ${err.stack?.split('\n')[1]}`);
    console.log('');
    failed++;
    failures.push({ name: testCase.name, error: err.message, stack: err.stack });
  }
}

console.log('='.repeat(60));
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

if (failures.length > 0) {
  console.log('\nFAILURES:');
  for (const f of failures) {
    console.log(`  - ${f.name}: ${f.error}`);
  }
}

process.exit(failed > 0 ? 1 : 0);
