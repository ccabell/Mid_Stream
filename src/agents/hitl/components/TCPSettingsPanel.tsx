/**
 * TCP Settings Panel
 *
 * Configuration options for TCP generation.
 */

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import type { TCPSettings } from '../../types';

interface TCPSettingsPanelProps {
  settings: TCPSettings;
  onUpdate: (updates: Partial<TCPSettings>) => void;
}

export function TCPSettingsPanel({
  settings,
  onUpdate,
}: TCPSettingsPanelProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          TCP Generation Settings
        </Typography>

        <Stack spacing={3}>
          {/* Language Settings */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Language & Tone
            </Typography>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Language Level</InputLabel>
                <Select
                  value={settings.language_level}
                  label="Language Level"
                  onChange={(e) => onUpdate({ language_level: e.target.value as TCPSettings['language_level'] })}
                >
                  <MenuItem value="Plain">Plain (Simple)</MenuItem>
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Expert">Expert (Medical)</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Perspective</InputLabel>
                <Select
                  value={settings.perspective}
                  label="Perspective"
                  onChange={(e) => onUpdate({ perspective: e.target.value as TCPSettings['perspective'] })}
                >
                  <MenuItem value="First Person">First Person (I/We)</MenuItem>
                  <MenuItem value="Second Person">Second Person (You)</MenuItem>
                  <MenuItem value="Third Person">Third Person</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          <Divider />

          {/* Content Options */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Content Options
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.include_pricing}
                    onChange={(e) => onUpdate({ include_pricing: e.target.checked })}
                  />
                }
                label="Include pricing in patient plan"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.include_future}
                    onChange={(e) => onUpdate({ include_future: e.target.checked })}
                  />
                }
                label="Include future recommendations"
              />
            </FormGroup>
          </Box>

          {/* Preview Note */}
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              These settings affect how the TCP document will be generated.
              You can preview the TCP before sending it to the patient.
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
