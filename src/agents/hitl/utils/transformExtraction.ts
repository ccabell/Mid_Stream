/**
 * Transform Extraction Output to HITL Draft
 *
 * Converts raw extraction output into the working draft state
 * for the HITL verification screen.
 *
 * Handles both V2 (FieldWithEvidence wrapped) and legacy formats.
 */

import { v4 as uuidv4 } from 'uuid';
import type { ExtractionOutput, Offering, TCPSettings, Pass1Output, Pass2Output } from '../../types';
import type {
  V2Pass1Output,
  V2Pass2Output,
  V2Offering,
} from '../../../apiServices/types';
import type {
  HITLDraft,
  PatientSummaryDraft,
  TreatmentDraft,
  RecommendationDraft,
  NeedsAttentionDraft,
  ObjectionDraft,
  HesitationDraft,
  ConcernDraft,
  ChecklistDraft,
  ChecklistItemDraft,
  VerifiableField,
} from '../types';

/**
 * Unwrap a FieldWithEvidence value, returning the value or a default
 */
function unwrap<T>(field: { value: T | null } | T | null | undefined, defaultValue: T): T {
  if (field === null || field === undefined) return defaultValue;
  if (typeof field === 'object' && 'value' in field) {
    return field.value ?? defaultValue;
  }
  return field as T;
}

/**
 * Unwrap an array field from FieldWithEvidence
 */
function unwrapArray<T>(field: { value: T[] | null } | T[] | null | undefined): T[] {
  if (field === null || field === undefined) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'object' && 'value' in field) {
    return field.value ?? [];
  }
  return [];
}

/**
 * Convert V2Pass1Output to Pass1Output format
 */
function convertV2Pass1(v2: V2Pass1Output): Pass1Output {
  return {
    extraction_version: '3.0',
    pass: 1,
    visit_context: {
      visit_type: unwrap(v2.visit_context?.visit_type, 'unknown') as Pass1Output['visit_context']['visit_type'],
      reason_for_visit: unwrap(v2.visit_context?.reason_for_visit, ''),
      referred_by: unwrap(v2.visit_context?.referred_by, null),
      motivating_event: unwrap(v2.visit_context?.motivating_event, null),
    },
    patient_goals: {
      primary_concern: unwrap(v2.patient_goals?.primary_concern, ''),
      secondary_concerns: unwrapArray(v2.patient_goals?.secondary_concerns),
      goals: unwrapArray(v2.patient_goals?.goals),
      anticipated_outcomes: unwrapArray(v2.patient_goals?.anticipated_outcomes),
    },
    areas: {
      treatment_areas: unwrapArray(v2.areas?.treatment_areas),
      concern_areas: unwrapArray(v2.areas?.concern_areas),
    },
    interests: {
      stated_interests: unwrapArray(v2.interests?.stated_interests),
      future_interests: (v2.interests?.future_interests ?? []).map(fi => ({
        interest: fi.interest,
        interest_level: fi.interest_level ?? null,
        evidence: fi.evidence?.quote ?? '',
      })),
    },
    offerings: (v2.offerings ?? []).map(convertV2Offering),
  };
}

/**
 * Convert V2Offering to Offering format
 */
function convertV2Offering(v2: V2Offering): Offering {
  // Map V2 disposition to legacy disposition
  const dispositionMap: Record<string, Offering['disposition']> = {
    'performed': 'performed',
    'scheduled': 'scheduled',
    'agreed_pending': 'discussed',
    'recommended_receptive': 'recommended',
    'recommended_hesitant': 'recommended',
    'recommended_declined': 'mentioned',
    'discussed': 'discussed',
    'purchased': 'performed',
  };

  // Derive guidance discovery from V2 disposition
  const receptionMap: Record<string, 'engaged' | 'curious' | 'hesitant' | 'passed' | 'unexplored'> = {
    'performed': 'engaged',
    'scheduled': 'engaged',
    'agreed_pending': 'engaged',
    'recommended_receptive': 'engaged',
    'recommended_hesitant': 'hesitant',
    'recommended_declined': 'passed',
    'discussed': 'curious',
    'purchased': 'engaged',
  };

  return {
    name: v2.name,
    type: v2.type,
    disposition: dispositionMap[v2.disposition] ?? 'discussed',
    area: v2.area ?? null,
    quantity: v2.quantity ?? null,
    value: v2.value ?? v2.mentioned_value ?? null,
    guidance_discovery: {
      provider_guided: true,
      guidance_type: null,
      patient_reception: receptionMap[v2.disposition] ?? 'unexplored',
      reception_evidence: v2.evidence?.quote ?? null,
      guidance_rationale: null,
    },
  };
}

