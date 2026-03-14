/**
 * Patient Info Section
 *
 * Collects patient name, consultation date, and provider for manual TCP creation.
 */

import { useState } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

interface PatientInfoSectionProps {
  patient: string;
  date: string;
  provider?: string;
  onUpdate: (patient: string, date: string, provider?: string) => void;
  onSubmit: () => void;
}

export function PatientInfoSection({
  patient,
  date,
  provider,
  onUpdate,
}: PatientInfoSectionProps) {
  const [localPatient, setLocalPatient] = useState(patient);
  const [localDate, setLocalDate] = useState(date || new Date().toISOString().split('T')[0] || '');
  const [localProvider, setLocalProvider] = useState(provider || '');

  const handlePatientChange = (value: string) => {
    setLocalPatient(value);
    onUpdate(value, localDate, localProvider || undefined);
  };

  const handleDateChange = (value: string) => {
    setLocalDate(value);
    onUpdate(localPatient, value, localProvider || undefined);
  };

  const handleProviderChange = (value: string) => {
    setLocalProvider(value);
    onUpdate(localPatient, localDate, value || undefined);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Patient Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter the patient and consultation details for this Treatment Care Plan.
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Patient Name"
          value={localPatient}
          onChange={(e) => handlePatientChange(e.target.value)}
          fullWidth
          required
          placeholder="Enter patient name"
        />

        <TextField
          label="Consultation Date"
          type="date"
          value={localDate}
          onChange={(e) => handleDateChange(e.target.value)}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Provider Name"
          value={localProvider}
          onChange={(e) => handleProviderChange(e.target.value)}
          fullWidth
          placeholder="Enter provider name (optional)"
        />
      </Stack>
    </Paper>
  );
}
