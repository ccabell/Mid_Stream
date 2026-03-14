/**
 * Practice Selector Component
 *
 * Dropdown to select which practice library to manage.
 * Includes Global Library option at the top for managing shared items.
 */

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListSubheader from '@mui/material/ListSubheader';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import PublicIcon from '@mui/icons-material/Public';
import type { SelectChangeEvent } from '@mui/material/Select';
import { usePracticeLibraryStore, practiceLibrarySelectors } from 'stores/practiceLibraryStore';
import { GLOBAL_LIBRARY_PRACTICE, type Practice } from 'apiServices/practiceLibrary/types';

// Mock practices for now - will be replaced with API call
const MOCK_PRACTICES: Practice[] = [
  { id: 'calospa', name: 'CaloSpa', is_active: true, config_level: 3 },
  { id: 'little-mountain', name: 'Little Mountain Laser', is_active: true, config_level: 2 },
  { id: 'midwest-vein', name: 'Midwest Vein and Laser', is_active: true, config_level: 1 },
  { id: 'skincare-sharon', name: 'Skincare by Sharon', is_active: true, config_level: 0 },
];

export function PracticeSelector() {
  const [isLoading, setIsLoading] = useState(true);

  const practices = usePracticeLibraryStore(practiceLibrarySelectors.selectPractices);
  const selectedPracticeId = usePracticeLibraryStore(practiceLibrarySelectors.selectSelectedPracticeId);
  const actions = usePracticeLibraryStore(practiceLibrarySelectors.selectActions);

  useEffect(() => {
    // Load practices (mock for now)
    const loadPractices = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      actions.setPractices(MOCK_PRACTICES);

      // Auto-select first practice if none selected
      if (!selectedPracticeId && MOCK_PRACTICES.length > 0) {
        const firstPractice = MOCK_PRACTICES[0];
        if (firstPractice) {
          actions.setSelectedPractice(firstPractice);
        }
      }
      setIsLoading(false);
    };

    loadPractices();
  }, [actions, selectedPracticeId]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const practiceId = event.target.value;

    // Check if Global Library is selected
    if (practiceId === GLOBAL_LIBRARY_PRACTICE.id) {
      actions.setSelectedPractice(GLOBAL_LIBRARY_PRACTICE);
      return;
    }

    const practice = practices.find((p) => p.id === practiceId);
    if (practice) {
      actions.setSelectedPractice(practice);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  const isGlobalSelected = selectedPracticeId === GLOBAL_LIBRARY_PRACTICE.id;

  return (
    <FormControl size="small" sx={{ minWidth: 260 }}>
      <InputLabel>Library</InputLabel>
      <Select
        value={selectedPracticeId ?? ''}
        label="Library"
        onChange={handleChange}
      >
        {/* Global Library Option */}
        <MenuItem
          value={GLOBAL_LIBRARY_PRACTICE.id}
          sx={{
            backgroundColor: isGlobalSelected ? 'action.selected' : 'transparent',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PublicIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <Box component="span" sx={{ fontWeight: 600 }}>
              Global Library
            </Box>
            <Box
              component="span"
              sx={{
                ml: 'auto',
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                fontSize: 10,
                fontWeight: 600,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              SHARED
            </Box>
          </Box>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />
        <ListSubheader sx={{ lineHeight: 2, fontSize: 11, fontWeight: 600 }}>
          Practice Libraries
        </ListSubheader>

        {/* Practice Options */}
        {practices.map((practice) => (
          <MenuItem key={practice.id} value={practice.id}>
            {practice.name}
            {practice.config_level > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: 10,
                  fontWeight: 600,
                  backgroundColor: 'grey.300',
                  color: 'grey.800',
                }}
              >
                L{practice.config_level}
              </Box>
            )}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