/**
 * Convert V2Pass2Output to Pass2Output format
 */
function convertV2Pass2(v2: V2Pass2Output): Pass2Output {
  // Map objections
  const objections = (v2.patient_signals?.objections ?? []).map(obj => ({
    id: uuidv4(),
    type: (obj.type as Pass2Output['objections'][0]['type']) ?? 'other',
    statement: obj.statement ?? obj.objection ?? '',
    resolved: obj.resolved ?? (obj.resolution_status === 'resolved' ? true : obj.resolution_status === 'unresolved' ? false : null),
    resolution_approach: obj.suggested_response ?? null,
  }));

  // Map hesitations
  const hesitations = (v2.patient_signals?.hesitations ?? []).map(hes => ({
    id: uuidv4(),
    topic: hes.topic,
    statement: hes.statement ?? '',
    resolved: hes.resolved ?? (hes.resolution_status === 'resolved' ? true : hes.resolution_status === 'unresolved' ? false : null),
    resolution_approach: null,
  }));

  // Map concerns
  const concerns = (v2.patient_signals?.concerns ?? []).map(con => ({
    id: uuidv4(),
    concern: con.concern,
    raised_by: con.raised_by,
    category: 'other' as const,
    addressed: con.addressed ?? null,
    response: null,
  }));

  // Map visit checklist - V2 doesn't have item_id, category, or critical
  const visitChecklist = (v2.visit_checklist ?? []).map((item, idx) => ({
    item_id: `item_${idx}`,
    item_label: item.item_label,
    category: 'clinical' as const,
    completed: item.completed,
    critical: false,
    evidence: item.evidence ?? null,
  }));

  // Map outcome status
  const statusValue = unwrap(v2.outcome?.status, 'information_only');
  const outcomeStatusMap: Record<string, Pass2Output['outcome']['status']> = {
    'treatment_performed': 'treatment_performed',
    'booked': 'booked',
    'agreed_pending_scheduling': 'agreed_pending_scheduling',
    'agreed': 'agreed_pending_scheduling',
    'thinking': 'thinking',
    'considering': 'thinking',
    'follow_up_requested': 'follow_up_requested',
    'declined': 'declined',
    'information_only': 'information_only',
  };

  // Map commitment level from intent score
  const intentScore = unwrap(v2.patient_signals?.intent_score, null) ?? unwrap(v2.patient_signals?.intent_level, null);
  let commitmentLevel: Pass2Output['patient_signals']['commitment_level'] = 'uncertain';
  if (intentScore !== null) {
    if (intentScore >= 80) commitmentLevel = 'committed';
    else if (intentScore >= 60) commitmentLevel = 'interested';
    else if (intentScore >= 40) commitmentLevel = 'considering';
    else if (intentScore >= 20) commitmentLevel = 'uncertain';
    else commitmentLevel = 'not_interested';
  }

  return {
    extraction_version: '3.0',
    pass: 2,
    outcome: {
      status: outcomeStatusMap[statusValue] ?? 'information_only',
      summary: unwrap(v2.outcome?.summary, ''),
    },
    next_steps: (v2.next_steps ?? []).map(ns => ({
      action: ns.action,
      timeframe: ns.timing ?? null,
      owner: ns.owner ?? null,
    })),
    patient_signals: {
      commitment_level: commitmentLevel,
    },
    objections,
    hesitations,
    concerns,
    visit_checklist: visitChecklist,
  };
}

/**
 * Check if a parsed_json is V2 format (has FieldWithEvidence wrappers)
 */
