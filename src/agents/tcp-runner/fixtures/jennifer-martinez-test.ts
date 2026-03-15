/**
 * Test Fixture: Jennifer Martinez TCP
 *
 * Based on Treatment & Care Plan PDF from Dr. Tim Sayed
 * Patient: Jennifer Martinez
 * Date: 08/28/2025
 */

import type { HITLVerifiedOutput, ExtractionOutput } from '../../types';

// ============================================================================
// HITL VERIFIED OUTPUT (Preferred input for TCP Runner)
// ============================================================================

export const jenniferMartinezHITL: HITLVerifiedOutput = {
  verified_at: '2025-08-28T14:30:00Z',
  verified_by: 'Dr. Tim Sayed',

  patient_summary: {
    primary_concern: {
      value: 'Chronic fatigue, joint pain (hands, knees, shoulders), brain fog, and hair thinning attributed to breast implants',
      verified: true,
    },
    secondary_concerns: [
      {
        value: 'Early capsular contracture (Baker Grade II) confirmed on MRI',
        verified: true,
      },
      {
        value: 'Increased firmness and slight elevation in left breast',
        verified: true,
      },
      {
        value: 'Mild capsular thickening on MRI',
        verified: true,
      },
    ],
    goals: [
      {
        value: 'Feel healthy again and regain energy',
        verified: true,
      },
      {
        value: 'Alleviate brain fog',
        verified: true,
      },
      {
        value: 'Stop feeling like body is fighting itself',
        verified: true,
      },
      {
        value: 'Return to natural, smaller breast size (B cup) if it means improving health',
        verified: true,
      },
    ],
    timeline: {
      event: 'Breast Implant Illness symptoms',
      timeframe: 'Ongoing - seeking resolution',
      urgency: 'high',
    },
  },

  todays_treatments: [
    {
      id: 'tx-001',
      name: 'En Bloc Breast Implant Removal',
      area: 'Breast',
      details: 'Remove silicone implants and the entire scar capsule to alleviate Breast Implant Illness symptoms and address capsular contracture.',
      cost: '$9,500.00',
      status: 'scheduled',
      included: true,
    },
    {
      id: 'tx-002',
      name: 'Breast Pathology',
      area: 'Breast',
      details: 'Analyze the removed capsule tissue for pathological findings.',
      cost: '$102.00',
      status: 'scheduled',
      included: true,
    },
    {
      id: 'tx-003',
      name: 'BRABIC BLACK M - Surgical Bra',
      area: 'Breast',
      details: 'Provide support and compression for optimal healing post-surgery.',
      cost: '$50.00',
      status: 'scheduled',
      included: true,
    },
  ],

  recommendations: [
    {
      id: 'rec-001',
      name: 'Mastopexy (Breast Lift)',
      type: 'service',
      rationale: 'Correct residual breast ptosis (sagging) after explant and tissue settling, if desired by patient.',
      action: 'future',
      included: false,
    },
  ],

  needs_attention: {
    objections: [],
    hesitations: [
      {
        id: 'hes-001',
        topic: 'Timing of mastopexy',
        statement: 'Patient wants to wait 6 months after explant to evaluate need for mastopexy',
        resolved: true,
        resolution_approach: 'Discussed that waiting period is recommended for full healing and tissue settling',
        status: 'resolved',
      },
    ],
    concerns: [
      {
        id: 'con-001',
        concern: 'Breast Implant Illness (BII) symptoms',
        raised_by: 'patient',
        category: 'clinical',
        addressed: true,
        response: 'En bloc removal addresses BII by removing both implants and surrounding capsule tissue',
        status: 'addressed',
      },
      {
        id: 'con-002',
        concern: 'Recovery timeline expectations',
        raised_by: 'patient',
        category: 'practical',
        addressed: true,
        response: 'Full healing and breast tissue settling takes at least 6 months',
        status: 'addressed',
      },
    ],
  },

  checklist: {
    completion_rate: 100,
    critical_items_complete: true,
    items: [
      {
        item_id: 'chk-001',
        item_label: 'Reviewed MRI findings with patient',
        category: 'clinical',
        completed: true,
        critical: true,
        evidence: 'Discussed Baker Grade II capsular contracture findings',
      },
      {
        item_id: 'chk-002',
        item_label: 'Explained en bloc removal procedure',
        category: 'education',
        completed: true,
        critical: true,
        evidence: 'Patient understands complete capsule removal approach',
      },
      {
        item_id: 'chk-003',
        item_label: 'Discussed recovery timeline',
        category: 'education',
        completed: true,
        critical: false,
        evidence: 'Patient informed of 6-month healing period',
      },
      {
        item_id: 'chk-004',
        item_label: 'Reviewed post-operative care requirements',
        category: 'safety',
        completed: true,
        critical: true,
        evidence: 'Discussed caregiver needs, activity restrictions, diet',
      },
      {
        item_id: 'chk-005',
        item_label: 'Discussed financing options',
        category: 'closing',
        completed: true,
        critical: false,
        evidence: 'Presented 6, 12, and 24 month payment plans',
      },
    ],
  },

  settings: {
    language: 'English',
    language_level: 'Standard',
    perspective: 'Second Person',
    include_pricing: true,
    include_future: true,
  },
};

