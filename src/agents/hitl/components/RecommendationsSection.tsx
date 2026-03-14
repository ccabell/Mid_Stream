/**
 * Recommendations Section
 *
 * Displays AI-generated recommendations with priority scores and actions.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TodayIcon from '@mui/icons-material/Today';
import EventIcon from '@mui/icons-material/Event';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { RecommendationDraft } from '../types';

interface RecommendationsSectionProps {
  recommendations: RecommendationDraft[];
  onSetAction: (id: string, action: RecommendationDraft['action']) => void;
}

export function RecommendationsSection({
  recommendations,
  onSetAction,
}: RecommendationsSectionProps) {
  const [showLowerTier, setShowLowerTier] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Split recommendations by tier
  const tier1And2 = recommendations.filter(r => r.tier === 1 || r.tier === 2);
  const tier3And4 = recommendations.filter(r => r.tier === 3 || r.tier === 4);

  const toggleExpanded = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getPriorityColor = (score: number): 'success' | 'info' | 'warning' | 'error' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const renderRecommendation = (rec: RecommendationDraft) => {
    const isExpanded = expandedId === rec.id;
    const priorityColor = getPriorityColor(rec.priorityScore);

    return (
      <Box
        key={rec.id}
        sx={{
          p: 2,
          border: 1,
          borderColor: rec.action ? 'primary.main' : 'divider',
          borderRadius: 1,
          bgcolor: rec.action === 'include' ? 'success.50' :
                   rec.action === 'future' ? 'info.50' :
                   rec.action === 'dismissed' ? 'action.disabledBackground' : 'transparent',
          opacity: rec.action === 'dismissed' ? 0.6 : 1,
        }}
      >
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* Priority Score */}
          <Box sx={{ width: 60, textAlign: 'center' }}>
            <Typography
              variant="h5"
              fontWeight={700}
              color={`${priorityColor}.main`}
            >
              {rec.priorityScore}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={rec.priorityScore}
              color={priorityColor}
              sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
            />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <Typography variant="subtitle1" fontWeight={600}>
                {rec.name}
              </Typography>
              <Chip
                label={rec.type}
                size="small"
                variant="outlined"
              />
              {rec.tier === 1 && (
                <Chip label="Top Pick" size="small" color="success" />
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {rec.rationale}
            </Typography>

            {rec.patientReception && (
              <Typography
                variant="body2"
                sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}
              >
                Patient: "{rec.patientReception}"
              </Typography>
            )}

            {/* Expanded Details */}
            <Collapse in={isExpanded}>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                {/* Score Breakdown */}
                <Typography variant="subtitle2" gutterBottom>
                  Score Breakdown
                </Typography>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" sx={{ width: 120 }}>
                      Patient Benefit
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={rec.scores.patientBenefit}
                      sx={{ flex: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" fontWeight={500} sx={{ width: 30 }}>
                      {rec.scores.patientBenefit}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" sx={{ width: 120 }}>
                      Clinical Viability
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={rec.scores.clinicalViability}
                      sx={{ flex: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" fontWeight={500} sx={{ width: 30 }}>
                      {rec.scores.clinicalViability}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" sx={{ width: 120 }}>
                      Practice Value
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={rec.scores.practiceValue}
                      sx={{ flex: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" fontWeight={500} sx={{ width: 30 }}>
                      {rec.scores.practiceValue}
                    </Typography>
                  </Stack>
                </Stack>

                {/* Talking Points */}
                {rec.talkingPoints.length > 0 && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Talking Points
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {rec.talkingPoints.map((point, i) => (
                        <li key={i}>
                          <Typography variant="body2">{point}</Typography>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Synergies */}
                {rec.synergies.length > 0 && (
                  <>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Synergies
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {rec.synergies.map((synergy, i) => (
                        <Chip key={i} label={synergy} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </>
                )}
              </Box>
            </Collapse>
          </Box>

          {/* Actions */}
          <Stack direction="column" spacing={1} alignItems="flex-end">
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Include in today's plan">
                <Button
                  onClick={() => onSetAction(rec.id, rec.action === 'include' ? null : 'include')}
                  variant={rec.action === 'include' ? 'contained' : 'outlined'}
                  color="success"
                >
                  <TodayIcon fontSize="small" />
                </Button>
              </Tooltip>
              <Tooltip title="Save for future">
                <Button
                  onClick={() => onSetAction(rec.id, rec.action === 'future' ? null : 'future')}
                  variant={rec.action === 'future' ? 'contained' : 'outlined'}
                  color="info"
                >
                  <EventIcon fontSize="small" />
                </Button>
              </Tooltip>
              <Tooltip title="Dismiss">
                <Button
                  onClick={() => onSetAction(rec.id, rec.action === 'dismissed' ? null : 'dismissed')}
                  variant={rec.action === 'dismissed' ? 'contained' : 'outlined'}
                  color="error"
                >
                  <CloseIcon fontSize="small" />
                </Button>
              </Tooltip>
            </ButtonGroup>

            <IconButton size="small" onClick={() => toggleExpanded(rec.id)}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    );
  };

  const includedCount = recommendations.filter(r => r.action === 'include').length;
  const futureCount = recommendations.filter(r => r.action === 'future').length;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">
              Additional Opportunities
            </Typography>
            <Tooltip title="AI-generated recommendations based on patient concerns and practice offerings">
              <InfoOutlinedIcon fontSize="small" color="action" />
            </Tooltip>
          </Stack>

          {(includedCount > 0 || futureCount > 0) && (
            <Stack direction="row" spacing={1}>
              {includedCount > 0 && (
                <Chip
                  label={`${includedCount} for today`}
                  size="small"
                  color="success"
                />
              )}
              {futureCount > 0 && (
                <Chip
                  label={`${futureCount} for later`}
                  size="small"
                  color="info"
                />
              )}
            </Stack>
          )}
        </Box>

        {recommendations.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No additional recommendations at this time.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Top tier recommendations */}
            <Stack spacing={2}>
              {tier1And2.map(renderRecommendation)}
            </Stack>

            {/* Lower tier recommendations (collapsible) */}
            {tier3And4.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Button
                  onClick={() => setShowLowerTier(!showLowerTier)}
                  endIcon={showLowerTier ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{ mb: 1 }}
                >
                  {showLowerTier ? 'Hide' : 'Show'} {tier3And4.length} lower priority suggestions
                </Button>

                <Collapse in={showLowerTier}>
                  <Stack spacing={2}>
                    {tier3And4.map(renderRecommendation)}
                  </Stack>
                </Collapse>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
