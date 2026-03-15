/**
 * Prompt Builder
 *
 * Builds prompts for each TCP section based on input data
 * and previously generated sections.
 */

import type {
  TCPSectionId,
  TCPRunnerInput,
  SectionState,
  ChatMessage,
  HITLVerifiedOutput,
  ExtractionOutput,
} from '../types';
import { SECTION_LABELS } from '../types';

/**
 * Build the prompt messages for a section
 */
export function buildSectionPrompt(
  sectionId: TCPSectionId,
  input: TCPRunnerInput,
  previousSections: Record<TCPSectionId, SectionState>,
  patientName: string
): ChatMessage[] {
  const systemPrompt = getSystemPrompt(sectionId);
  const inputContext = formatInputContext(input);
  const previousContext = formatPreviousContext(sectionId, previousSections);
  const instruction = getSectionInstruction(sectionId, patientName);

  const userPrompt = `
## Patient Input Data
${inputContext}

${previousContext}

## Your Task
${instruction}

IMPORTANT: Respond with ONLY valid JSON matching the schema. No markdown code blocks, no explanations.
`.trim();

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

/**
 * Get system prompt for each section
 */
function getSystemPrompt(sectionId: TCPSectionId): string {
  const basePrompt = `You are a medical aesthetics treatment planning assistant. You help create professional, patient-friendly Treatment Care Plans (TCPs) based on consultation data.

Your output must be:
- Clinically accurate and appropriate
- Written in a warm, professional tone
- Clear and understandable for patients
- Properly formatted as JSON`;

  const sectionPrompts: Record<TCPSectionId, string> = {
    immediate: `${basePrompt}

You are generating the "Immediate Intervention" section, which covers:
- Today's treatments that were performed or scheduled
- Post-care instructions for immediate aftercare
- Focus on what was done TODAY`,

    short_term: `${basePrompt}

You are generating the "Short-term Goals" section, which covers:
- Recommended treatments for the coming 2-6 weeks
- Follow-up appointment schedule
- Building on the immediate intervention`,

    long_term: `${basePrompt}

You are generating the "Long-term Strategy" section, which covers:
- Maintenance treatment schedule (ongoing treatments)
- Daily skincare routine recommendations (morning and evening)
- Sustainable long-term care plan`,

    safety: `${basePrompt}

You are generating the "Clinical Safety Protocols" section, which covers:
- Coordination requirements between providers or treatments
- Safety protocols and important warnings
- Any contraindications or precautions`,

    summary: `${basePrompt}

You are generating an "Executive Summary" for the patient, which should:
- Provide a brief, friendly overview of the entire treatment plan
- Highlight 3-5 key points
- Mention the next appointment if applicable
- Be encouraging and supportive`,
  };

  return sectionPrompts[sectionId];
}

/**
 * Get specific instruction for each section with JSON schema
 */
function getSectionInstruction(sectionId: TCPSectionId, patientName: string): string {
  const instructions: Record<TCPSectionId, string> = {
    immediate: `Generate the Immediate Intervention section for ${patientName || 'this patient'}.

Return JSON in this exact format:
{
  "focus": "Primary focus for today's visit (1-2 sentences)",
  "treatments": [
    {
      "id": "unique-id",
      "name": "Treatment name",
      "description": "Brief description of the treatment",
      "details": "Area treated or additional details",
      "cost": "Price as string (e.g., '$500' or 'Included')"
    }
  ]
}

Also include post_care_instructions as a separate array of strings.`,

    short_term: `Generate the Short-term Goals section for ${patientName || 'this patient'}.

Return JSON in this exact format:
{
  "focus": "Primary goal for the coming weeks (1-2 sentences)",
  "treatments": [
    {
      "id": "unique-id",
      "name": "Recommended treatment",
      "description": "Why this treatment is recommended",
      "details": "Area or additional notes",
      "cost": "Estimated price"
    }
  ],
  "follow_up_schedule": [
    {
      "event": "Type of appointment",
      "date": "Relative timing (e.g., '2 weeks from today')",
      "notes": "Optional notes"
    }
  ]
}`,

    long_term: `Generate the Long-term Strategy section for ${patientName || 'this patient'}.

Return JSON in this exact format:
{
  "focus": "Overall long-term maintenance strategy (1-2 sentences)",
  "maintenance_schedule": [
    {
      "treatment": "Treatment name",
      "frequency": "How often (e.g., 'Every 4-6 weeks')",
      "notes": "Optional notes"
    }
  ],
  "skincare_routine": {
    "morning": [
      {
        "product": "Product name or type",
        "purpose": "What it does",
        "estimated_cost": "Price estimate"
      }
    ],
    "evening": [
      {
        "product": "Product name or type",
        "purpose": "What it does",
        "estimated_cost": "Price estimate"
      }
    ]
  }
}

Set skincare_routine to null if not applicable.`,

    safety: `Generate the Clinical Safety Protocols section for ${patientName || 'this patient'}.

Return JSON in this exact format:
{
  "coordination_requirements": [
    "Any coordination needed between treatments or providers"
  ],
  "safety_protocols": [
    "Important safety instructions and warnings"
  ]
}

Include relevant safety information based on the treatments discussed.`,

    summary: `Generate an Executive Summary for ${patientName || 'this patient'}'s treatment plan.

Return JSON in this exact format:
{
  "overview": "A warm, encouraging 2-3 sentence overview of the treatment plan",
  "key_points": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "next_appointment": "When to schedule next visit, or null if not applicable"
}`,
  };

  return instructions[sectionId];
}

/**
 * Format input data for the prompt
 */
function formatInputContext(input: TCPRunnerInput): string {
  if (input.type === 'hitl') {
    return formatHITLContext(input.data);
  } else {
    return formatExtractionContext(input.data);
  }
}

/**
 * Format HITL verified output
 */
function formatHITLContext(hitl: HITLVerifiedOutput): string {
  const sections: string[] = [];

  // Patient summary
  sections.push(`### Patient Summary
- Primary Concern: ${hitl.patient_summary.primary_concern.value}
- Goals: ${hitl.patient_summary.goals.map((g) => g.value).join(', ')}
- Timeline: ${hitl.patient_summary.timeline.timeframe || 'Not specified'}`);

  // Today's treatments
  if (hitl.todays_treatments.length > 0) {
    const treatments = hitl.todays_treatments
      .filter((t) => t.included)
      .map((t) => `- ${t.name} (${t.area || 'N/A'}) - ${t.cost || 'N/A'}`)
      .join('\n');
    sections.push(`### Today's Treatments\n${treatments}`);
  }

  // Recommendations
  const included = hitl.recommendations.filter((r) => r.action === 'include');
  const future = hitl.recommendations.filter((r) => r.action === 'future');

  if (included.length > 0) {
    const recs = included.map((r) => `- ${r.name}: ${r.rationale}`).join('\n');
    sections.push(`### Recommendations (Include Now)\n${recs}`);
  }

  if (future.length > 0) {
    const recs = future.map((r) => `- ${r.name}: ${r.rationale}`).join('\n');
    sections.push(`### Future Recommendations\n${recs}`);
  }

  // Needs attention
  const { objections, hesitations, concerns } = hitl.needs_attention;
  if (objections.length > 0 || hesitations.length > 0 || concerns.length > 0) {
    const items: string[] = [];
    objections.forEach((o) => items.push(`- Objection (${o.type}): ${o.statement}`));
    hesitations.forEach((h) => items.push(`- Hesitation: ${h.statement}`));
    concerns.forEach((c) => items.push(`- Concern: ${c.concern}`));
    sections.push(`### Patient Concerns & Objections\n${items.join('\n')}`);
  }

  // Settings
  sections.push(`### TCP Settings
- Language Level: ${hitl.settings.language_level}
- Include Pricing: ${hitl.settings.include_pricing}
- Include Future Recommendations: ${hitl.settings.include_future}`);

  return sections.join('\n\n');
}

/**
 * Format raw extraction output
 */
function formatExtractionContext(extraction: ExtractionOutput): string {
  const p1 = extraction.prompt_1.parsed_json;
  const p2 = extraction.prompt_2.parsed_json;

  const sections: string[] = [];

  // Visit context
  sections.push(`### Visit Context
- Visit Type: ${p1.visit_context.visit_type}
- Reason: ${p1.visit_context.reason_for_visit}
- Referred By: ${p1.visit_context.referred_by || 'N/A'}`);

  // Patient goals
  sections.push(`### Patient Goals
- Primary Concern: ${p1.patient_goals.primary_concern}
- Goals: ${p1.patient_goals.goals.join(', ')}
- Anticipated Outcomes: ${p1.patient_goals.anticipated_outcomes.join(', ')}`);

  // Offerings discussed
  if (p1.offerings.length > 0) {
    const offerings = p1.offerings
      .map((o) => `- ${o.name} (${o.disposition}) - ${o.area || 'N/A'} - $${o.value || 'N/A'}`)
      .join('\n');
    sections.push(`### Products & Services Discussed\n${offerings}`);
  }

  // Outcome
  sections.push(`### Consultation Outcome
- Status: ${p2.outcome.status}
- Summary: ${p2.outcome.summary}`);

  // Next steps
  if (p2.next_steps.length > 0) {
    const steps = p2.next_steps
      .map((s) => `- ${s.action} (${s.owner || 'TBD'}) - ${s.timeframe || 'TBD'}`)
      .join('\n');
    sections.push(`### Next Steps\n${steps}`);
  }

  // Patient signals
  sections.push(`### Patient Signals
- Commitment Level: ${p2.patient_signals.commitment_level}`);

  // Objections/concerns
  if (p2.objections.length > 0 || p2.concerns.length > 0) {
    const items: string[] = [];
    p2.objections.forEach((o) => items.push(`- Objection (${o.type}): ${o.statement}`));
    p2.concerns.forEach((c) => items.push(`- Concern: ${c.concern}`));
    sections.push(`### Patient Concerns\n${items.join('\n')}`);
  }

  return sections.join('\n\n');
}

/**
 * Format previously generated sections for context
 */
function formatPreviousContext(
  currentSection: TCPSectionId,
  sections: Record<TCPSectionId, SectionState>
): string {
  const order: TCPSectionId[] = ['immediate', 'short_term', 'long_term', 'safety'];
  const currentIndex = order.indexOf(currentSection);

  if (currentIndex <= 0) return '';

  const completed = order
    .slice(0, currentIndex)
    .filter((id) => sections[id].status === 'completed' && sections[id].parsedContent)
    .map(
      (id) =>
        `### ${SECTION_LABELS[id]}\n${JSON.stringify(sections[id].parsedContent, null, 2)}`
    );

  if (completed.length === 0) return '';

  return `## Previously Generated Sections (for context)\n\n${completed.join('\n\n')}`;
}
