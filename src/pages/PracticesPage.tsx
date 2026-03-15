/**
 * Practices Management Page
 *
 * View and manage practices. Shows practice list with stats and quick actions.
 */

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { runsApi, practicesApi } from 'apiServices';
import type { Run, Practice } from 'apiServices';
import { ROUTES } from 'constants/routes';

interface PracticeStats {
  totalRuns: number;
  completedRuns: number;
  hitlVerifiedRuns: number;
}

function getConfigLevelLabel(level: number | undefined): string {
  switch (level) {
    case 0:
      return 'Default';
    case 1:
      return 'Basic';
    case 2:
      return 'Standard';
    case 3:
      return 'Full';
    default:
      return 'Unknown';
  }
}

function getConfigLevelColor(level: number | undefined): 'default' | 'info' | 'primary' | 'success' {
  switch (level) {
    case 0:
      return 'default';
    case 1:
      return 'info';
    case 2:
      return 'primary';
    case 3:
      return 'success';
    default:
      return 'default';
  }
}

interface PracticeCardProps {
  practice: Practice & { config_level?: number; is_active?: boolean };
  stats: PracticeStats | undefined;
  onViewLibrary: () => void;
  onViewRuns: () => void;
}

function PracticeCard({ practice, stats, onViewLibrary, onViewRuns }: PracticeCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        transition: 'all 200ms ease',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BusinessIcon sx={{ fontSize: 26, color: 'white' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {practice.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={getConfigLevelLabel(practice.config_level)}
                size="small"
                color={getConfigLevelColor(practice.config_level)}
                sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
              />
              {practice.is_active === false && (
                <Chip
                  label="Inactive"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 10,
                    fontWeight: 600,
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Stats */}
        {stats && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1.5,
              mb: 2,
              p: 1.5,
              borderRadius: 1,
              backgroundColor: 'grey.50',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>
                {stats.totalRuns}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                Total Runs
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main', lineHeight: 1 }}>
                {stats.completedRuns}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                Completed
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main', lineHeight: 1 }}>
                {stats.hitlVerifiedRuns}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                HITL Verified
              </Typography>
            </Box>
          </Box>
        )}

        {/* Slug/ID */}
        {practice.slug && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontFamily: 'monospace',
              fontSize: 10,
              mb: 2,
            }}
          >
            Slug: {practice.slug}
          </Typography>
        )}

        {/* Actions */}
        <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LibraryBooksIcon />}
            onClick={onViewLibrary}
            sx={{ flex: 1, textTransform: 'none' }}
          >
            Library
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PlaylistPlayIcon />}
            onClick={onViewRuns}
            sx={{ flex: 1, textTransform: 'none' }}
          >
            Runs
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export function PracticesPage() {
  const navigate = useNavigate();
  const [practices, setPractices] = useState<(Practice & { config_level?: number; is_active?: boolean })[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([practicesApi.list(), runsApi.list()])
      .then(([practicesData, runsData]) => {
        setPractices(practicesData);
        setRuns(runsData);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  // Calculate stats per practice
  const practiceStats = useMemo(() => {
    const stats = new Map<string, PracticeStats>();
    for (const practice of practices) {
      const practiceRuns = runs.filter((r) => r.practice_id === practice.id);
      stats.set(practice.id, {
        totalRuns: practiceRuns.length,
        completedRuns: practiceRuns.filter((r) => r.status === 'success' || r.status === 'completed').length,
        hitlVerifiedRuns: practiceRuns.filter((r) => !!r.prompt_hitl).length,
      });
    }
    return stats;
  }, [practices, runs]);

  // Filter practices by search
  const filteredPractices = useMemo(() => {
    if (!search.trim()) return practices;
    const searchLower = search.toLowerCase();
    return practices.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.slug?.toLowerCase().includes(searchLower) ||
        p.id.toLowerCase().includes(searchLower)
    );
  }, [practices, search]);

  // Overall stats
  const totalRuns = runs.length;
  const runsWithPractice = runs.filter((r) => r.practice_id).length;
  const runsWithoutPractice = totalRuns - runsWithPractice;

  const handleViewLibrary = (practiceId: string) => {
    // Navigate to practice library with practice pre-selected
    // The practice library uses a store, so we'll navigate and let user select
    navigate(ROUTES.PRACTICE_LIBRARY);
  };

  const handleViewRuns = (practiceId: string) => {
    // For now, just navigate to runs page
    // Could add filtering by practice in the future
    navigate(ROUTES.RUNS);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Practices
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Practice Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage practices, their configurations, and run statistics
        </Typography>

        {/* Summary Stats */}
        <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {practices.length}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Practices
            </Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
              {totalRuns}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Total Runs
            </Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
              {runsWithPractice}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Runs with Practice
            </Typography>
          </Box>
          {runsWithoutPractice > 0 && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {runsWithoutPractice}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Legacy (No Practice)
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search practices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
      </Box>

      {/* Practice Grid */}
      {filteredPractices.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4,
            borderRadius: 3,
            border: '2px dashed',
            borderColor: 'divider',
            backgroundColor: 'grey.50',
          }}
        >
          <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {search ? 'No practices found' : 'No practices yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {search
              ? 'Try adjusting your search terms'
              : 'Practices are created via Prompt Runner. Once created, they will appear here.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filteredPractices.map((practice) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={practice.id}>
              <PracticeCard
                practice={practice}
                stats={practiceStats.get(practice.id)}
                onViewLibrary={() => handleViewLibrary(practice.id)}
                onViewRuns={() => handleViewRuns(practice.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
