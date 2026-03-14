/**
 * Transform Extraction Output to HITL Draft
 *
 * Converts raw extraction output into the working draft state
 * for the HITL verification screen.
 */

import { v4 as uuidv4 } from 'uuid';
import type { ExtractionOutput, Offering, TCPSettings } from '../../types';
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
  const pass1 = extraction.prompt_1.parsed_json;
  const pass2 = extraction.prompt_2.parsed_json;

  // Patient Summary
  const patientSummary: PatientSummaryDraft = {
    primaryConcern: createVerifiableField(pass1.patient_goals.primary_concern),
    secondaryConcerns: pass1.patient_goals.secondary_concerns.map(c => createVerifiableField(c)),
    goals: pass1.patient_goals.goals.map(g => createVerifiableField(g)),
    anticipatedOutcomes: pass1.patient_goals.anticipated_outcomes,
    timeline: {
      event: pass1.visit_context.motivating_event,
      timeframe: null,
      urgency: determineUrgency(pass1.visit_context.motivating_event, null),
    },
  };

  // Treatments
  const treatments = transformOfferingsToTreatments(pass1.offerings);

  // Recommendations
  const recommendations = transformOfferingsToRecommendations(pass1.offerings);

  // Needs Attention
  const needsAttention: NeedsAttentionDraft = {
    objections: pass2.objections.map(obj => ({
      ...obj,
      id: obj.id || uuidv4(),
      status: obj.resolved === true ? 'resolved' as const :
              obj.resolved === false ? 'unresolved' as const : 'unresolved' as const,
      suggestedResponse: null,
      suggestedResponseLoading: false,
      notes: obj.resolution_approach || '',
    })),
    hesitations: pass2.hesitations.map(hes => ({
      ...hes,
      id: hes.id || uuidv4(),
      status: hes.resolved === true ? 'resolved' as const :
              hes.resolved === false ? 'unresolved' as const : 'unresolved' as const,
      notes: hes.resolution_approach || '',
    })),
    concerns: pass2.concerns.map(con => ({
      ...con,
      id: con.id || uuidv4(),
      status: con.addressed === true ? 'addressed' as const :
              con.addressed === false ? 'unaddressed' as const : 'acknowledged' as const,
      notes: con.response || '',
    })),
  };

  // Checklist
  const checklist: ChecklistDraft = {
    items: pass2.visit_checklist.map(item => ({
      itemId: item.item_id,
      itemLabel: item.item_label,
      category: item.category,
      completed: item.completed,
      critical: item.critical,
      evidence: item.evidence,
      manuallyChecked: false,
    })),
    completionRate: calculateCompletionRate(pass2.visit_checklist),
    criticalItemsComplete: pass2.visit_checklist
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
