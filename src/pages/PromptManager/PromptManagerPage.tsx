/**
 * Prompt Manager Page
 *
 * UI for managing prompts, mirroring Prompt Runner's interface.
 * Shows Prompt Sets and Prompt Templates (extraction prompts).
 */

import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';

import { promptsApi, type PromptTemplate, type PromptSet } from 'apiServices/prompts.api';

export function PromptManagerPage() {
  // State
  const [promptSets, setPromptSets] = useState<PromptSet[]>([]);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [templateContent, setTemplateContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<PromptTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [setsResponse, templatesResponse] = await Promise.all([
        promptsApi.listSets(),
        promptsApi.listTemplates(),
      ]);
      setPromptSets(setsResponse.data);
      setPromptTemplates(templatesResponse.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // View template content
  const handleViewBody = async (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setViewDialogOpen(true);
    setLoadingContent(true);
    try {
      const detail = await promptsApi.getTemplate(template.id);
      setTemplateContent(detail.content);
    } catch (e) {
      setTemplateContent('Failed to load content: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setLoadingContent(false);
    }
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedTemplate(null);
    setTemplateContent('');
  };

  // Edit template
  const handleEdit = async (template: PromptTemplate) => {
    setEditingTemplate(template);
    setEditName(template.name);
    setEditDescription(template.description || '');
    setEditDialogOpen(true);
    setLoadingContent(true);
    try {
      const detail = await promptsApi.getTemplate(template.id);
      setEditContent(detail.content || '');
    } catch (e) {
      setEditContent('');
      setSnackbar({ open: true, message: 'Failed to load content', severity: 'error' });
    } finally {
      setLoadingContent(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate) return;
    setSaving(true);
    try {
      await promptsApi.updateTemplate(editingTemplate.id, {
        name: editName,
        description: editDescription,
        content: editContent,
      });
      setSnackbar({ open: true, message: 'Prompt updated successfully', severity: 'success' });
      setEditDialogOpen(false);
      setEditingTemplate(null);
      loadData(); // Refresh list
    } catch (e) {
      setSnackbar({
        open: true,
        message: `Failed to save: ${e instanceof Error ? e.message : 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingTemplate(null);
    setEditContent('');
    setEditName('');
    setEditDescription('');
  };

  // Delete template
  const handleDeleteClick = (template: PromptTemplate) => {
    setDeletingTemplate(template);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTemplate) return;
    setDeleting(true);
    try {
      await promptsApi.deleteTemplate(deletingTemplate.id);
      setSnackbar({ open: true, message: 'Prompt deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setDeletingTemplate(null);
      loadData(); // Refresh list
    } catch (e) {
      setSnackbar({
        open: true,
        message: `Failed to delete: ${e instanceof Error ? e.message : 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingTemplate(null);
  };

  // Group templates by prompt_id for display (unused for now, but available for future grouping)
  const _groupedTemplates = promptTemplates.reduce<Record<string, PromptTemplate[]>>((acc, template) => {
    const existing = acc[template.prompt_id];
    if (existing) {
      existing.push(template);
    } else {
      acc[template.prompt_id] = [template];
    }
    return acc;
  }, {});

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Prompt Library
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage prompt sets and extraction prompts
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Prompt Sets Section */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            Prompt Sets
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            disabled
          >
            Add Prompt Set
          </Button>
        </Box>
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Set ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Prompt Order</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {promptSets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No prompt sets found
                  </TableCell>
                </TableRow>
              ) : (
                promptSets.map((set) => (
                  <TableRow key={set.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} fontFamily="monospace">
                        {set.set_id}
                      </Typography>
                    </TableCell>
                    <TableCell>{set.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {set.prompt_order.map((promptId, idx) => (
                          <Chip
                            key={idx}
                            label={promptId}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit (coming soon)">
                        <span>
                          <IconButton size="small" disabled>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Prompt Templates Section */}
      <Paper>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            Prompt Templates (Extraction Prompts)
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
            disabled
          >
            Add Extraction Prompt
          </Button>
        </Box>
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Prompt ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {promptTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No prompt templates found
                  </TableCell>
                </TableRow>
              ) : (
                promptTemplates.map((template) => (
                  <TableRow key={template.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} fontFamily="monospace">
                        {template.prompt_id}
                      </Typography>
                    </TableCell>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={template.version}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontFamily: 'monospace' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View body">
                        <IconButton size="small" onClick={() => handleViewBody(template)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(template)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteClick(template)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Content Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate?.name}
          <Typography variant="body2" color="text.secondary">
            {selectedTemplate?.prompt_id} - {selectedTemplate?.version}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {loadingContent ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: '60vh',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {templateContent}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Edit Prompt Template
          {editingTemplate && (
            <Typography variant="body2" color="text.secondary">
              {editingTemplate.prompt_id} - {editingTemplate.version}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {loadingContent ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                fullWidth
                size="small"
                multiline
                rows={2}
              />
              <TextField
                label="Prompt Content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                fullWidth
                multiline
                minRows={15}
                maxRows={30}
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={saving || loadingContent}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Prompt Template?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete <strong>{deletingTemplate?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