// ============================================================================
// EXTRACTION OUTPUT (Alternative input format)
// ============================================================================

export const jenniferMartinezExtraction: ExtractionOutput = {
  prompt_1: {
    parsed_json: {
      extraction_version: '3.0',
      pass: 1,
      visit_context: {
        visit_type: 'initial_consultation',
        reason_for_visit: 'Consultation for breast implant removal due to suspected Breast Implant Illness',
        referred_by: null,
        motivating_event: 'Chronic fatigue, joint pain, brain fog, and hair thinning attributed to breast implants',
      },
      patient_goals: {
        primary_concern: 'Chronic fatigue, joint pain, brain fog, and hair thinning',
        secondary_concerns: [
          'Capsular contracture (Baker Grade II)',
          'Increased firmness in left breast',
        ],
        goals: [
          'Feel healthy again',
          'Regain energy',
          'Alleviate brain fog',
          'Return to natural breast size',
        ],
        anticipated_outcomes: [
          'Resolution of BII symptoms',
          'Removal of capsular contracture',
          'Natural breast appearance',
        ],
      },
      areas: {
        treatment_areas: ['Breast'],
        concern_areas: ['Breast', 'Systemic (fatigue, brain fog, joint pain)'],
      },
      interests: {
        stated_interests: ['En bloc breast implant removal'],
        future_interests: [
          {
            interest: 'Mastopexy',
            interest_level: 'medium',
            evidence: 'Patient open to mastopexy after recovery if needed to address ptosis',
          },
        ],
      },
      offerings: [
        {
          name: 'En Bloc Breast Implant Removal',
          type: 'service',
          disposition: 'scheduled',
          area: 'Breast',
          quantity: null,
          value: 9500,
          guidance_discovery: {
            provider_guided: true,
            guidance_type: 'enhancement',
            patient_reception: 'engaged',
            reception_evidence: 'Patient actively seeking this procedure to address BII symptoms',
            guidance_rationale: 'concern_alignment',
          },
        },
        {
          name: 'Breast Pathology',
          type: 'service',
          disposition: 'scheduled',
          area: 'Breast',
          quantity: null,
          value: 102,
          guidance_discovery: {
            provider_guided: true,
            guidance_type: 'complementary',
            patient_reception: 'engaged',
            reception_evidence: 'Patient agreed to pathology analysis',
            guidance_rationale: 'treatment_synergy',
          },
        },
        {
          name: 'BRABIC BLACK M - Surgical Bra',
          type: 'product',
          disposition: 'scheduled',
          area: 'Breast',
          quantity: '1',
          value: 50,
          guidance_discovery: {
            provider_guided: true,
            guidance_type: 'adjunctive',
            patient_reception: 'engaged',
            reception_evidence: 'Patient understands need for post-op compression',
            guidance_rationale: 'treatment_synergy',
          },
        },
        {
          name: 'Mastopexy',
          type: 'service',
          disposition: 'discussed',
          area: 'Breast',
          quantity: null,
          value: 6000,
          guidance_discovery: {
            provider_guided: true,
            guidance_type: 'enhancement',
            patient_reception: 'curious',
            reception_evidence: 'Patient interested but wants to evaluate need after initial healing',
            guidance_rationale: 'timing_opportunity',
          },
        },
      ],
    },
  },
  prompt_2: {
    parsed_json: {
      extraction_version: '3.0',
      pass: 2,
      outcome: {
        status: 'booked',
        summary: 'Patient scheduled for en bloc breast implant removal to address suspected Breast Implant Illness and capsular contracture. Optional mastopexy discussed for future consideration after 6-month recovery period.',
      },
      next_steps: [
        {
          action: 'Schedule pre-operative consultation and tests',
          timeframe: '2 weeks',
          owner: 'staff',
        },
        {
          action: 'Schedule surgery date',
          timeframe: '3-4 weeks',
          owner: 'staff',
        },
        {
          action: 'Arrange caregiver for first 24-48 hours post-surgery',
          timeframe: 'Before surgery',
          owner: 'patient',
        },
        {
          action: 'Book post-operative follow-up appointments',
          timeframe: 'After surgery',
          owner: 'staff',
        },
      ],
      patient_signals: {
        commitment_level: 'committed',
      },
      objections: [],
      hesitations: [
        {
          topic: 'Mastopexy timing',
          statement: 'Patient prefers to wait and evaluate breast appearance after healing before deciding on mastopexy',
          resolved: true,
          resolution_approach: 'Provider confirmed this is the recommended approach - wait 6 months for tissue settling',
        },
      ],
      concerns: [
        {
          concern: 'BII symptoms resolution timeline',
          raised_by: 'patient',
          category: 'clinical',
          addressed: true,
          response: 'Symptoms typically begin improving within weeks of explant, but full resolution may take months',
        },
      ],
      visit_checklist: [
        {
          item_id: 'vc-001',
          item_label: 'Confirmed patient understanding of en bloc procedure',
          category: 'education',
          completed: true,
          critical: true,
          evidence: 'Patient demonstrated clear understanding of complete capsule removal',
        },
        {
          item_id: 'vc-002',
          item_label: 'Reviewed recovery expectations',
          category: 'education',
          completed: true,
          critical: true,
          evidence: 'Patient aware of 6-month healing timeline',
        },
        {
          item_id: 'vc-003',
          item_label: 'Discussed post-operative care',
          category: 'safety',
          completed: true,
          critical: true,
          evidence: 'Reviewed caregiver needs, activity restrictions, diet recommendations',
        },
        {
          item_id: 'vc-004',
          item_label: 'Presented financing options',
          category: 'closing',
          completed: true,
          critical: false,
          evidence: 'Patient reviewed 6, 12, and 24 month payment plans',
        },
      ],
    },
  },
};

