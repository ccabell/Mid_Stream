/**
 * VariablePanel Component
 *
 * Shows detected variables and allows setting test values
 */

import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ClearIcon from '@mui/icons-material/Clear';
import CodeIcon from '@mui/icons-material/Code';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import DataObjectIcon from '@mui/icons-material/DataObject';

import { usePromptStore, useSelectedPrompt, extractVariables } from '../usePromptStore';
import type { PromptVariable } from '../types';

interface VariablePanelProps {
  variables: Record<string, string>;
  onVariablesChange: (variables: Record<string, string>) => void;
}

export function VariablePanel({ variables, onVariablesChange }: VariablePanelProps) {
  const { editedContent } = usePromptStore();
  const selectedPrompt = useSelectedPrompt();

  // Extract variables from content
  const detectedVariables = useMemo(() => {
    if (!editedContent) return [];
    return extractVariables(editedContent);
  }, [editedContent]);

  // Common variable presets
  const presets = useMemo(() => {
    return {
      transcript: SAMPLE_TRANSCRIPT,
      practice_library: JSON.stringify(SAMPLE_PRACTICE_LIBRARY, null, 2),
      patient_name: 'Jane Smith',
      provider_name: 'Dr. Johnson',
    };
  }, []);

  const handleVariableChange = (name: string, value: string) => {
    onVariablesChange({
      ...variables,
      [name]: value,
    });
  };

  const handleLoadPreset = (name: string) => {
    const preset = presets[name as keyof typeof presets];
    if (preset) {
      handleVariableChange(name, preset);
    }
  };

  const handleClear = (name: string) => {
    const next = { ...variables };
    delete next[name];
    onVariablesChange(next);
  };

  const handlePaste = async (name: string) => {
    try {
      const text = await navigator.clipboard.readText();
      handleVariableChange(name, text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  if (detectedVariables.length === 0) {
    return (
      <Box sx={{ p: 2, color: 'text.secondary' }}>
        <Typography variant="body2">
          No variables detected in this prompt.
        </Typography>
        <Typography variant="caption">
          Variables use the format: {'{{variable_name}}'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Variables ({detectedVariables.length})
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Set values for testing the prompt
        </Typography>
      </Box>

      {detectedVariables.map((variable) => (
        <VariableInput
          key={variable.name}
          variable={variable}
          value={variables[variable.name] || ''}
          onChange={(value) => handleVariableChange(variable.name, value)}
          onPaste={() => handlePaste(variable.name)}
          onClear={() => handleClear(variable.name)}
          onLoadPreset={
            presets[variable.name as keyof typeof presets]
              ? () => handleLoadPreset(variable.name)
              : undefined
          }
        />
      ))}
    </Box>
  );
}

interface VariableInputProps {
  variable: PromptVariable;
  value: string;
  onChange: (value: string) => void;
  onPaste: () => void;
  onClear: () => void;
  onLoadPreset?: () => void;
}

function VariableInput({
  variable,
  value,
  onChange,
  onPaste,
  onClear,
  onLoadPreset,
}: VariableInputProps) {
  const [expanded, setExpanded] = useState(true);

  const typeIcon = {
    string: <TextFieldsIcon fontSize="small" />,
    json: <DataObjectIcon fontSize="small" />,
    markdown: <CodeIcon fontSize="small" />,
    array: <DataObjectIcon fontSize="small" />,
  }[variable.type];

  const isLongContent = variable.type === 'json' || variable.type === 'markdown' || variable.name === 'transcript';

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      disableGutters
      sx={{
        '&:before': { display: 'none' },
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ minHeight: 48, '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          {typeIcon}
          <Typography variant="body2" fontFamily="monospace">
            {`{{${variable.name}}}`}
          </Typography>
          <Chip
            label={variable.type}
            size="small"
            sx={{ height: 18, fontSize: '0.65rem' }}
          />
          {value && (
            <Chip
              label="Set"
              size="small"
              color="success"
              sx={{ height: 18, fontSize: '0.65rem' }}
            />
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <TextField
            fullWidth
            multiline={isLongContent}
            rows={isLongContent ? 6 : 1}
            size="small"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${variable.name}...`}
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: variable.type === 'json' ? 'monospace' : 'inherit',
                fontSize: '0.85rem',
              },
            }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Tooltip title="Paste from clipboard">
              <IconButton size="small" onClick={onPaste}>
                <ContentPasteIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {value && (
              <Tooltip title="Clear">
                <IconButton size="small" onClick={onClear}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {onLoadPreset && (
          <Button
            size="small"
            variant="text"
            onClick={onLoadPreset}
            sx={{ mt: 1, fontSize: '0.75rem' }}
          >
            Load sample data
          </Button>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

// Sample data for testing
const SAMPLE_TRANSCRIPT = `Provider: Good afternoon! Thanks for coming in today. What brings you in?

Patient: Hi! I've been thinking about doing something about these lines between my eyebrows. They're really bothering me.

Provider: I completely understand. Those are called glabellar lines or "11s" - very common concern. Have you had any treatments before?

Patient: No, this is my first time really looking into anything like this. I'm a little nervous honestly.

Provider: That's totally normal for a first consultation. Let me explain what we can do. For those frown lines, Botox is typically the gold standard treatment. It relaxes the muscles that cause those lines.

Patient: Okay, how long does it last?

Provider: Typically 3-4 months for most patients. Some see it lasting a bit longer. I'm also noticing you have some volume loss in your cheeks - have you thought about that area at all?

Patient: I have noticed my face looks a little more hollow than it used to. What would you do for that?

Provider: We could use a dermal filler like Sculptra or Juvederm Voluma to restore that volume. It gives a very natural lift to the midface.

Patient: I think I want to start with just the Botox for now. Maybe the filler later. What does Botox cost?

Provider: For the glabella area, it's typically $12-14 per unit, and most people need 20-25 units. So roughly $250-350. We also have a membership program that gives you 15% off all services.

Patient: That sounds reasonable. I have a wedding to go to in 6 weeks - will I see results by then?

Provider: Absolutely! You'll start seeing results in 3-7 days, with full effect at 2 weeks. Plenty of time before the wedding.

Patient: Great, let's do it!`;

const SAMPLE_PRACTICE_LIBRARY = {
  practice_name: 'Sample Aesthetics',
  services: [
    { name: 'Botox', category: 'Injectables', price_per_unit: 13 },
    { name: 'Juvederm Voluma', category: 'Fillers', price_per_syringe: 850 },
    { name: 'Sculptra', category: 'Fillers', price_per_vial: 950 },
  ],
  concerns: [
    { label: 'Frown Lines', aliases: ['11s', 'glabellar lines'] },
    { label: 'Volume Loss', aliases: ['hollow cheeks', 'sunken face'] },
  ],
};
