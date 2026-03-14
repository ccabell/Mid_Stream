/**
 * Card System Components
 *
 * A foundational UI abstraction layer for rendering structured
 * transcript-derived data in consistent, interpretable ways.
 *
 * Card Types:
 * - SummaryCard: Plain-language summary (Type 1)
 * - AccordionCard: Concise value with expandable details (Type 2)
 * - InsightCard: Summary + values + evidence snippets (Type 3)
 * - KPICard: Specialized score display with progress bar
 * - OfferingCard: Product/service with disposition and value
 * - EvidenceQuote: Transcript snippet with speaker attribution
 */

export { SummaryCard } from './SummaryCard';
export type { SummaryCardProps } from './SummaryCard';

export { AccordionCard } from './AccordionCard';
export type { AccordionCardProps } from './AccordionCard';

export { InsightCard } from './InsightCard';
export type { InsightCardProps, InsightValue, InsightEvidence } from './InsightCard';

export { KPICard } from './KPICard';
export type { KPICardProps, KPIEvidence } from './KPICard';

export { OfferingCard, OfferingList } from './OfferingCard';
export type { OfferingCardProps, OfferingListProps } from './OfferingCard';

export { EvidenceQuote, EvidenceList } from './EvidenceQuote';
export type { EvidenceQuoteProps, EvidenceListProps } from './EvidenceQuote';
