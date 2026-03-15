/**
 * Provider Selector Component
 *
 * Select LLM provider and model with configuration options.
 */

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useState, useCallback } from 'react';
import type {
  LLMProvider,
  OpenAIModel,
  AnthropicModel,
  StreamingConfig,
} from '../types';
import { PROVIDER_MODELS, MODEL_LABELS, DEFAULT_STREAMING_CONFIG } from '../types';
import { testApiKey } from '../services/streamingClient';

interface ProviderSelectorProps {
  onConfigComplete: (config: StreamingConfig) => void;
  initialConfig?: Partial<StreamingConfig>;
}

export function ProviderSelector({
  onConfigComplete,
  initialConfig,
}: ProviderSelectorProps) {
  const [provider, setProvider] = useState<LLMProvider>(
    initialConfig?.provider || DEFAULT_STREAMING_CONFIG.provider
  );
  const [model, setModel] = useState<OpenAIModel | AnthropicModel>(
    initialConfig?.model || DEFAULT_STREAMING_CONFIG.model
  );
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey || '');
  const [temperature, setTemperature] = useState(
    initialConfig?.temperature ?? DEFAULT_STREAMING_CONFIG.temperature ?? 0.7
  );
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    valid: boolean;
    error?: string;
  } | null>(null);

  // Load saved key from localStorage
  const loadSavedKey = useCallback((prov: LLMProvider) => {
    const saved = localStorage.getItem(`tcp_runner_${prov}_key`);
    if (saved) {
      try {
        setApiKey(atob(saved));
      } catch {
        // Invalid saved key
      }
    }
  }, []);

  const handleProviderChange = (_: React.MouseEvent, newProvider: LLMProvider | null) => {
    if (newProvider) {
      setProvider(newProvider);
      // Set default model for new provider
      const models = PROVIDER_MODELS[newProvider];
      const defaultModel = models[0];
      if (defaultModel) {
        setModel(defaultModel);
      }
      // Try to load saved key
      loadSavedKey(newProvider);
      setTestResult(null);
    }
  };

  const handleTestKey = async () => {
    if (!apiKey) return;

    setTesting(true);
    setTestResult(null);

    const result = await testApiKey(provider, apiKey);
    setTestResult(result);
    setTesting(false);

    // Save valid key to localStorage
    if (result.valid) {
      localStorage.setItem(`tcp_runner_${provider}_key`, btoa(apiKey));
    }
  };

  const handleContinue = () => {
    const config: StreamingConfig = {
      provider,
      model,
      apiKey,
      temperature,
      maxTokens: 4096,
    };
    onConfigComplete(config);
  };

  const models = PROVIDER_MODELS[provider];

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center">
          <SmartToyIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6">Configure AI Provider</Typography>
            <Typography variant="body2" color="text.secondary">
              Select your LLM provider and enter your API key
            </Typography>
          </Box>
        </Stack>

        {/* Provider Selection */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Provider
          </Typography>
          <ToggleButtonGroup
            value={provider}
            exclusive
            onChange={handleProviderChange}
            fullWidth
          >
            <ToggleButton value="openai">
              <Stack alignItems="center" spacing={0.5}>
                <Typography variant="body2" fontWeight={600}>
                  OpenAI
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  GPT-4o, GPT-4 Turbo
                </Typography>
              </Stack>
            </ToggleButton>
            <ToggleButton value="anthropic">
              <Stack alignItems="center" spacing={0.5}>
                <Typography variant="body2" fontWeight={600}>
                  Anthropic
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Claude 3.5 Sonnet, Opus
                </Typography>
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Model Selection */}
        <FormControl fullWidth>
          <InputLabel>Model</InputLabel>
          <Select
            value={model}
            label="Model"
            onChange={(e) => setModel(e.target.value as OpenAIModel | AnthropicModel)}
          >
            {models.map((m) => (
              <MenuItem key={m} value={m}>
                {MODEL_LABELS[m]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* API Key */}
        <TextField
          label="API Key"
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setTestResult(null);
          }}
          fullWidth
          placeholder={provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowKey(!showKey)} edge="end">
                    {showKey ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Security Notice */}
        <Alert severity="info" variant="outlined">
          Your API key is stored locally in your browser and never sent to our servers.
        </Alert>

        {/* Test Result */}
        {testResult && (
          <Alert severity={testResult.valid ? 'success' : 'error'}>
            {testResult.valid
              ? 'API key is valid!'
              : `Invalid API key: ${testResult.error}`}
          </Alert>
        )}

        {/* Temperature */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Temperature: {temperature}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            Lower = more focused, Higher = more creative
          </Typography>
          <Slider
            value={temperature}
            onChange={(_, value) => setTemperature(value as number)}
            min={0}
            max={1}
            step={0.1}
            marks={[
              { value: 0, label: '0' },
              { value: 0.5, label: '0.5' },
              { value: 1, label: '1' },
            ]}
          />
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={handleTestKey}
            disabled={!apiKey || testing}
          >
            {testing ? 'Testing...' : 'Test API Key'}
          </Button>
          <Button
            variant="contained"
            onClick={handleContinue}
            disabled={!apiKey || (testResult !== null && !testResult.valid)}
          >
            Continue
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default ProviderSelector;
