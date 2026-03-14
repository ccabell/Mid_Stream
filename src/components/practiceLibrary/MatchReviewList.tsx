/**
 * Match Review List
 *
 * Displays parsed items with suggested Global Library matches.
 * Allows users to accept, reject, or change suggested matches.
 */

import { useCallback } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import type { MatchResult, SelectedMatch, MatchCandidate } from 'utils/stringMatcher';
import { getConfidenceColor, getConfidenceLabel } from 'utils/stringMatcher';

interface MatchReviewListProps {
  matchResults: MatchResult[];
  selectedMatches: SelectedMatch[];
  onUpdateMatch: (index: number, match: SelectedMatch) => void;
}

export function MatchReviewList({
  matchResults,
  selectedMatches,
  onUpdateMatch,
}: MatchReviewListProps) {
  if (matchResults.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          No items to review. Please upload a file first.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {matchResults.map((result, index) => (
        <MatchReviewItem
          key={index}
          result={result}
          selected={selectedMatches[index]}
          onUpdate={(match) => onUpdateMatch(index, match)}
        />
      ))}
    </Box>
  );
}

interface MatchReviewItemProps {
  result: MatchResult;
  selected: SelectedMatch | undefined;
  onUpdate: (match: SelectedMatch) => void;
}

function MatchReviewItem({ result, selected, onUpdate }: MatchReviewItemProps) {
  const handleMatchChange = useCallback(
    (value: string) => {
      if (value === '__create_new__') {
        onUpdate({
          sourceIndex: selected?.sourceIndex ?? 0,
          match: null,
          createNew: true,
        });
      } else if (value === '__skip__') {
        onUpdate({
          sourceIndex: selected?.sourceIndex ?? 0,
          match: null,
          createNew: false,
        });
      } else {
        const matchCandidate = result.matches.find(
          (m) => `${m.type}:${m.item.id}` === value
        );
        onUpdate({
          sourceIndex: selected?.sourceIndex ?? 0,
          match: matchCandidate ?? null,
          createNew: false,
        });
      }
    },
    [result.matches, selected, onUpdate]
  );

  const currentValue = selected?.createNew
    ? '__create_new__'
    : selected?.match
      ? `${selected.match.type}:${selected.match.item.id}`
      : '__skip__';

  const isIncluded = selected?.match !== null || selected?.createNew;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {/* Source Item */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            From File
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {result.sourceItem.name}
          </Typography>
          {result.sourceItem.description && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {result.sourceItem.description}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            {result.sourceItem.category && (
              <Chip label={result.sourceItem.category} size="small" variant="outlined" />
            )}
            {result.sourceItem.price !== undefined && (
              <Chip label={`$${result.sourceItem.price}`} size="small" variant="outlined" />
            )}
          </Box>
        </Box>

        {/* Arrow */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'center',
            px: 1,
          }}
        >
          <ArrowForwardIcon color={isIncluded ? 'primary' : 'disabled'} />
        </Box>

        {/* Match Selection */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Match To
            </Typography>
            <Chip
              label={getConfidenceLabel(result.confidence)}
              size="small"
              color={getConfidenceColor(result.confidence) as 'success' | 'warning' | 'error' | 'default'}
            />
          </Box>

          <FormControl fullWidth size="small">
            <Select
              value={currentValue}
              onChange={(e) => handleMatchChange(e.target.value)}
              displayEmpty
            >
              {/* Best matches */}
              {result.matches.map((match) => (
                <MenuItem key={`${match.type}:${match.item.id}`} value={`${match.type}:${match.item.id}`}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Chip
                      label={match.type === 'service' ? 'Service' : 'Product'}
                      size="small"
                      color={match.type === 'service' ? 'info' : 'secondary'}
                      sx={{ minWidth: 70 }}
                    />
                    <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                      {match.item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {match.score}%
                    </Typography>
                  </Box>
                </MenuItem>
              ))}

              {/* Divider if there are matches */}
              {result.matches.length > 0 && (
                <MenuItem disabled sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    Other options
                  </Typography>
                </MenuItem>
              )}

              {/* Create new option */}
              <MenuItem value="__create_new__">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddIcon fontSize="small" color="success" />
                  <Typography variant="body2">Create new item</Typography>
                </Box>
              </MenuItem>

              {/* Skip option */}
              <MenuItem value="__skip__">
                <Typography variant="body2" color="text.secondary">
                  Skip (don't import)
                </Typography>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Show selected match details */}
          {selected?.match && (
            <Box sx={{ mt: 1, pl: 1, borderLeft: '2px solid', borderColor: 'primary.main' }}>
              <Typography variant="body2" color="text.secondary" noWrap>
                {selected.match.item.description ?? 'No description'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Matched on: {selected.match.matchedOn.join(', ')}
              </Typography>
            </Box>
          )}

          {selected?.createNew && (
            <Box sx={{ mt: 1, pl: 1, borderLeft: '2px solid', borderColor: 'success.main' }}>
              <Typography variant="body2" color="success.main">
                Will create as new practice library item
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
