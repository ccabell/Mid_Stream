/**
 * CardRenderer Component
 *
 * Renders extraction cards based on their type.
 * Matches ie-interface styling for consistency.
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
import type { Card as CardData } from 'utils/runOutputToCards';
import { formatCurrency } from 'utils/normalize';

function wrap(title: string, body: React.ReactNode) {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
          {title}
        </Typography>
        {body}
      </CardContent>
    </Card>
  );
}

export function CardRenderer({ card }: { card: CardData }) {
  switch (card.type) {
    case 'summary':
      return wrap(
        card.title,
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {card.summary ?? 'No summary extracted.'}
        </Typography>
      );

    case 'value_metrics':
      if (card.isEmpty) {
        return wrap(
          card.title,
          <Typography variant="body2" color="text.secondary">
            No value data (offerings not matched to catalog)
          </Typography>
        );
      }
      return wrap(
        card.title,
        <Box>
          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="success.main">
                Realized
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(card.realizedValue)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="info.main">
                Committed
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(card.committedValue)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="warning.main">
                Potential
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(card.potentialValue)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Total opportunity
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(card.totalOpportunityValue)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      );

    case 'kpi_intent':
      return wrap(
        card.title,
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, card.percentage ?? 0))}
            sx={{ flex: 1, height: 8, borderRadius: 1 }}
          />
          <Typography variant="body2" fontWeight={600}>
            {card.percentage ?? 0}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({card.label})
          </Typography>
        </Box>
      );

    case 'visit_checklist':
      return wrap(
        card.title,
        <List dense disablePadding>
          {card.items.map((item, i) => (
            <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
              <ListItemText
                primary={item.label}
                secondary={
                  item.completed === true
                    ? 'Yes'
                    : item.completed === false
                      ? 'No'
                      : '—'
                }
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
          {card.items.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No visit checklist for this visit type
            </Typography>
          )}
        </List>
      );

    case 'visit_context': {
      const vc = card;
      return wrap(
        vc.title,
        <Box>
          {vc.visitType && (
            <Typography variant="body2">
              <strong>Visit type:</strong> {vc.visitType}
            </Typography>
          )}
          {vc.reasonForVisit && (
            <Typography variant="body2">
              <strong>Reason for visit:</strong> {vc.reasonForVisit}
            </Typography>
          )}
          {vc.referredBy && (
            <Typography variant="body2">
              <strong>Referred by:</strong> {vc.referredBy}
            </Typography>
          )}
          {vc.referrals && (
            <Typography variant="body2">
              <strong>Referrals:</strong> {vc.referrals}
            </Typography>
          )}
          {vc.motivatingEvent && (
            <Typography variant="body2">
              <strong>Motivating event:</strong> {vc.motivatingEvent}
            </Typography>
          )}
          {!vc.visitType &&
            !vc.reasonForVisit &&
            !vc.referredBy &&
            !vc.referrals &&
            !vc.motivatingEvent && (
              <Typography variant="body2" color="text.secondary">
                No visit context
              </Typography>
            )}
        </Box>
      );
    }

    case 'patient_goals': {
      const pg = card;
      const hasAny =
        (pg.primaryConcern && pg.primaryConcern.trim()) ||
        pg.secondaryConcerns.length > 0 ||
        pg.goals.length > 0 ||
        pg.anticipatedOutcomes.length > 0 ||
        pg.treatmentAreas.length > 0 ||
        pg.statedInterests.length > 0 ||
        pg.futureInterests.length > 0;
      return wrap(
        pg.title,
        <Box>
          {pg.primaryConcern && pg.primaryConcern.trim() && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Primary concern:</strong> {pg.primaryConcern}
            </Typography>
          )}
          {pg.secondaryConcerns.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Secondary concerns
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {pg.secondaryConcerns.map((c) => (
                  <Chip key={c} label={c} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
          {pg.goals.length > 0 && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Goals:</strong> {pg.goals.join(', ')}
            </Typography>
          )}
          {pg.anticipatedOutcomes.length > 0 && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Anticipated outcomes:</strong> {pg.anticipatedOutcomes.join(', ')}
            </Typography>
          )}
          {pg.treatmentAreas.length > 0 && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Treatment areas:</strong> {pg.treatmentAreas.join(', ')}
            </Typography>
          )}
          {pg.statedInterests.length > 0 && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Stated interests:</strong> {pg.statedInterests.join(', ')}
            </Typography>
          )}
          {pg.futureInterests.length > 0 && (
            <Typography variant="body2">
              <strong>Future interests:</strong>{' '}
              {pg.futureInterests
                .map((fi) =>
                  fi.interestLevel ? `${fi.interest} (${fi.interestLevel})` : fi.interest
                )
                .join('; ')}
            </Typography>
          )}
          {!hasAny && (
            <Typography variant="body2" color="text.secondary">
              No goals extracted
            </Typography>
          )}
        </Box>
      );
    }

    case 'offerings':
      return wrap(
        card.title,
        <Box>
          {card.groups.map((g, i) => (
            <Box key={i} sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {g.label}
              </Typography>
              <List dense disablePadding>
                {g.offerings.map((o, j) => (
                  <ListItem key={j} disablePadding>
                    <ListItemText
                      primary={o.name}
                      secondary={
                        o.disposition + (o.value != null ? ` · ${formatCurrency(o.value)}` : '')
                      }
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}
          <Typography variant="body2" fontWeight={600}>
            Potential value: {formatCurrency(card.valueMetrics.potentialValue)}
          </Typography>
          {card.groups.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No offerings
            </Typography>
          )}
        </Box>
      );

    case 'opportunities': {
      const oppCard = card;
      return wrap(
        oppCard.title,
        <Box>
          {oppCard.opportunitiesSummary && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              {oppCard.opportunitiesSummary}
            </Typography>
          )}
          {oppCard.items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No opportunities (interest but not booked)
            </Typography>
          ) : (
            <List dense disablePadding>
              {oppCard.items.map((o, i) => (
                <ListItem
                  key={i}
                  disablePadding
                  sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <ListItemText
                    primary={o.name}
                    secondary={
                      <>
                        {o.blurb}
                        {o.value != null && ` · ${formatCurrency(o.value)}`}
                      </>
                    }
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      );
    }

    case 'next_steps':
      return wrap(
        card.title,
        <List dense disablePadding>
          {card.steps.map((s, i) => (
            <ListItem key={i} disablePadding>
              <ListItemText
                primary={s.action}
                secondary={[s.timing, s.owner].filter(Boolean).join(' · ')}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
          {card.steps.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No next steps
            </Typography>
          )}
        </List>
      );

    case 'cross_sell_effort': {
      const cse = card;
      return wrap(
        cse.title,
        <Typography variant="body2">
          Did the provider attempt to present cross-sell/upsell? <strong>{cse.label}</strong>
        </Typography>
      );
    }

    case 'objections':
      return wrap(
        card.title,
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
            {card.resolvedCount} of {card.totalCount} resolved/addressed. Use &quot;Reveal
            suggestion&quot; for coaching responses.
          </Typography>
          <List dense disablePadding>
            {card.items.map((o, i) => (
              <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                <ListItemText
                  primary={[o.kind, o.typeOrTopic].filter(Boolean).join(': ')}
                  secondary={
                    o.statement
                      ? `${o.statement.slice(0, 60)}${o.statement.length > 60 ? '…' : ''} · ${o.resolvedLabel}`
                      : o.resolvedLabel
                  }
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
          {card.items.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No objections, hesitations, or concerns
            </Typography>
          )}
        </Box>
      );

    default:
      return null;
  }
}