function isV2Pass1(json: unknown): json is V2Pass1Output {
  if (!json || typeof json !== 'object') return false;
  const obj = json as Record<string, unknown>;
  // V2 format has patient_goals.primary_concern.value structure
  const pg = obj.patient_goals as Record<string, unknown> | undefined;
  if (pg?.primary_concern && typeof pg.primary_concern === 'object') {
    return 'value' in (pg.primary_concern as object);
  }
  // Also check if offerings are V2 format (different disposition values)
  const offerings = obj.offerings as V2Offering[] | undefined;
  if (offerings?.[0]?.disposition) {
    const v2Dispositions = ['agreed_pending', 'recommended_receptive', 'recommended_hesitant', 'recommended_declined', 'purchased'];
    return v2Dispositions.includes(offerings[0].disposition);
  }
  return false;
}

/**
 * Check if a parsed_json is V2 Pass2 format
 */
function isV2Pass2(json: unknown): json is V2Pass2Output {
  if (!json || typeof json !== 'object') return false;
  const obj = json as Record<string, unknown>;
  // V2 format has patient_signals.objections instead of top-level objections
  return 'patient_signals' in obj && !('objections' in obj);
}

/**
 * Normalize extraction output - convert V2 to standard format if needed
 */
export function normalizeExtractionOutput(extraction: ExtractionOutput): ExtractionOutput {
  let pass1 = extraction.prompt_1.parsed_json;
  let pass2 = extraction.prompt_2.parsed_json;

  // Convert V2 format if detected
  if (isV2Pass1(pass1)) {
    pass1 = convertV2Pass1(pass1);
  }
  if (isV2Pass2(pass2)) {
    pass2 = convertV2Pass2(pass2);
  }

  return {
    prompt_1: {
      parsed_json: pass1,
      raw_response: extraction.prompt_1.raw_response,
    },
    prompt_2: {
      parsed_json: pass2,
      raw_response: extraction.prompt_2.raw_response,
    },
  };
}

/**
 * Create a verifiable field from a value
 */
function createVerifiableField<T>(value: T): VerifiableField<T> {
  return {
    value,
    original: value,
    verified: false,
    edited: false,
  };
}

/**
 * Determine urgency based on motivating event and timeframe
 */
function determineUrgency(event: string | null, _timeframe: string | null): 'high' | 'medium' | 'low' {
  if (!event) return 'low';

  const eventLower = event.toLowerCase();

  // High urgency triggers
  if (
    eventLower.includes('wedding') ||
    eventLower.includes('reunion') ||
    eventLower.includes('next week') ||
    eventLower.includes('next month') ||
    eventLower.includes('soon')
  ) {
    return 'high';
  }

  // Medium urgency
  if (
    eventLower.includes('vacation') ||
    eventLower.includes('holiday') ||
    eventLower.includes('event')
  ) {
    return 'medium';
  }

  return 'low';
}

/**
 * Transform offerings to treatments (performed/scheduled/agreed)
 */
function transformOfferingsToTreatments(offerings: Offering[]): TreatmentDraft[] {
  const treatmentDispositions = ['performed', 'scheduled'];
  const agreedDispositions = ['discussed', 'recommended'];

  return offerings
    .filter(o => treatmentDispositions.includes(o.disposition) ||
                 (agreedDispositions.includes(o.disposition) && o.guidance_discovery?.patient_reception === 'engaged'))
    .map(offering => ({
      id: uuidv4(),
      name: offering.name,
      area: offering.area || 'Full face',
      details: offering.quantity || '',
      cost: offering.value ? `$${offering.value}` : '',
      status: offering.disposition === 'performed' ? 'performed' as const :
              offering.disposition === 'scheduled' ? 'scheduled' as const : 'agreed' as const,
      included: true,
      source: 'extraction' as const,
    }));
}

/**
 * Transform offerings to recommendations
 */
