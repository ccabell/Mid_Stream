/**
 * Practice Library Page
 *
 * Manage practice-specific services, products, packages, and concerns
 */

import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import SearchIcon from '@mui/icons-material/Search';
import {
  PracticeSelector,
  LibraryTabs,
  ServicesList,
  ProductsList,
  PackagesList,
  ConcernsList,
} from 'components/practiceLibrary';
import {
  usePracticeLibraryStore,
  practiceLibrarySelectors,
  useLoadActiveTabData,
} from 'stores/practiceLibraryStore';

function LibraryContent() {
  const activeTab = usePracticeLibraryStore(practiceLibrarySelectors.selectActiveTab);

  switch (activeTab) {
    case 'services':
      return <ServicesList />;
    case 'products':
      return <ProductsList />;
    case 'packages':
      return <PackagesList />;
    case 'concerns':
      return <ConcernsList />;
    default:
      return null;
  }
}

function SearchAndActions() {
  const activeTab = usePracticeLibraryStore(practiceLibrarySelectors.selectActiveTab);
  const filters = usePracticeLibraryStore(practiceLibrarySelectors.selectFilters);
  const actions = usePracticeLibraryStore(practiceLibrarySelectors.selectActions);

  const getAddLabel = () => {
    switch (activeTab) {
      case 'services':
        return 'Add Service';
      case 'products':
        return 'Add Product';
      case 'packages':
        return 'Create Package';
      case 'concerns':
        return 'Add Concern';
      default:
        return 'Add';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <TextField
        size="small"
        placeholder="Search..."
        value={filters.search}
        onChange={(e) => actions.setFilters({ search: e.target.value })}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: 240 }}
      />
      <Box sx={{ flex: 1 }} />
      <Button
        variant="outlined"
        startIcon={<UploadIcon />}
        onClick={() => actions.openImportModal()}
      >
        Import
      </Button>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => actions.openCreateModal()}
      >
        {getAddLabel()}
      </Button>
    </Box>
  );
}

export function PracticeLibraryPage() {
  const selectedPracticeId = usePracticeLibraryStore(practiceLibrarySelectors.selectSelectedPracticeId);
  const selectedPractice = usePracticeLibraryStore(practiceLibrarySelectors.selectSelectedPractice);

  // Load data when practice or tab changes
  useLoadActiveTabData();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Practice Library
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage services, products, packages, and concerns for your practice
          </Typography>
        </Box>
        <PracticeSelector />
      </Box>

      {/* Practice Info */}
      {selectedPractice && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            p: 2,
            borderRadius: 1,
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {selectedPractice.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Configuration Level: {selectedPractice.config_level}
              {selectedPractice.config_level === 0 && ' (Default)'}
              {selectedPractice.config_level === 1 && ' (Basic)'}
              {selectedPractice.config_level === 2 && ' (Standard)'}
              {selectedPractice.config_level === 3 && ' (Full)'}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Tabs */}
      {selectedPracticeId && (
        <>
          <LibraryTabs />
          <Box sx={{ mt: 3 }}>
            <SearchAndActions />
            <LibraryContent />
          </Box>
        </>
      )}

      {!selectedPracticeId && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: 'background.paper',
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Select a practice to manage its library
          </Typography>
        </Box>
      )}
    </Box>
  );
}
