/**
 * Practice Library Page
 *
 * Manage practice-specific services, products, packages, and concerns.
 * Also supports Global Library mode for managing shared items.
 */

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useState } from 'react';
import PublicIcon from '@mui/icons-material/Public';
import SearchIcon from '@mui/icons-material/Search';
import {
  PracticeSelector,
  LibraryTabs,
  ServicesList,
  ProductsList,
  PackagesList,
  ConcernsList,
  ServiceFormModal,
  ProductFormModal,
  PackageFormModal,
  ConcernFormModal,
  ImportFromGlobalModal,
  PracticeConfigPanel,
} from 'components/practiceLibrary';
import {
  usePracticeLibraryStore,
  practiceLibrarySelectors,
  useLoadActiveTabData,
} from 'stores/practiceLibraryStore';
import { exportPracticeLibrary, type ExportOptions } from 'utils/practiceLibraryExport';

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
    case 'configuration':
      return <PracticeConfigPanel />;
    default:
      return null;
  }
}

function LibraryContentWithActions() {
  const activeTab = usePracticeLibraryStore(practiceLibrarySelectors.selectActiveTab);
  const isConfigTab = activeTab === 'configuration';

  return (
    <>
      {!isConfigTab && <SearchAndActions />}
      <LibraryContent />
    </>
  );
}

function SearchAndActions() {
  const activeTab = usePracticeLibraryStore(practiceLibrarySelectors.selectActiveTab);
  const filters = usePracticeLibraryStore(practiceLibrarySelectors.selectFilters);
  const isGlobalMode = usePracticeLibraryStore(practiceLibrarySelectors.selectIsGlobalLibraryMode);
  const actions = usePracticeLibraryStore(practiceLibrarySelectors.selectActions);
  const selectedPractice = usePracticeLibraryStore(practiceLibrarySelectors.selectSelectedPractice);
  const serviceItems = usePracticeLibraryStore(practiceLibrarySelectors.selectServiceItems);
  const productItems = usePracticeLibraryStore(practiceLibrarySelectors.selectProductItems);
  const packageItems = usePracticeLibraryStore(practiceLibrarySelectors.selectPackageItems);
  const concernItems = usePracticeLibraryStore(practiceLibrarySelectors.selectConcernItems);

  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const exportMenuOpen = Boolean(exportMenuAnchor);

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExport = (format: ExportOptions['format']) => {
    if (!selectedPractice) return;

    exportPracticeLibrary(selectedPractice, serviceItems, productItems, packageItems, concernItems, {
      format,
      includeInactive: false,
    });

    handleExportClose();
  };

  const getAddLabel = () => {
    const prefix = isGlobalMode ? 'Add Global ' : 'Add ';
    switch (activeTab) {
      case 'services':
        return `${prefix}Service`;
      case 'products':
        return `${prefix}Product`;
      case 'packages':
        return isGlobalMode ? 'Create Global Package' : 'Create Package';
      case 'concerns':
        return `${prefix}Concern`;
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
      {!isGlobalMode && (
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => actions.openImportModal()}
        >
          Import Practice Library
        </Button>
      )}
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleExportClick}
        disabled={!selectedPractice}
      >
        Export JSON
      </Button>
      <Menu
        anchorEl={exportMenuAnchor}
        open={exportMenuOpen}
        onClose={handleExportClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleExport('a360')}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="A360 Format"
            secondary="Practice offerings for A360 integration"
          />
        </MenuItem>
        <MenuItem onClick={() => handleExport('midstream')}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Mid_Stream Format"
            secondary="Full library export with all data"
          />
        </MenuItem>
      </Menu>
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
  const isGlobalMode = usePracticeLibraryStore(practiceLibrarySelectors.selectIsGlobalLibraryMode);

  // Load data when practice or tab changes
  useLoadActiveTabData();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isGlobalMode && <PublicIcon sx={{ color: 'primary.main' }} />}
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {isGlobalMode ? 'Global Library' : 'Practice Library'}
            </Typography>
            {isGlobalMode && (
              <Chip
                label="SHARED"
                size="small"
                color="primary"
                sx={{ fontWeight: 600, fontSize: 11 }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {isGlobalMode
              ? 'Manage shared services, products, and packages available to all practices'
              : 'Manage services, products, packages, and concerns for your practice'}
          </Typography>
        </Box>
        <PracticeSelector />
      </Box>

      {/* Global Library Info Banner */}
      {isGlobalMode && (
        <Alert
          severity="info"
          icon={<PublicIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="body2">
            <strong>Global Library Mode:</strong> Items created here are shared templates that can be
            imported into any practice library. Changes here affect the master catalog.
          </Typography>
        </Alert>
      )}

      {/* Practice Info (only shown for practice mode) */}
      {selectedPractice && !isGlobalMode && (
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
            <LibraryContentWithActions />
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
            Select a library to manage
          </Typography>
        </Box>
      )}

      {/* Form Modals */}
      <ServiceFormModal />
      <ProductFormModal />
      <PackageFormModal />
      <ConcernFormModal />

      {/* Import Modal */}
      <ImportFromGlobalModal />
    </Box>
  );
}
