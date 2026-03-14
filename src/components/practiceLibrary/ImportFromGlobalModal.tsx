/**
 * Import From Global Modal
 *
 * Multi-step wizard for importing items from file and matching
 * them against the Global Library.
 */

import { useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { usePracticeLibraryStore, practiceLibrarySelectors } from 'stores/practiceLibraryStore';
import { FileUploadZone } from './FileUploadZone';
import { MatchReviewList } from './MatchReviewList';
import { parseFile, readFileAsText } from 'utils/fileParser';
import { findMatches } from 'utils/stringMatcher';
import { globalServices, globalProducts } from 'data/globalLibrarySeed';
import type { PLService, PLProduct } from 'apiServices/practiceLibrary/types';

const STEPS = [
  { label: 'Upload File', icon: CloudUploadIcon },
  { label: 'Review Matches', icon: CompareArrowsIcon },
  { label: 'Confirm Import', icon: CheckCircleIcon },
];

export function ImportFromGlobalModal() {
  const isOpen = usePracticeLibraryStore(practiceLibrarySelectors.selectIsImportModalOpen);
  const importStep = usePracticeLibraryStore(practiceLibrarySelectors.selectImportStep);
  const importFile = usePracticeLibraryStore(practiceLibrarySelectors.selectImportFile);
  const parsedItems = usePracticeLibraryStore(practiceLibrarySelectors.selectParsedItems);
  const matchResults = usePracticeLibraryStore(practiceLibrarySelectors.selectMatchResults);
  const selectedMatches = usePracticeLibraryStore(practiceLibrarySelectors.selectSelectedMatches);
  const isMatching = usePracticeLibraryStore(practiceLibrarySelectors.selectIsMatching);
  const selectedPractice = usePracticeLibraryStore(practiceLibrarySelectors.selectSelectedPractice);
  const actions = usePracticeLibraryStore(practiceLibrarySelectors.selectActions);

  // Convert global seed data to PLService/PLProduct format for matching
  const globalServicesList = useMemo<PLService[]>(() => {
    return globalServices.map((s, i) => ({
      ...s,
      id: `global-service-${i}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }, []);

  const globalProductsList = useMemo<PLProduct[]>(() => {
    return globalProducts.map((p, i) => ({
      ...p,
      id: `global-product-${i}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }, []);

  // Summary stats for confirm step
  const importSummary = useMemo(() => {
    const toImport = selectedMatches.filter((m) => m.match !== null || m.createNew);
    const fromGlobal = selectedMatches.filter((m) => m.match !== null);
    const createNew = selectedMatches.filter((m) => m.createNew);
    const skipped = selectedMatches.filter((m) => m.match === null && !m.createNew);

    return {
      total: toImport.length,
      fromGlobal: fromGlobal.length,
      createNew: createNew.length,
      skipped: skipped.length,
    };
  }, [selectedMatches]);

  const handleClose = useCallback(() => {
    actions.closeImportModal();
  }, [actions]);

  const handleFileSelect = useCallback(
    (file: File) => {
      actions.setImportFile(file);
    },
    [actions]
  );

  const handleFileClear = useCallback(() => {
    actions.setImportFile(null);
    actions.setParsedItems([]);
  }, [actions]);

  const handleParseAndMatch = useCallback(async () => {
    if (!importFile) return;

    actions.setIsMatching(true);

    try {
      // Read file content
      const content = await readFileAsText(importFile);

      // Parse the file
      const parseResult = parseFile(content, importFile.name);

      if (!parseResult.success) {
        console.error('Parse error:', parseResult.error);
        // TODO: Show error toast
        actions.setIsMatching(false);
        return;
      }

      actions.setParsedItems(parseResult.items);

      // Find matches against global library
      const matches = findMatches(parseResult.items, globalServicesList, globalProductsList);
      actions.setMatchResults(matches);

      // Move to review step
      actions.setImportStep(1);
    } catch (error) {
      console.error('Error processing file:', error);
      // TODO: Show error toast
    } finally {
      actions.setIsMatching(false);
    }
  }, [importFile, globalServicesList, globalProductsList, actions]);

  const handleUpdateMatch = useCallback(
    (index: number, match: typeof selectedMatches[number]) => {
      actions.updateSelectedMatch(index, match);
    },
    [actions]
  );

  const handleBack = useCallback(() => {
    const newStep = Math.max(0, importStep - 1) as 0 | 1 | 2;
    actions.setImportStep(newStep);
  }, [importStep, actions]);

  const handleNext = useCallback(() => {
    const newStep = Math.min(2, importStep + 1) as 0 | 1 | 2;
    actions.setImportStep(newStep);
  }, [importStep, actions]);

  const handleImport = useCallback(async () => {
    // TODO: Actually create the items in the practice library
    // For now, just close the modal
    console.log('Importing items:', selectedMatches);
    console.log('Practice:', selectedPractice);

    // Would call API here to create items

    actions.closeImportModal();
    // TODO: Show success toast
  }, [selectedMatches, selectedPractice, actions]);

  if (!isOpen) return null;

  const canProceedFromUpload = importFile !== null;
  const canProceedFromReview = selectedMatches.some((m) => m.match !== null || m.createNew);

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Import from File</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Stepper */}
        <Stepper activeStep={importStep} sx={{ mb: 3 }}>
          {STEPS.map((step, index) => (
            <Step key={step.label} completed={importStep > index}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ minHeight: 300 }}>
          {/* Step 0: Upload */}
          {importStep === 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload a JSON or CSV file containing your products and services.
                We'll help you match them to items in the Global Library.
              </Typography>

              <FileUploadZone
                onFileSelect={handleFileSelect}
                selectedFile={importFile}
                onClear={handleFileClear}
                disabled={isMatching}
              />

              {parsedItems.length > 0 && (
                <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                  Found {parsedItems.length} items in file
                </Typography>
              )}
            </Box>
          )}

          {/* Step 1: Review Matches */}
          {importStep === 1 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Review the suggested matches below. You can change the match,
                create a new item, or skip items you don't want to import.
              </Typography>

              {isMatching ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <MatchReviewList
                  matchResults={matchResults}
                  selectedMatches={selectedMatches}
                  onUpdateMatch={handleUpdateMatch}
                />
              )}
            </Box>
          )}

          {/* Step 2: Confirm */}
          {importStep === 2 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Review your import summary and confirm to add items to your practice library.
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2,
                  mb: 3,
                }}
              >
                <SummaryCard
                  title="Total to Import"
                  value={importSummary.total}
                  color="primary"
                />
                <SummaryCard
                  title="From Global Library"
                  value={importSummary.fromGlobal}
                  color="info"
                />
                <SummaryCard
                  title="Create New"
                  value={importSummary.createNew}
                  color="success"
                />
                <SummaryCard
                  title="Skipped"
                  value={importSummary.skipped}
                  color="default"
                />
              </Box>

              {selectedPractice && (
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  Items will be added to: <strong>{selectedPractice.name}</strong>
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>

        <Box sx={{ flex: 1 }} />

        {importStep > 0 && (
          <Button onClick={handleBack} disabled={isMatching}>
            Back
          </Button>
        )}

        {importStep === 0 && (
          <Button
            variant="contained"
            onClick={handleParseAndMatch}
            disabled={!canProceedFromUpload || isMatching}
            startIcon={isMatching ? <CircularProgress size={16} /> : undefined}
          >
            {isMatching ? 'Processing...' : 'Parse & Match'}
          </Button>
        )}

        {importStep === 1 && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceedFromReview}
          >
            Continue
          </Button>
        )}

        {importStep === 2 && (
          <Button
            variant="contained"
            color="success"
            onClick={handleImport}
            disabled={importSummary.total === 0}
          >
            Import {importSummary.total} Items
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  color: 'primary' | 'info' | 'success' | 'default';
}

function SummaryCard({ title, value, color }: SummaryCardProps) {
  const bgColor =
    color === 'primary'
      ? 'primary.lighter'
      : color === 'info'
        ? 'info.lighter'
        : color === 'success'
          ? 'success.lighter'
          : 'grey.100';

  const textColor =
    color === 'primary'
      ? 'primary.main'
      : color === 'info'
        ? 'info.main'
        : color === 'success'
          ? 'success.main'
          : 'text.secondary';

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        bgcolor: bgColor,
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" sx={{ color: textColor, fontWeight: 600 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </Box>
  );
}
