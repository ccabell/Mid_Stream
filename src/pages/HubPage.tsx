import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StorageIcon from '@mui/icons-material/Storage';
import ArticleIcon from '@mui/icons-material/Article';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  status: 'complete' | 'planned';
}

function FeatureCard({ title, description, icon, route, status }: FeatureCardProps) {
  const navigate = useNavigate();
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={() => navigate(route)} sx={{ height: '100%' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {icon}
              <Typography variant="h6">{title}</Typography>
            </Box>
            <Chip
              size="small"
              label={status === 'complete' ? 'Complete' : 'Planned'}
              color={status === 'complete' ? 'success' : 'default'}
              icon={status === 'complete' ? <CheckCircleIcon /> : <ScheduleIcon />}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

interface ExternalLinkCardProps {
  title: string;
  description: string;
  url: string;
  type: 'deployment' | 'repo' | 'docs';
  warning?: boolean;
}

function ExternalLinkCard({ title, description, url, type, warning }: ExternalLinkCardProps) {
  const icon = type === 'repo' ? <GitHubIcon /> : type === 'docs' ? <ArticleIcon /> : <OpenInNewIcon />;
  return (
    <Card sx={{ backgroundColor: warning ? 'error.50' : undefined, borderColor: warning ? 'error.main' : undefined }}>
      <CardActionArea component="a" href={url} target="_blank" rel="noopener noreferrer">
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {icon}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
          {warning && (
            <Chip size="small" label="DO NOT MODIFY" color="error" />
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function HubPage() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Mid_Stream Project Hub
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Central command center for the A360 Intelligence Extraction ecosystem.
          View runs, manage opportunities, execute agents, and access all related projects.
        </Typography>
      </Box>

      {/* Features */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Features
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FeatureCard
            title="Dashboard"
            description="KPI overview with opportunities by stage and pipeline value charts"
            icon={<DashboardIcon color="primary" />}
            route={ROUTES.DASHBOARD}
            status="complete"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FeatureCard
            title="Runs"
            description="View all extraction runs with status, timestamps, and navigate to details"
            icon={<ListAltIcon color="primary" />}
            route={ROUTES.RUNS}
            status="complete"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FeatureCard
            title="Opportunities"
            description="Kanban board for tracking follow-up opportunities by stage"
            icon={<ViewKanbanIcon color="primary" />}
            route={ROUTES.OPPORTUNITIES}
            status="complete"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FeatureCard
            title="Agents"
            description="Execute downstream agents for cross-sell, email campaigns, and more"
            icon={<SmartToyIcon color="primary" />}
            route={ROUTES.AGENTS}
            status="complete"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Deployments */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Deployments
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ExternalLinkCard
            title="Mid_Stream (This App)"
            description="https://mid-stream.vercel.app"
            url="https://mid-stream.vercel.app"
            type="deployment"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ExternalLinkCard
            title="Prompt Runner API"
            description="Backend API on Railway - Source of truth"
            url="https://prompt-runner-production.up.railway.app"
            type="deployment"
            warning
          />
        </Grid>
      </Grid>

      {/* Repositories */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Repositories
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ExternalLinkCard
            title="Mid_Stream"
            description="This unified frontend"
            url="https://github.com/ccabell/Mid_Stream"
            type="repo"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ExternalLinkCard
            title="Prompt Runner"
            description="Backend - DO NOT MODIFY"
            url="https://github.com/ccabell/prompt-runner"
            type="repo"
            warning
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ExternalLinkCard
            title="IE Interface (Legacy)"
            description="Superseded by Mid_Stream"
            url="https://github.com/ccabell/ie-interface"
            type="repo"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Architecture */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Architecture
      </Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            component="pre"
            sx={{
              fontFamily: 'monospace',
              fontSize: 14,
              p: 2,
              backgroundColor: 'action.hover',
              borderRadius: 1,
              overflow: 'auto',
            }}
          >
{`┌─────────────────────────────────────────────────────────────┐
│                        MID_STREAM                            │
│              (Unified Frontend - This App)                   │
│                                                              │
│  Dashboard  │  Runs  │  Opportunities  │  Agents  │  Hub    │
│                          │                                   │
│                   ┌──────▼──────┐                           │
│                   │ Run Detail  │  ← View extraction        │
│                   │ + Agents    │  ← Execute agents         │
│                   │ + HITL      │  ← Provider approval      │
│                   └──────┬──────┘                           │
└──────────────────────────┼──────────────────────────────────┘
                           │ API Calls
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      PROMPT RUNNER                           │
│                 (Backend - DO NOT MODIFY)                    │
│                                                              │
│  • Process transcripts through extraction prompts            │
│  • Store runs, outputs, opportunities in Supabase            │
│  • Execute downstream agents                                 │
└─────────────────────────────────────────────────────────────┘`}
          </Box>
        </CardContent>
      </Card>

      {/* Documentation Links */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Documentation
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ArticleIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Project Hub
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Complete project overview, inventory, and roadmap
              </Typography>
              <Typography variant="caption" color="text.secondary">
                docs/PROJECT_HUB.md
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StorageIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  V3 Extraction Schema
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Data structures for extraction, HITL, and agents
              </Typography>
              <Typography variant="caption" color="text.secondary">
                HITL-TCP-Project/prompts/V3_EXTRACTION_SCHEMA.md
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ArticleIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  TCP Master Plan
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                System roadmap and implementation phases
              </Typography>
              <Typography variant="caption" color="text.secondary">
                HITL-TCP-Project/TCP_MASTER_PLAN.md
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer */}
      <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Part of the A360 Intelligence Extraction ecosystem •{' '}
          <Link href="https://github.com/ccabell" target="_blank" rel="noopener">
            github.com/ccabell
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
