/**
 * Response Parser
 *
 * Parses LLM streaming responses into structured section content.
 */

import type {
  TCPSectionId,
  SectionContent,
  ImmediateIntervention,
  ShortTermGoals,
  LongTermStrategy,
  ClinicalSafetyProtocols,
  ExecutiveSummary,
} from '../types';

/**
 * Parse the streamed response text into section content
 */
export function parseSectionResponse(
  sectionId: TCPSectionId,
  responseText: string
): SectionContent | null {
  try {
    // Clean up the response - remove markdown code blocks if present
    let cleanText = responseText.trim();

    // Remove markdown code block markers
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.slice(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.slice(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.slice(0, -3);
    }

    cleanText = cleanText.trim();

    // Parse JSON
    const parsed = JSON.parse(cleanText);

    // Validate and transform based on section type
    return validateAndTransform(sectionId, parsed);
  } catch (error) {
    console.error(`Failed to parse ${sectionId} response:`, error);
    return null;
  }
}

/**
 * Validate and transform parsed JSON to expected structure
 */
function validateAndTransform(
  sectionId: TCPSectionId,
  parsed: unknown
): SectionContent | null {
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const data = parsed as Record<string, unknown>;

  switch (sectionId) {
    case 'immediate':
      return transformImmediate(data);
    case 'short_term':
      return transformShortTerm(data);
    case 'long_term':
      return transformLongTerm(data);
    case 'safety':
      return transformSafety(data);
    case 'summary':
      return transformSummary(data);
    default:
      return null;
  }
}

/**
 * Transform immediate intervention data
 */
function transformImmediate(data: Record<string, unknown>): ImmediateIntervention | null {
  const focus = typeof data.focus === 'string' ? data.focus : '';
  const treatments = Array.isArray(data.treatments)
    ? data.treatments.map((t, i) => ({
        id: String(t?.id || `immediate-${i}`),
        name: String(t?.name || ''),
        description: String(t?.description || ''),
        details: String(t?.details || ''),
        cost: String(t?.cost || ''),
        area: t?.area ? String(t.area) : undefined,
        quantity: t?.quantity ? String(t.quantity) : undefined,
      }))
    : [];

  return {
    focus,
    treatments,
  };
}

/**
 * Transform short-term goals data
 */
function transformShortTerm(data: Record<string, unknown>): ShortTermGoals | null {
  const focus = typeof data.focus === 'string' ? data.focus : '';

  const treatments = Array.isArray(data.treatments)
    ? data.treatments.map((t, i) => ({
        id: String(t?.id || `short-${i}`),
        name: String(t?.name || ''),
        description: String(t?.description || ''),
        details: String(t?.details || ''),
        cost: String(t?.cost || ''),
        area: t?.area ? String(t.area) : undefined,
        quantity: t?.quantity ? String(t.quantity) : undefined,
      }))
    : [];

  const followUpSchedule = Array.isArray(data.follow_up_schedule)
    ? data.follow_up_schedule.map((f) => ({
        event: String(f?.event || ''),
        date: String(f?.date || ''),
        notes: f?.notes ? String(f.notes) : undefined,
      }))
    : [];

  return {
    focus,
    treatments,
    follow_up_schedule: followUpSchedule,
  };
}

/**
 * Transform long-term strategy data
 */
function transformLongTerm(data: Record<string, unknown>): LongTermStrategy | null {
  const focus = typeof data.focus === 'string' ? data.focus : '';

  const maintenanceSchedule = Array.isArray(data.maintenance_schedule)
    ? data.maintenance_schedule.map((m) => ({
        treatment: String(m?.treatment || ''),
        frequency: String(m?.frequency || ''),
        notes: m?.notes ? String(m.notes) : undefined,
      }))
    : [];

  let skincareRoutine = null;
  if (data.skincare_routine && typeof data.skincare_routine === 'object') {
    const routine = data.skincare_routine as Record<string, unknown>;
    const morning = Array.isArray(routine.morning)
      ? routine.morning.map((s) => ({
          product: String(s?.product || ''),
          purpose: String(s?.purpose || ''),
          estimated_cost: String(s?.estimated_cost || ''),
        }))
      : [];
    const evening = Array.isArray(routine.evening)
      ? routine.evening.map((s) => ({
          product: String(s?.product || ''),
          purpose: String(s?.purpose || ''),
          estimated_cost: String(s?.estimated_cost || ''),
        }))
      : [];

    if (morning.length > 0 || evening.length > 0) {
      skincareRoutine = { morning, evening };
    }
  }

  return {
    focus,
    maintenance_schedule: maintenanceSchedule,
    skincare_routine: skincareRoutine,
  };
}

/**
 * Transform safety protocols data
 */
function transformSafety(data: Record<string, unknown>): ClinicalSafetyProtocols | null {
  const coordinationRequirements = Array.isArray(data.coordination_requirements)
    ? data.coordination_requirements.map(String)
    : [];

  const safetyProtocols = Array.isArray(data.safety_protocols)
    ? data.safety_protocols.map(String)
    : [];

  return {
    coordination_requirements: coordinationRequirements,
    safety_protocols: safetyProtocols,
  };
}

/**
 * Transform executive summary data
 */
function transformSummary(data: Record<string, unknown>): ExecutiveSummary | null {
  const overview = typeof data.overview === 'string' ? data.overview : '';

  const keyPoints = Array.isArray(data.key_points)
    ? data.key_points.map(String)
    : [];

  const nextAppointment =
    typeof data.next_appointment === 'string' ? data.next_appointment : null;

  return {
    overview,
    key_points: keyPoints,
    next_appointment: nextAppointment,
  };
}

/**
 * Attempt to extract partial JSON from incomplete stream
 * Used when generation is stopped mid-stream
 */
export function extractPartialContent(
  sectionId: TCPSectionId,
  partialText: string
): Partial<SectionContent> | null {
  // Try to find any complete JSON objects
  const jsonMatch = partialText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    // Try to parse - may fail on incomplete JSON
    const parsed = JSON.parse(jsonMatch[0]);
    return validateAndTransform(sectionId, parsed);
  } catch {
    // Try to fix common issues
    let fixed = jsonMatch[0];

    // Add closing brackets if missing
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    fixed += '}'.repeat(openBraces - closeBraces);

    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/\]/g) || []).length;
    fixed += ']'.repeat(openBrackets - closeBrackets);

    try {
      const parsed = JSON.parse(fixed);
      return validateAndTransform(sectionId, parsed);
    } catch {
      return null;
    }
  }
}
