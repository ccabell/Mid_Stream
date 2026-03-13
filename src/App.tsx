import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { theme } from '@/theme';
import { AppLayout } from '@/components/layout';
import { ROUTES } from '@/constants/routes';
import {
  DashboardPage,
  RunsPage,
  RunDetailPage,
  OpportunitiesPage,
  AgentsPage,
} from '@/pages';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.RUNS} element={<RunsPage />} />
            <Route path={ROUTES.RUN_DETAIL} element={<RunDetailPage />} />
            <Route path={ROUTES.OPPORTUNITIES} element={<OpportunitiesPage />} />
            <Route path={ROUTES.AGENTS} element={<AgentsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="bottom-right" />
    </ThemeProvider>
  );
}
