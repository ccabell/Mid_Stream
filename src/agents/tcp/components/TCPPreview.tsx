/**
 * TCP Preview (Production-style)
 *
 * Displays the final generated TCP document using block-based rendering.
 */

import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import PrintIcon from '@mui/icons-material/Print';

import type { TCPDocument, TreatmentCarePlan } from '../types';
import { AICard } from './AICard';
import { AIHeading } from './AIHeading';
import { AIText } from './AIText';
import { FollowUpTimeline } from './FollowUpTimeline';
import { TCPHeader } from './TCPHeader';

interface TCPPreviewProps {
  document: TCPDocument;
  onPrint?: () => void;
}

// Print-safe wrapper component
function PrintSafeBlock({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ '@media print': { breakInside: 'avoid', pageBreakInside: 'avoid' } }}>
      {children}
    </Box>
  );
}

// Section wrapper with border styling
interface SectionProps {
  heading: { title: string; subtitle?: string };
  children: React.ReactNode;
  hasMoreContent?: boolean;
}

function Section({ heading, children, hasMoreContent }: SectionProps) {
  return (
    <Stack>
      <PrintSafeBlock>
        <Stack gap={3}>
          <AIHeading title={heading.title} subtitle={heading.subtitle} size="large" />
          <Stack
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              borderBottomLeftRadius: hasMoreContent ? 0 : '12px',
              borderBottomRightRadius: hasMoreContent ? 0 : '12px',
              borderBottom: hasMoreContent ? 'none' : '1px solid',
              p: 2,
              pb: 3,
              mt: 3,
            }}
          >
            {children}
          </Stack>
        </Stack>
      </PrintSafeBlock>
    </Stack>
  );
}

function SectionContinuation({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderTop: 'none',
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px',
        p: 2,
        pt: 0,
      }}
    >
      <Stack gap={3}>{children}</Stack>
    </Box>
  );
}

// Card group renderer
interface CardGroupProps {
  title?: string;
  cards: Array<{ title: string; price?: string; items: Array<{ label: string; value: string }> }>;
  emptyText?: string;
}

