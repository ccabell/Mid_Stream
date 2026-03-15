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
import { findMatchesUnified } from 'utils/stringMatcher';
import {
  getUnifiedProducts,
  getUnifiedServices,
  UNIFIED_COUNTS,
  convertToPLProduct,
  convertToPLService,
  type UnifiedGlobalItem,
} from 'data/globalLibraryUnified';
import type { PLProduct, PLService } from 'apiServices/practiceLibrary/types';

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
  const activeTab = usePracticeLibraryStore(practiceLibrarySelectors.selectActiveTab);
  const actions = usePracticeLibraryStore(practiceLibrarySelectors.selectActions);


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

      // Find matches against unified global library (353+ products from Supabase + manual)
      console.log(`Matching against ${UNIFIED_COUNTS.totalProducts} products and ${UNIFIED_COUNTS.totalServices} services`);
      const unifiedProducts = getUnifiedProducts();
      const unifiedServices = getUnifiedServices();
      const matches = findMatchesUnified(parseResult.items, unifiedServices, unifiedProducts);
      actions.setMatchResults(matches);

      // Move to review step
      actions.setImportStep(1);
    } catch (error) {
      console.error('Error processing file:', error);
      // TODO: Show error toast
    } finally {
      actions.setIsMatching(false);
    }
  }, [importFile, actions]);

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
    if (!selectedPractice) return;

    console.log('Importing items:', selectedMatches);
    console.log('Practice:', selectedPractice);

    // Determine if importing products or services based on active tab
    const itemType = activeTab === 'services' ? 'services' : 'products';
    const storageKey = `practiceLibrary_${selectedPractice.id}_${itemType}`;

    // Get existing items from localStorage
    const existingData = localStorage.getItem(storageKey);
    const existingItems: (PLProduct | PLService)[] = existingData ? JSON.parse(existingData) : [];

    // Convert matched items to practice library format
    const newItems: (PLProduct | PLService)[] = [];

    for (const selectedMatch of selectedMatches) {
      if (selectedMatch.match !== null) {
        // Import from global library match
        const matchedItem = selectedMatch.match.item as UnifiedGlobalItem;

        if (itemType === 'products') {
          const plProduct = convertToPLProduct(matchedItem, selectedPractice.id);
          // Check for duplicates by title
          if (!existingItems.some((item) => item.title === plProduct.title)) {
            newItems.push(plProduct);
          }
        } else {
          const plService = convertToPLService(matchedItem, selectedPractice.id);
          if (!existingItems.some((item) => item.title === plService.title)) {
            newItems.push(plService);
          }
        }
      } else if (selectedMatch.createNew) {
        // Create new item from parsed data
        const parsedItem = parsedItems[selectedMatch.sourceIndex];
        if (parsedItem) {
          const newItem: PLProduct | PLService = {
            id: `new-${Date.now()}-${selectedMatch.sourceIndex}`,
            practice_id: selectedPractice.id,
            title: parsedItem.name,
            description: parsedItem.description ?? null,
            category: parsedItem.category ?? null,
            price: parsedItem.price ?? null,
            is_active: true,
            is_preferred: false,
            concerns_addressed: [],
            suggest_when: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Service-specific fields
            ...(itemType === 'services' && {
              subcategory: null,
              price_tier: null,
              downtime: null,
              synergies: [],
              rationale_template: null,
            }),
          } as PLProduct | PLService;

          // Check for duplicates
          if (!existingItems.some((item) => item.title === newItem.title)) {
            newItems.push(newItem);
          }
        }
      }
    }

    // Save combined items to localStorage
    const allItems = [...existingItems, ...newItems];
    localStorage.setItem(storageKey, JSON.stringify(allItems));

    console.log(`Imported ${newItems.length} new ${itemType} to practice ${selectedPractice.name}`);

    // Close modal and reset import state
    actions.closeImportModal();
    actions.resetImportState();

    // Refresh the list by triggering a re-render (the hooks will reload from localStorage)
    if (itemType === 'products') {
      actions.setProducts({
        items: allItems as PLProduct[],
        total: allItems.length,
        page: 1,
        size: allItems.length,
        pages: 1,
      });
    } else {
      actions.setServices({
        items: allItems as PLService[],
        total: allItems.length,
        page: 1,
        size: allItems.length,
        pages: 1,
      });
    }
  }, [selectedMatches, selectedPractice, parsedItems, activeTab, actions]);

  if (!isOpen) return null;

  const canProceedFromUpload = importFile !== null;
  const canProceedFromReview = selectedMatches.some((m) => m.match !== null || m.createNew);

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Import Practice Library</Typography>
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
                Upload your practice's product and service list (JSON or CSV).
                We'll match them against our Global Library so you can select standardized items.
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
                We've matched your items against the Global Library. Review the suggestions,
                select the correct match from our catalog, or skip items you don't need.
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
