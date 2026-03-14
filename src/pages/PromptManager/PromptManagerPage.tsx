/**
 * PromptManagerPage
 *
 * Main page for managing all A360 prompts
 */

import { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

// Icons
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CircleIcon from '@mui/icons-material/Circle';
import Chip from '@mui/material/Chip';

import { PromptList, PromptEditor, VariablePanel, TestRunner } from './components';
import { usePromptStore, useSelectedPrompt } from './usePromptStore';
import { promptsApi } from 'apiServices/prompts.api';

// Layout constants
const SIDEBAR_WIDTH = 320;
const VARIABLE_PANEL_WIDTH = 300;

export function PromptManagerPage() {
  const { prompts, isLoading, error, hasUnsavedChanges } = usePromptStore();
  const {
    loadPromptsFromServer,
    loadPromptContent,
    savePromptToFile,
    selectPrompt,
  } = usePromptStore((s) => s.actions);
  const selectedPrompt = useSelectedPrompt();

  // Variable state for testing
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});

  // Server connection state
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // UI state
  const [showVariablePanel, setShowVariablePanel] = useState(true);
  const [showTestRunner, setShowTestRunner] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Check server connection and load prompts on mount
  useEffect(() => {
    checkServerAndLoad();
  }, []);

  // Load prompt content when selection changes
  useEffect(() => {
    if (selectedPrompt && !selectedPrompt.content && serverStatus === 'connected') {
      loadPromptContent(selectedPrompt.slug);
    }
  }, [selectedPrompt?.slug, serverStatus, loadPromptContent]);

  const checkServerAndLoad = useCallback(async () => {
    setServerStatus('checking');
    try {
      await promptsApi.health();
      setServerStatus('connected');
      await loadPromptsFromServer();
      // Auto-select first prompt after loading
      const state = usePromptStore.getState();
      const firstPrompt = state.prompts[0];
      if (firstPrompt && !state.selectedPromptId) {
        selectPrompt(firstPrompt.id);
      }
    } catch {
      setServerStatus('disconnected');
      setSnackbar({
        open: true,
        message: 'Prompt server not running. Start it with: npm run server',
        severity: 'warning',
      });
    }
  }, [loadPromptsFromServer, selectPrompt]);

  const loadPrompts = useCallback(async () => {
    if (serverStatus === 'connected') {
      await loadPromptsFromServer();
    } else {
      await checkServerAndLoad();
    }
  }, [serverStatus, loadPromptsFromServer, checkServerAndLoad]);

  const handleAddPrompt = useCallback(() => {
    // TODO: Open create prompt dialog
    setSnackbar({ open: true, message: 'Create prompt feature coming soon', severity: 'success' });
  }, []);

  const handleRunTest = useCallback(() => {
    setShowTestRunner(true);
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar((s) => ({ ...s, open: false }));
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
            <Link href="/" color="inherit" underline="hover">
              Mid_Stream
            </Link>
            <Typography color="text.primary" fontWeight={600}>
              Prompt Manager
            </Typography>
          </Breadcrumbs>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage all A360 prompts: extraction, HITL, TCP, agents, and more
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            icon={<CircleIcon sx={{ fontSize: 10 }} />}
            label={serverStatus === 'connected' ? 'Server connected' : serverStatus === 'checking' ? 'Connecting...' : 'Server offline'}
            color={serverStatus === 'connected' ? 'success' : serverStatus === 'checking' ? 'default' : 'error'}
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <Tooltip title="Refresh prompts">
            <IconButton onClick={loadPrompts} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Help">
            <IconButton>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Sidebar - Prompt List */}
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          <PromptList onAddPrompt={handleAddPrompt} />
        </Box>

        {/* Main Editor Area */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <PromptEditor onRunTest={handleRunTest} />
        </Box>

        {/* Variable Panel (Right Sidebar) */}
        <Drawer
          variant="persistent"
          anchor="right"
          open={showVariablePanel && !!selectedPrompt}
          sx={{
            width: showVariablePanel ? VARIABLE_PANEL_WIDTH : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: VARIABLE_PANEL_WIDTH,
              position: 'relative',
              borderLeft: 1,
              borderColor: 'divider',
            },
          }}
        >
          <VariablePanel
            variables={testVariables}
            onVariablesChange={setTestVariables}
          />
        </Drawer>

        {/* Toggle Variable Panel Button */}
        {selectedPrompt && (
          <Tooltip title={showVariablePanel ? 'Hide variables' : 'Show variables'}>
            <IconButton
              onClick={() => setShowVariablePanel(!showVariablePanel)}
              sx={{
                position: 'absolute',
                right: showVariablePanel ? VARIABLE_PANEL_WIDTH + 8 : 8,
                top: 8,
                bgcolor: 'background.paper',
                boxShadow: 1,
                zIndex: 5,
                transition: 'right 0.2s',
              }}
              size="small"
            >
              {showVariablePanel ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        )}

        {/* Test Runner Panel */}
        <TestRunner
          variables={testVariables}
          isOpen={showTestRunner}
          onClose={() => setShowTestRunner(false)}
        />
      </Box>

      {/* Unsaved changes warning */}
      {hasUnsavedChanges && selectedPrompt && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              px: 3,
              py: 1.5,
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              You have unsaved changes
            </Typography>
            <Button
              size="small"
              variant="contained"
              color="inherit"
              sx={{ color: 'warning.main' }}
              onClick={async () => {
                if (serverStatus === 'connected') {
                  await savePromptToFile(selectedPrompt.slug);
                  setSnackbar({ open: true, message: 'Prompt saved to file', severity: 'success' });
                } else {
                  usePromptStore.getState().actions.saveChanges();
                  setSnackbar({ open: true, message: 'Changes saved locally (server not connected)', severity: 'warning' });
                }
              }}
            >
              Save Now
            </Button>
          </Paper>
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
