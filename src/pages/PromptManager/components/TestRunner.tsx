/**
 * TestRunner Component
 *
 * Run prompts against test data and view results
 */

import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// Icons
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TimerIcon from '@mui/icons-material/Timer';
import TokenIcon from '@mui/icons-material/Token';

import { usePromptStore, useSelectedPrompt } from '../usePromptStore';
import type { PromptTestResult } from '../types';

interface TestRunnerProps {
  variables: Record<string, string>;
  isOpen: boolean;
  onClose: () => void;
}

type ModelOption = 'claude-3-5-sonnet' | 'claude-3-opus' | 'claude-3-haiku';

const MODEL_OPTIONS: { value: ModelOption; label: string; description: string }[] = [
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Best balance of speed and capability' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', description: 'Most capable, slower' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku', description: 'Fastest, good for simple tasks' },
];

export function TestRunner({ variables, isOpen, onClose }: TestRunnerProps) {
  const selectedPrompt = useSelectedPrompt();
  const { editedContent, testResults, isRunningTest } = usePromptStore();
  const { addTestResult, clearTestResults, setIsRunningTest } = usePromptStore((s) => s.actions);

  const [selectedModel, setSelectedModel] = useState<ModelOption>('claude-3-5-sonnet');
  const [outputTab, setOutputTab] = useState<'raw' | 'parsed'>('raw');

  const handleRunTest = useCallback(async () => {
    if (!selectedPrompt || !editedContent) return;

    setIsRunningTest(true);
    const startTime = Date.now();

    try {
      // Substitute variables into prompt
      let processedPrompt = editedContent;
      Object.entries(variables).forEach(([key, value]) => {
        processedPrompt = processedPrompt.replace(
          new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
          value
        );
      });

      // In a real implementation, this would call the API
      // For now, simulate a response
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResult: PromptTestResult = {
        promptId: selectedPrompt.id,
        timestamp: new Date().toISOString(),
        input: variables,
        output: JSON.stringify(MOCK_EXTRACTION_OUTPUT, null, 2),
        parsedOutput: MOCK_EXTRACTION_OUTPUT,
        duration: Date.now() - startTime,
        model: selectedModel,
        tokens: {
          input: Math.floor(processedPrompt.length / 4),
          output: Math.floor(JSON.stringify(MOCK_EXTRACTION_OUTPUT).length / 4),
        },
      };

      addTestResult(mockResult);
    } catch (error) {
      const errorResult: PromptTestResult = {
        promptId: selectedPrompt.id,
        timestamp: new Date().toISOString(),
        input: variables,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
        model: selectedModel,
        tokens: { input: 0, output: 0 },
      };

      addTestResult(errorResult);
    } finally {
      setIsRunningTest(false);
    }
  }, [selectedPrompt, editedContent, variables, selectedModel, addTestResult, setIsRunningTest]);

  const latestResult = testResults[0];

  if (!isOpen) return null;

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        display: 'flex',
        flexDirection: 'column',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        zIndex: 10,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Test Runner
          </Typography>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Model</InputLabel>
            <Select
              value={selectedModel}
              label="Model"
              onChange={(e) => setSelectedModel(e.target.value as ModelOption)}
            >
              {MODEL_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={isRunningTest ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
            onClick={handleRunTest}
            disabled={isRunningTest || !editedContent}
          >
            {isRunningTest ? 'Running...' : 'Run Test'}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {testResults.length > 0 && (
            <Button
              size="small"
              startIcon={<DeleteIcon />}
              onClick={clearTestResults}
            >
              Clear History ({testResults.length})
            </Button>
          )}
          <IconButton onClick={onClose}>
            <ExpandMoreIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {testResults.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography>
              Click "Run Test" to execute the prompt with the provided variables
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Latest Result */}
            <TestResultCard result={latestResult} expanded defaultExpanded />

            {/* History */}
            {testResults.length > 1 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Previous Results
                </Typography>
                {testResults.slice(1).map((result, index) => (
                  <TestResultCard key={result.timestamp} result={result} />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

interface TestResultCardProps {
  result: PromptTestResult;
  expanded?: boolean;
  defaultExpanded?: boolean;
}

function TestResultCard({ result, defaultExpanded = false }: TestResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [outputTab, setOutputTab] = useState<'raw' | 'parsed'>('raw');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.output);
  };

  const timestamp = new Date(result.timestamp).toLocaleTimeString();
  const isSuccess = !result.error;

  return (
    <Paper variant="outlined" sx={{ mb: 2 }}>
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isSuccess ? (
            <CheckCircleIcon color="success" fontSize="small" />
          ) : (
            <ErrorIcon color="error" fontSize="small" />
          )}

          <Typography variant="body2" fontWeight={500}>
            {timestamp}
          </Typography>

          <Chip
            label={result.model}
            size="small"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimerIcon fontSize="small" color="action" sx={{ fontSize: 14 }} />
            <Typography variant="caption" color="text.secondary">
              {result.duration}ms
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TokenIcon fontSize="small" color="action" sx={{ fontSize: 14 }} />
            <Typography variant="caption" color="text.secondary">
              {result.tokens.input + result.tokens.output} tokens
            </Typography>
          </Box>
        </Box>

        <IconButton size="small">
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Content */}
      <Collapse in={isExpanded}>
        <Divider />
        <Box sx={{ p: 2 }}>
          {result.error ? (
            <Alert severity="error">{result.error}</Alert>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Tabs
                  value={outputTab}
                  onChange={(_, v) => setOutputTab(v)}
                  sx={{ minHeight: 32 }}
                >
                  <Tab value="raw" label="Raw Output" sx={{ minHeight: 32, py: 0 }} />
                  <Tab
                    value="parsed"
                    label="Parsed JSON"
                    sx={{ minHeight: 32, py: 0 }}
                    disabled={!result.parsedOutput}
                  />
                </Tabs>

                <Tooltip title="Copy output">
                  <IconButton size="small" onClick={handleCopy}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  maxHeight: 300,
                  overflow: 'auto',
                  bgcolor: 'grey.50',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {outputTab === 'raw'
                  ? result.output
                  : JSON.stringify(result.parsedOutput, null, 2)}
              </Paper>
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

// Mock output for demonstration
const MOCK_EXTRACTION_OUTPUT = {
  extraction_version: '3.0',
  pass: 1,
  visit_context: {
    visit_type: 'initial_consultation',
    reason_for_visit: 'Patient concerned about frown lines between eyebrows',
    referred_by: null,
    motivating_event: 'wedding in 6 weeks',
  },
  patient_goals: {
    primary_concern: 'Glabellar lines (frown lines between eyebrows)',
    secondary_concerns: ['Volume loss in cheeks'],
    goals: ['Reduce appearance of frown lines', 'Look refreshed for wedding'],
    anticipated_outcomes: ['Results visible within 2 weeks', '3-4 month duration'],
  },
  areas: {
    treatment_areas: ['glabella', 'cheeks'],
    concern_areas: ['lines', 'volume loss'],
  },
  offerings: [
    {
      name: 'Botox',
      type: 'service',
      disposition: 'scheduled',
      area: 'glabella',
      quantity: '20-25 units',
      value: 300,
    },
    {
      name: 'Dermal Filler (Sculptra/Voluma)',
      type: 'service',
      disposition: 'discussed',
      area: 'cheeks',
      quantity: null,
      value: null,
    },
  ],
};
