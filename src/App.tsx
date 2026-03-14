import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { theme } from 'shared/styles';
import { AppLayout } from 'components/layout';
import { ROUTES } from 'constants/routes';
import {
  HubPage,
  DashboardPage,
  RunsPage,
  RunDetailPage,
  HITLVerificationPage,
  OpportunitiesPage,
  AgentsPage,
  PracticeLibraryPage,
  PromptManagerPage,
  TCPPage,
} from 'pages';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to={ROUTES.HUB} replace />} />
            <Route path={ROUTES.HUB} element={<HubPage />} />
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.RUNS} element={<RunsPage />} />
            <Route path={ROUTES.RUN_HITL} element={<HITLVerificationPage />} />
            <Route path={ROUTES.RUN_DETAIL} element={<RunDetailPage />} />
            <Route path={ROUTES.OPPORTUNITIES} element={<OpportunitiesPage />} />
            <Route path={ROUTES.AGENTS} element={<AgentsPage />} />
            <Route path={ROUTES.PRACTICE_LIBRARY} element={<PracticeLibraryPage />} />
            <Route path={ROUTES.PROMPTS} element={<PromptManagerPage />} />
            <Route path={ROUTES.TCP} element={<TCPPage />} />
            <Route path={ROUTES.TCP_FROM_RUN} element={<TCPPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="bottom-right" />
    </ThemeProvider>
  );
}
