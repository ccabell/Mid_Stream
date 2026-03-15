/**
 * Practice Configuration Panel
 *
 * Allows practices to select which anatomy areas and concerns apply to them.
 * Generates MD export for AI prompt injection.
 */

import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PreviewIcon from '@mui/icons-material/Preview';
import SaveIcon from '@mui/icons-material/Save';
import {
  globalAnatomyAreas,
  globalConcerns,
  getAnatomyAreasByRegion,
  getConcernsByCategory,
  anatomyRegionLabels,
  concernCategoryLabels,
  type AnatomyRegion,
  type ConcernCategory,
} from 'data/anatomyAndConcerns';
import { usePracticeLibraryStore } from 'stores/practiceLibraryStore';
import { generatePracticeConfigMD } from 'utils/practiceConfigExport';

export function PracticeConfigPanel() {
  const selectedPractice = usePracticeLibraryStore((state) => state.selectedPractice);
  const practiceConfig = usePracticeLibraryStore((state) => state.practiceConfig);
  const actions = usePracticeLibraryStore((state) => state.actions);

  const [customAreaInput, setCustomAreaInput] = useState('');
  const [customConcernInput, setCustomConcernInput] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (selectedPractice?.id) {
      actions.loadPracticeConfig(selectedPractice.id);
    }
  }, [selectedPractice?.id, actions]);

  const selectedAreas = useMemo(
    () => new Set(practiceConfig?.selectedAnatomyAreas ?? []),
    [practiceConfig?.selectedAnatomyAreas]
  );

  const selectedConcerns = useMemo(
    () => new Set(practiceConfig?.selectedConcerns ?? []),
    [practiceConfig?.selectedConcerns]
  );

  const handleAreaToggle = (areaId: string) => {
    const newAreas = selectedAreas.has(areaId)
      ? [...selectedAreas].filter((id) => id !== areaId)
      : [...selectedAreas, areaId];
    actions.updateSelectedAnatomyAreas(newAreas);
  };

  const handleConcernToggle = (concernId: string) => {
    const newConcerns = selectedConcerns.has(concernId)
      ? [...selectedConcerns].filter((id) => id !== concernId)
      : [...selectedConcerns, concernId];
    actions.updateSelectedConcerns(newConcerns);
  };

  const handleSelectAllAreas = (region: AnatomyRegion) => {
    const regionAreas = getAnatomyAreasByRegion(region);
    const allSelected = regionAreas.every((area) => selectedAreas.has(area.id));
    const newAreas = allSelected
      ? [...selectedAreas].filter((id) => !regionAreas.some((a) => a.id === id))
      : [...selectedAreas, ...regionAreas.map((a) => a.id)];
    actions.updateSelectedAnatomyAreas([...new Set(newAreas)]);
  };

  const handleSelectAllConcerns = (category: ConcernCategory) => {
    const categoryConcerns = getConcernsByCategory(category);
    const allSelected = categoryConcerns.every((c) => selectedConcerns.has(c.id));
    const newConcerns = allSelected
      ? [...selectedConcerns].filter((id) => !categoryConcerns.some((c) => c.id === id))
      : [...selectedConcerns, ...categoryConcerns.map((c) => c.id)];
    actions.updateSelectedConcerns([...new Set(newConcerns)]);
  };

  const handleAddCustomArea = () => {
    if (customAreaInput.trim()) {
      actions.addCustomAnatomyArea(customAreaInput.trim());
      setCustomAreaInput('');
    }
  };

  const handleAddCustomConcern = () => {
    if (customConcernInput.trim()) {
      actions.addCustomConcern(customConcernInput.trim());
      setCustomConcernInput('');
    }
  };

  const handleSave = () => {
    actions.savePracticeConfig();
    setSnackbarMessage('Configuration saved!');
    setSnackbarOpen(true);
  };

  const handleExportMD = () => {
    if (!selectedPractice || !practiceConfig) return;
    const md = generatePracticeConfigMD(selectedPractice, practiceConfig);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPractice.name.replace(/\s+/g, '_')}_config.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMD = async () => {
    if (!selectedPractice || !practiceConfig) return;
    const md = generatePracticeConfigMD(selectedPractice, practiceConfig);
    await navigator.clipboard.writeText(md);
    setSnackbarMessage('Copied to clipboard!');
    setSnackbarOpen(true);
  };

  const previewMD = useMemo(() => {
    if (!selectedPractice || !practiceConfig) return '';
    return generatePracticeConfigMD(selectedPractice, practiceConfig);
  }, [selectedPractice, practiceConfig]);

  const anatomyRegions: AnatomyRegion[] = ['face', 'body', 'skin'];
  const concernCategories: ConcernCategory[] = [
    'aging',
    'skin_quality',
    'pigmentation',
    'vascular',
    'body_contouring',
    'hair',
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<PreviewIcon />}
          onClick={() => setPreviewOpen(true)}
          disabled={!practiceConfig}
        >
          Preview MD
        </Button>
        <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyMD}
          disabled={!practiceConfig}
        >
          Copy MD
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportMD}
          disabled={!practiceConfig}
        >
          Export MD
        </Button>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
          Save Configuration
        </Button>
      </Box>

      {/* Two-column layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Left Column: Anatomy Areas */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Anatomy Areas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the treatment areas this practice offers.
            </Typography>

            {anatomyRegions.map((region) => {
              const regionAreas = getAnatomyAreasByRegion(region);
              const allSelected = regionAreas.every((area) => selectedAreas.has(area.id));
              const someSelected =
                regionAreas.some((area) => selectedAreas.has(area.id)) && !allSelected;

              return (
                <Accordion key={region} defaultExpanded={region === 'face'}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={() => handleSelectAllAreas(region)}
                        onClick={(e) => e.stopPropagation()}
                        size="small"
                      />
                      <Typography variant="subtitle2">{anatomyRegionLabels[region]}</Typography>
                      <Chip
                        label={`${regionAreas.filter((a) => selectedAreas.has(a.id)).length}/${regionAreas.length}`}
                        size="small"
                        sx={{ ml: 'auto', mr: 1 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormGroup sx={{ pl: 2 }}>
                      {regionAreas.map((area) => (
                        <FormControlLabel
                          key={area.id}
                          control={
                            <Checkbox
                              checked={selectedAreas.has(area.id)}
                              onChange={() => handleAreaToggle(area.id)}
                              size="small"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2">{area.name}</Typography>
                              {area.subAreas && (
                                <Typography variant="caption" color="text.secondary">
                                  {area.subAreas.join(', ')}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      ))}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>
              );
            })}

            {/* Custom anatomy areas */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Custom Anatomy Areas
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                placeholder="Add custom area..."
                value={customAreaInput}
                onChange={(e) => setCustomAreaInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomArea()}
                sx={{ flex: 1 }}
              />
              <Button variant="outlined" size="small" onClick={handleAddCustomArea}>
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {practiceConfig?.customAnatomyAreas.map((area) => (
                <Chip
                  key={area}
                  label={area}
                  onDelete={() => actions.removeCustomAnatomyArea(area)}
                  size="small"
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Right Column: Concerns */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Patient Concerns
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the concerns this practice addresses.
            </Typography>

            {concernCategories.map((category) => {
              const categoryConcerns = getConcernsByCategory(category);
              const allSelected = categoryConcerns.every((c) => selectedConcerns.has(c.id));
              const someSelected =
                categoryConcerns.some((c) => selectedConcerns.has(c.id)) && !allSelected;

              return (
                <Accordion key={category} defaultExpanded={category === 'aging'}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={() => handleSelectAllConcerns(category)}
                        onClick={(e) => e.stopPropagation()}
                        size="small"
                      />
                      <Typography variant="subtitle2">
                        {concernCategoryLabels[category]}
                      </Typography>
                      <Chip
                        label={`${categoryConcerns.filter((c) => selectedConcerns.has(c.id)).length}/${categoryConcerns.length}`}
                        size="small"
                        sx={{ ml: 'auto', mr: 1 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormGroup sx={{ pl: 2 }}>
                      {categoryConcerns.map((concern) => (
                        <FormControlLabel
                          key={concern.id}
                          control={
                            <Checkbox
                              checked={selectedConcerns.has(concern.id)}
                              onChange={() => handleConcernToggle(concern.id)}
                              size="small"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2">{concern.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {concern.description}
                              </Typography>
                            </Box>
                          }
                        />
                      ))}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>
              );
            })}

            {/* Custom concerns */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Custom Concerns
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                placeholder="Add custom concern..."
                value={customConcernInput}
                onChange={(e) => setCustomConcernInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomConcern()}
                sx={{ flex: 1 }}
              />
              <Button variant="outlined" size="small" onClick={handleAddCustomConcern}>
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {practiceConfig?.customConcerns.map((concern) => (
                <Chip
                  key={concern}
                  label={concern}
                  onDelete={() => actions.removeCustomConcern(concern)}
                  size="small"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Configuration MD Preview</DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            sx={{
              backgroundColor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: 12,
              fontFamily: 'monospace',
              maxHeight: 500,
            }}
          >
            {previewMD}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button onClick={handleCopyMD} startIcon={<ContentCopyIcon />}>
            Copy
          </Button>
          <Button onClick={handleExportMD} startIcon={<DownloadIcon />} variant="contained">
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