function CardGroup({ title, cards, emptyText }: CardGroupProps) {
  if (cards.length === 0) {
    return (
      <Stack gap={1}>
        {title && <AIHeading title={title} size="medium" />}
        <Typography variant="body2" fontWeight={400}>
          {emptyText || 'No items'}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack gap={1}>
      {title && <AIHeading title={title} size="medium" />}
      <Stack gap={3}>
        {cards.map((card, index) => (
          <PrintSafeBlock key={index}>
            <AICard title={card.title} price={card.price} items={card.items} />
          </PrintSafeBlock>
        ))}
      </Stack>
    </Stack>
  );
}

// Table renderer
interface MaintenanceTableProps {
  title?: string;
  rows: Array<{ treatment: string; frequency: string }>;
  emptyText?: string;
}

function MaintenanceTable({ title, rows, emptyText }: MaintenanceTableProps) {
  if (rows.length === 0) {
    return (
      <Stack gap={1}>
        {title && <AIHeading title={title} size="medium" />}
        <Typography variant="body2" fontWeight={400}>
          {emptyText || 'No items'}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack gap={1}>
      {title && <AIHeading title={title} size="medium" />}
      <TableContainer
        sx={{
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
          '@media print': {
            overflow: 'visible !important',
            '& thead': { display: 'table-header-group' },
            '& tr': { breakInside: 'avoid', pageBreakInside: 'avoid' },
          },
        }}
      >
        <Table size="medium">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>Treatment</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Frequency</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.treatment}</TableCell>
                <TableCell>{row.frequency}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

// List renderer
interface ListSectionProps {
  title?: string;
  items: string[];
  emptyText?: string;
}

function ListSection({ title, items, emptyText }: ListSectionProps) {
  return (
    <Stack gap={0.5}>
      {title && <AIHeading title={title} size="medium" />}
      {items.length === 0 ? (
        <AIText value={emptyText || ''} />
      ) : (
        <AIText value={items} variant="list" />
      )}
    </Stack>
  );
}

// Build treatment cards from array
function buildTreatmentCards(treatments: Array<{ name: string; description: string; details: string; cost: string }>) {
  return treatments.map(t => ({
    title: t.name,
    price: t.cost,
    items: [
      { label: 'Description', value: t.description },
      { label: 'Details', value: t.details },
    ],
  }));
}

// Build skincare cards
function buildSkincareCards(steps: Array<{ product: string; purpose: string; estimated_cost: string }>) {
  return steps.map(s => ({
    title: s.product,
    price: s.estimated_cost,
    items: [{ label: 'Purpose', value: s.purpose }],
  }));
}

// Main component
export const TCPPreview = forwardRef<HTMLDivElement, TCPPreviewProps>(function TCPPreview(
  { document, onPrint },
  ref
) {
  const tcp = document.treatment_care_plan;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const documentInfo = {
    document: 'Treatment & Care Plan',
    patient: document.patient,
    provider: document.provider,
    date: document.consultation_date,
  };

  const immediateTreatments = buildTreatmentCards(tcp.immediate_intervention.treatments);
  const shortTermTreatments = buildTreatmentCards(tcp.short_term_goals.treatments);
  const followUpEvents = tcp.short_term_goals.follow_up_schedule.map((e, i) => ({
    step: i + 1,
    date: e.date,
    title: e.event,
  }));
  const morningCards = tcp.long_term_strategy.skincare_routine
    ? buildSkincareCards(tcp.long_term_strategy.skincare_routine.morning)
    : [];
  const eveningCards = tcp.long_term_strategy.skincare_routine
    ? buildSkincareCards(tcp.long_term_strategy.skincare_routine.evening)
    : [];

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Header Actions */}
      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mb: 3 }}>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
          Print
        </Button>
      </Stack>

      {/* Document Content */}
      <Stack
        ref={ref}
        gap={3}
        sx={{
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
          boxShadow: 1,
          '@page': { margin: '5mm' },
          '@media print': {
            px: 1,
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
            boxShadow: 'none',
            borderRadius: 0,
          },
        }}
      >
        {/* Header */}
        <TCPHeader documentInfo={documentInfo} />

        {/* Immediate Intervention */}
        <Section
          heading={{
            title: 'Immediate Intervention',
            subtitle: tcp.immediate_intervention.focus,
          }}
          hasMoreContent={tcp.post_care_instructions.length > 0}
        >
          <CardGroup
            title="Treatments"
            cards={immediateTreatments}
            emptyText="No treatments"
          />
        </Section>

        {tcp.post_care_instructions.length > 0 && (
          <SectionContinuation>
            <ListSection
              title="Post-care Instructions"
              items={tcp.post_care_instructions}
              emptyText="No post-care instructions"
            />
          </SectionContinuation>
        )}

        {/* Short-term Goals */}
        <Section
          heading={{
            title: 'Short-term Goals',
            subtitle: tcp.short_term_goals.focus,
          }}
          hasMoreContent={followUpEvents.length > 0}
        >
          <CardGroup
            title="Treatments"
            cards={shortTermTreatments}
            emptyText="No treatments"
          />
        </Section>

        {followUpEvents.length > 0 && (
          <SectionContinuation>
            <Stack gap={0.5}>
              <AIHeading title="Follow-up schedule" size="medium" />
              <FollowUpTimeline events={followUpEvents} />
            </Stack>
          </SectionContinuation>
        )}

        {/* Long-term Strategy */}
        <Section
          heading={{
            title: 'Long-term Strategy',
            subtitle: tcp.long_term_strategy.focus,
          }}
          hasMoreContent={tcp.long_term_strategy.skincare_routine !== null}
        >
          <MaintenanceTable
            title="Maintenance schedule"
            rows={tcp.long_term_strategy.maintenance_schedule}
            emptyText="No maintenance schedule"
          />
        </Section>

        {tcp.long_term_strategy.skincare_routine && (
          <SectionContinuation>
            <AIHeading title="Skincare Routine" size="medium" />
            <CardGroup
              title="Morning"
              cards={morningCards}
              emptyText="No morning routine"
            />
            <CardGroup
              title="Evening"
              cards={eveningCards}
              emptyText="No evening routine"
            />
          </SectionContinuation>
        )}

        {/* Clinical Safety Protocols */}
        <Section
          heading={{ title: 'Clinical Safety Protocols' }}
          hasMoreContent={tcp.clinical_safety_protocols.safety_protocols.length > 0}
        >
          <ListSection
            title="Coordination requirements"
            items={tcp.clinical_safety_protocols.coordination_requirements}
            emptyText="No coordination requirements"
          />
        </Section>

        {tcp.clinical_safety_protocols.safety_protocols.length > 0 && (
          <SectionContinuation>
            <ListSection
              title="Safety protocols"
              items={tcp.clinical_safety_protocols.safety_protocols}
              emptyText="No safety protocols"
            />
          </SectionContinuation>
        )}

        {/* Footer */}
        <Box sx={{ textAlign: 'center', color: 'text.secondary', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption">
            Generated on {new Date().toLocaleDateString()} | Version {document.metadata?.version || 1}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
});
