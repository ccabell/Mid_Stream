/**
 * CardRenderer Component
 *
 * Renders extraction cards based on their type.
 * Uses the card data from runOutputToCards utility.
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import type { Card as CardData } from 'utils/runOutputToCards';
import { formatCurrency } from 'utils/normalize';

interface CardWrapperProps {
  title: string;
  children: React.ReactNode;
}

function CardWrapper({ title, children }: CardWrapperProps) {
  return (
    <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

function ChecklistStatusIcon({ completed }: { completed: boolean | null }) {
  if (completed === true) {
    return <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />;
  }
  if (completed === false) {
    return <CancelIcon sx={{ fontSize: 18, color: 'error.main' }} />;
  }
  return <RemoveCircleOutlineIcon sx={{ fontSize: 18, color: 'text.disabled' }} />;
}

export function CardRenderer({ card }: { card: CardData }) {
  switch (card.type) {
    case 'summary':
      return (
        <CardWrapper title={card.title}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {card.summary ?? 'No summary extracted.'}
          </Typography>
        </CardWrapper>
      );

    case 'value_metrics':
      if (card.isEmpty) {
        return (
          <CardWrapper title={card.title}>
            <Typography variant="body2" color="text.secondary">
              No value data (offerings not matched to catalog)
            </Typography>
          </CardWrapper>
        );
      }
      return (
        <CardWrapper title={card.title}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                Realized
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatCurrency(card.realizedValue)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="info.main" sx={{ fontWeight: 600 }}>
                Committed
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatCurrency(card.committedValue)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                Potential
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatCurrency(card.potentialValue)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Total Opportunity
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatCurrency(card.totalOpportunityValue)}
              </Typography>
            </Grid>
          </Grid>
        </CardWrapper>
      );

    case 'kpi_intent':
      return (
        <CardWrapper title={card.title}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, card.percentage ?? 0))}
              sx={{
                flex: 1,
                height: 10,
                borderRadius: 5,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundColor:
                    (card.percentage ?? 0) >= 75 ? 'success.main' :
                    (card.percentage ?? 0) >= 50 ? 'warning.main' : 'error.main',
                },
              }}
            />
            <Typography variant="h6" fontWeight={700} sx={{ minWidth: 50 }}>
              {card.percentage ?? 0}%
            </Typography>
            <Chip
              label={card.label}
              size="small"
              sx={{
                fontWeight: 600,
                backgroundColor:
                  (card.percentage ?? 0) >= 75 ? '#dcfce7' :
                  (card.percentage ?? 0) >= 50 ? '#fef9c3' : '#fee2e2',
                color:
                  (card.percentage ?? 0) >= 75 ? '#166534' :
                  (card.percentage ?? 0) >= 50 ? '#854d0e' : '#991b1b',
              }}
            />
          </Box>
        </CardWrapper>
      );

    case 'visit_checklist':
      return (
        <CardWrapper title={card.title}>
          {card.items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No visit checklist for this visit type
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {card.items.map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.25,
                    borderRadius: 1.5,
                    backgroundColor: item.completed === true ? '#f0fdf4' : item.completed === false ? '#fef2f2' : '#f9fafb',
                  }}
                >
                  <ChecklistStatusIcon completed={item.completed} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                    {item.evidence && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        "{item.evidence}"
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardWrapper>
      );

    case 'visit_context':
      return (
        <CardWrapper title={card.title}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {card.visitType && (
              <Box>
                <Typography variant="caption" color="text.secondary">Visit Type</Typography>
                <Typography variant="body2" fontWeight={500}>{card.visitType}</Typography>
              </Box>
            )}
            {card.reasonForVisit && (
              <Box>
                <Typography variant="caption" color="text.secondary">Reason for Visit</Typography>
                <Typography variant="body2">{card.reasonForVisit}</Typography>
              </Box>
            )}
            {card.referredBy && (
              <Box>
                <Typography variant="caption" color="text.secondary">Referred By</Typography>
                <Typography variant="body2">{card.referredBy}</Typography>
              </Box>
            )}
            {card.motivatingEvent && (
              <Box>
                <Typography variant="caption" color="text.secondary">Motivating Event</Typography>
                <Typography variant="body2">{card.motivatingEvent}</Typography>
              </Box>
            )}
            {!card.visitType && !card.reasonForVisit && !card.referredBy && !card.motivatingEvent && (
              <Typography variant="body2" color="text.secondary">No visit context</Typography>
            )}
          </Box>
        </CardWrapper>
      );

    case 'patient_goals': {
      const hasAny =
        card.primaryConcern ||
        card.secondaryConcerns.length > 0 ||
        card.goals.length > 0 ||
        card.anticipatedOutcomes.length > 0 ||
        card.treatmentAreas.length > 0 ||
        card.statedInterests.length > 0 ||
        card.futureInterests.length > 0;

      return (
        <CardWrapper title={card.title}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {card.primaryConcern && (
              <Box>
                <Typography variant="caption" color="text.secondary">Primary Concern</Typography>
                <Typography variant="body2" fontWeight={500}>{card.primaryConcern}</Typography>
              </Box>
            )}
            {card.secondaryConcerns.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">Secondary Concerns</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {card.secondaryConcerns.map((c, i) => (
                    <Chip key={i} label={c} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}
            {card.goals.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">Goals</Typography>
                <Typography variant="body2">{card.goals.join(', ')}</Typography>
              </Box>
            )}
            {card.treatmentAreas.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">Treatment Areas</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {card.treatmentAreas.map((a, i) => (
                    <Chip key={i} label={a} size="small" color="primary" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}
            {card.futureInterests.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">Future Interests</Typography>
                <Typography variant="body2">
                  {card.futureInterests.map((fi) =>
                    fi.interestLevel ? `${fi.interest} (${fi.interestLevel})` : fi.interest
                  ).join('; ')}
                </Typography>
              </Box>
            )}
            {!hasAny && (
              <Typography variant="body2" color="text.secondary">No goals extracted</Typography>
            )}
          </Box>
        </CardWrapper>
      );
    }

    case 'offerings':
      return (
        <CardWrapper title={card.title}>
          {card.groups.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No offerings</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {card.groups.map((group, i) => (
                <Box key={i}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                    {group.label}
                  </Typography>
                  <List dense disablePadding>
                    {group.offerings.map((o, j) => (
                      <ListItem key={j} disablePadding sx={{ py: 0.25 }}>
                        <ListItemText
                          primary={o.name}
                          secondary={o.value != null ? formatCurrency(o.value) : undefined}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                          secondaryTypographyProps={{ variant: 'body2', color: 'success.main', fontWeight: 600 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
              <Box sx={{ mt: 1, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={600}>
                  Potential value: <span style={{ color: '#16a34a' }}>{formatCurrency(card.valueMetrics.potentialValue)}</span>
                </Typography>
              </Box>
            </Box>
          )}
        </CardWrapper>
      );

    case 'opportunities':
      return (
        <CardWrapper title={card.title}>
          {card.opportunitiesSummary && (
            <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
              {card.opportunitiesSummary}
            </Typography>
          )}
          {card.items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No opportunities (interest but not booked)
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {card.items.map((o, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    backgroundColor: '#eff6ff',
                    borderLeft: '3px solid',
                    borderColor: 'primary.main',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="body2" fontWeight={600}>{o.name}</Typography>
                    {o.value != null && (
                      <Chip
                        label={formatCurrency(o.value)}
                        size="small"
                        sx={{ fontWeight: 600, backgroundColor: '#dcfce7', color: '#166534' }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {o.blurb}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardWrapper>
      );

    case 'next_steps':
      return (
        <CardWrapper title={card.title}>
          {card.steps.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No next steps</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {card.steps.map((s, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: 1.25,
                    borderRadius: 1.5,
                    backgroundColor: 'grey.50',
                  }}
                >
                  <Chip
                    label={s.owner}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 11,
                      fontWeight: 600,
                      backgroundColor: s.owner === 'patient' ? '#ede9fe' : s.owner === 'provider' ? '#dbeafe' : '#f3f4f6',
                      color: s.owner === 'patient' ? '#6366f1' : s.owner === 'provider' ? '#2563eb' : '#374151',
                    }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{s.action}</Typography>
                    {s.timing && (
                      <Typography variant="caption" color="text.secondary">{s.timing}</Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardWrapper>
      );

    case 'objections':
      return (
        <CardWrapper title={card.title}>
          {card.items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No objections, hesitations, or concerns
            </Typography>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                {card.resolvedCount} of {card.totalCount} resolved/addressed
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {card.items.map((o, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 1.25,
                      borderRadius: 1.5,
                      backgroundColor: o.resolved === true ? '#f0fdf4' : o.resolved === false ? '#fef2f2' : '#f9fafb',
                      borderLeft: '3px solid',
                      borderColor: o.resolved === true ? 'success.main' : o.resolved === false ? 'error.main' : 'grey.400',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {o.kind}: {o.typeOrTopic}
                      </Typography>
                      <Chip
                        label={o.resolvedLabel}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          fontWeight: 600,
                          backgroundColor: o.resolved === true ? '#166534' : o.resolved === false ? '#dc2626' : '#6b7280',
                          color: 'white',
                        }}
                      />
                    </Box>
                    {o.statement && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        "{o.statement}"
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </>
          )}
        </CardWrapper>
      );

    case 'cross_sell_effort':
      return (
        <CardWrapper title={card.title}>
          <Typography variant="body2">
            Did the provider attempt to present cross-sell/upsell?{' '}
            <strong>{card.label}</strong>
          </Typography>
        </CardWrapper>
      );

    default:
      return null;
  }
}