// ============================================================================
// PATIENT METADATA
// ============================================================================

export const jenniferMartinezMetadata = {
  patientName: 'Jennifer Martinez',
  dateOfBirth: '08/28/1983',
  consultationDate: '08/28/2025',
  providerName: 'Dr. Tim Sayed',
  practiceName: 'Tim Sayed MD - Aesthetics Done Right',
  practiceAddress: '4510 Executive Dr., Suite 210, 2nd Floor, San Diego CA, 92121',
  practicePhone: '+18582472933',
  practiceEmail: 'drsayedmd360@gmail.com',
  practiceWebsite: 'https://www.timsayedmd.com/',

  investment: {
    phase1: {
      name: 'Phase 1: Surgical Intervention and Initial Recovery',
      status: 'Completed',
      items: [
        { name: 'En Bloc Breast Implant Removal', price: 9500 },
        { name: 'Breast Pathology', price: 102 },
        { name: 'BRABIC BLACK M - Surgical Bra', price: 50 },
      ],
      subtotal: 9652,
    },
    phase2: {
      name: 'Phase 2: Aesthetic Refinement (Optional)',
      status: 'In Progress',
      items: [
        { name: 'Mastopexy', price: 6000 },
      ],
      subtotal: 6000,
    },
    total: 15652,
    financing: [
      { months: 6, apr: 0, monthly: 2608.67 },
      { months: 12, apr: 7.99, monthly: 1361.47 },
      { months: 24, apr: 9.99, monthly: 722.19 },
    ],
  },

  generalRecommendations: [
    'Arrange for a caregiver for the first 24-48 hours post-surgery.',
    'Prepare for recovery time and limit strenuous activity as directed.',
    'Maintain a healthy diet to support healing.',
    'Avoid smoking and nicotine products before and after surgery.',
  ],

  postTreatmentCare: [
    'Follow all post-operative instructions provided by your surgeon.',
    'Attend all follow-up appointments.',
    'Contact the clinic immediately if you experience signs of infection or unusual pain.',
  ],

  nextSteps: [
    'Schedule pre-operative consultation and tests.',
    'Schedule surgery date.',
    'Book post-operative follow-up appointments.',
  ],
};

// ============================================================================
// EXPORT DEFAULT TEST CASE
// ============================================================================

export const jenniferMartinezTestCase = {
  hitl: jenniferMartinezHITL,
  extraction: jenniferMartinezExtraction,
  metadata: jenniferMartinezMetadata,
};

export default jenniferMartinezTestCase;