function transformOfferingsToRecommendations(offerings: Offering[]): RecommendationDraft[] {
  const recommendationDispositions = ['discussed', 'recommended', 'mentioned'];

  return offerings
    .filter(o => recommendationDispositions.includes(o.disposition))
    .filter(o => o.guidance_discovery?.patient_reception !== 'passed')
    .map(offering => {
      // Calculate priority score based on guidance discovery
      const gd = offering.guidance_discovery;
      let patientBenefit = 50;
      let clinicalViability = 70;
      let practiceValue = 60;

      // Adjust based on patient reception
      if (gd?.patient_reception === 'engaged') {
        patientBenefit = 90;
      } else if (gd?.patient_reception === 'curious') {
        patientBenefit = 75;
      } else if (gd?.patient_reception === 'hesitant') {
        patientBenefit = 40;
      }

      // Adjust based on guidance type
      if (gd?.guidance_type === 'complementary' || gd?.guidance_type === 'enhancement') {
        clinicalViability = 85;
      }

      // Calculate overall score
      const priorityScore = Math.round(
        patientBenefit * 0.4 +
        clinicalViability * 0.35 +
        practiceValue * 0.25
      );

      // Determine tier
      const tier = priorityScore >= 80 ? 1 :
                   priorityScore >= 60 ? 2 :
                   priorityScore >= 40 ? 3 : 4;

      return {
        id: uuidv4(),
        name: offering.name,
        type: offering.type,
        rationale: gd?.guidance_rationale
          ? formatRationale(gd.guidance_rationale, offering.name)
          : `Consider ${offering.name} for additional benefit`,
        priorityScore,
        tier: tier as 1 | 2 | 3 | 4,
        patientReception: gd?.reception_evidence || null,
        action: null,
        scores: {
          patientBenefit,
          clinicalViability,
          practiceValue,
        },
        talkingPoints: [],
        synergies: [],
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Format rationale for display
 */
function formatRationale(rationale: string, offeringName: string): string {
  switch (rationale) {
    case 'concern_alignment':
      return `${offeringName} directly addresses your stated concerns`;
    case 'treatment_synergy':
      return `${offeringName} works well with today's treatment`;
    case 'value_creation':
      return `${offeringName} offers excellent value for your goals`;
    case 'timing_opportunity':
      return `${offeringName} is ideal timing based on your schedule`;
    default:
      return `Consider ${offeringName} for additional benefit`;
  }
}

/**
 * Transform extraction output to HITL draft
 */
export function transformExtractionToHITLDraft(
  extraction: ExtractionOutput
): HITLDraft {
  // Normalize V2 format to standard format if needed
  const normalized = normalizeExtractionOutput(extraction);
  const pass1 = normalized.prompt_1.parsed_json;
  const pass2 = normalized.prompt_2.parsed_json;

  // Safe access helpers - handle missing/undefined data
  const patientGoals = pass1?.patient_goals || {};
  const visitContext = pass1?.visit_context || {};
  const offerings = pass1?.offerings || [];
  const objections = pass2?.objections || [];
  const hesitations = pass2?.hesitations || [];
  const concerns = pass2?.concerns || [];
  const visitChecklist = pass2?.visit_checklist || [];

  // Patient Summary
  const patientSummary: PatientSummaryDraft = {
    primaryConcern: createVerifiableField(patientGoals.primary_concern || ''),
    secondaryConcerns: (patientGoals.secondary_concerns || []).map(c => createVerifiableField(c)),
    goals: (patientGoals.goals || []).map(g => createVerifiableField(g)),
    anticipatedOutcomes: patientGoals.anticipated_outcomes || [],
    timeline: {
      event: visitContext.motivating_event || null,
      timeframe: null,
      urgency: determineUrgency(visitContext.motivating_event || null, null),
    },
  };

  // Treatments
  const treatments = transformOfferingsToTreatments(offerings);

  // Recommendations
  const recommendations = transformOfferingsToRecommendations(offerings);

  // Needs Attention
  const needsAttention: NeedsAttentionDraft = {
    objections: objections.map(obj => ({
      ...obj,
      id: obj.id || uuidv4(),
      status: obj.resolved === true ? 'resolved' as const :
              obj.resolved === false ? 'unresolved' as const : 'unresolved' as const,
      suggestedResponse: null,
      suggestedResponseLoading: false,
      notes: obj.resolution_approach || '',
    })),
    hesitations: hesitations.map(hes => ({
      ...hes,
      id: hes.id || uuidv4(),
      status: hes.resolved === true ? 'resolved' as const :
              hes.resolved === false ? 'unresolved' as const : 'unresolved' as const,
      notes: hes.resolution_approach || '',
    })),
    concerns: concerns.map(con => ({
      ...con,
      id: con.id || uuidv4(),
      status: con.addressed === true ? 'addressed' as const :
              con.addressed === false ? 'unaddressed' as const : 'acknowledged' as const,
      notes: con.response || '',
    })),
  };

  // Checklist
  const checklist: ChecklistDraft = {
    items: visitChecklist.map(item => ({
      itemId: item.item_id || uuidv4(),
      itemLabel: item.item_label || '',
      category: item.category || 'clinical',
      completed: item.completed,
      critical: item.critical || false,
      evidence: item.evidence || null,
      manuallyChecked: false,
    })),
    completionRate: calculateCompletionRate(visitChecklist),
    criticalItemsComplete: visitChecklist
      .filter(i => i.critical)
      .every(i => i.completed === true),
  };

  // Default settings
  const settings: TCPSettings = {
    language: 'English',
    language_level: 'Standard',
    perspective: 'Second Person',
    include_pricing: true,
    include_future: true,
  };

  return {
    patientSummary,
    treatments,
    recommendations,
    needsAttention,
    checklist,
    settings,
  };
}

/**
 * Calculate checklist completion rate
 */
function calculateCompletionRate(items: { completed: boolean | null }[]): number {
  if (items.length === 0) return 1;
  const completed = items.filter(i => i.completed === true).length;
  return completed / items.length;
}

/**
 * Convert HITL draft to verified output
 */
export function convertDraftToOutput(
  draft: HITLDraft,
  providerId: string
): import('../../types').HITLVerifiedOutput {
  return {
    verified_at: new Date().toISOString(),
    verified_by: providerId,

    patient_summary: {
      primary_concern: {
        value: draft.patientSummary.primaryConcern.value,
        verified: draft.patientSummary.primaryConcern.verified,
        edited: draft.patientSummary.primaryConcern.edited,
        original: draft.patientSummary.primaryConcern.original,
      },
      secondary_concerns: draft.patientSummary.secondaryConcerns.map(c => ({
        value: c.value,
        verified: c.verified,
        edited: c.edited,
        original: c.original,
      })),
      goals: draft.patientSummary.goals.map(g => ({
        value: g.value,
        verified: g.verified,
        edited: g.edited,
        original: g.original,
      })),
      timeline: draft.patientSummary.timeline,
    },

    todays_treatments: draft.treatments
      .filter(t => t.included)
      .map(t => ({
        id: t.id,
        name: t.name,
        area: t.area,
        details: t.details,
        cost: t.cost,
        status: t.status,
        included: t.included,
      })),

    recommendations: draft.recommendations.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      rationale: r.rationale,
      action: r.action,
      included: r.action === 'include',
    })),

    needs_attention: {
      objections: draft.needsAttention.objections.map(o => ({
        id: o.id,
        type: o.type,
        statement: o.statement,
        resolved: o.status === 'resolved' ? true : o.status === 'unresolved' ? false : null,
        resolution_approach: o.notes || o.resolution_approach,
        status: o.status,
        suggested_response: o.suggestedResponse || undefined,
      })),
      hesitations: draft.needsAttention.hesitations.map(h => ({
        id: h.id,
        topic: h.topic,
        statement: h.statement,
        resolved: h.status === 'resolved' ? true : h.status === 'unresolved' ? false : null,
        resolution_approach: h.notes || h.resolution_approach,
        status: h.status,
      })),
      concerns: draft.needsAttention.concerns.map(c => ({
        id: c.id,
        concern: c.concern,
        raised_by: c.raised_by,
        category: c.category,
        addressed: c.status === 'addressed' ? true : c.status === 'unaddressed' ? false : null,
        response: c.notes || c.response,
        status: c.status,
      })),
    },

    checklist: {
      completion_rate: draft.checklist.completionRate,
      critical_items_complete: draft.checklist.criticalItemsComplete,
      items: draft.checklist.items.map(i => ({
        item_id: i.itemId,
        item_label: i.itemLabel,
        category: i.category,
        completed: i.completed,
        critical: i.critical,
        evidence: i.evidence,
        manually_checked: i.manuallyChecked,
      })),
    },

    settings: draft.settings,
  };
}
