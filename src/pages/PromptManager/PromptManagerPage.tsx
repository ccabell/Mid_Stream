/**
 * Prompt Manager Page
 *
 * Comprehensive UI for managing prompts, prompt sets, and agent linkage.
 * Prompts power agents - each agent can have one or more prompts.
 */

import { useState, useEffect } from 'react';
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import SearchIcon from '@mui/icons-material/Search';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import {
  usePromptStore,
  useFilteredPrompts,
  useSelectedPrompt,
} from 'stores/promptStore';
import type { Prompt, PromptCategory, PromptStatus } from 'stores/promptStore/types';

// ============================================================================
// CONSTANTS
// ============================================================================

const categoryLabels: Record<PromptCategory, string> = {
  extraction: 'Extraction',
  generation: 'Generation',
  verification: 'Verification',
  analysis: 'Analysis',
  communication: 'Communication',
  planning: 'Planning',
  custom: 'Custom',
};

const categoryColors: Record<PromptCategory, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'> = {
  extraction: 'primary',
  generation: 'success',
  verification: 'warning',
  analysis: 'info',
  communication: 'secondary',
  planning: 'default',
  custom: 'default',
};

const statusColors: Record<PromptStatus, 'default' | 'success' | 'warning'> = {
  draft: 'warning',
  active: 'success',
  archived: 'default',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PromptManagerPage() {
  const prompts = useFilteredPrompts();
  const agents = usePromptStore((s) => s.agents);
  const promptSets = usePromptStore((s) => s.promptSets);
  const isLoading = usePromptStore((s) => s.isLoading);
  const isSyncing = usePromptStore((s) => s.isSyncing);
  const error = usePromptStore((s) => s.error);
  const activeTab = usePromptStore((s) => s.activeTab);
  const categoryFilter = usePromptStore((s) => s.categoryFilter);
  const agentFilter = usePromptStore((s) => s.agentFilter);
  const searchQuery = usePromptStore((s) => s.searchQuery);
  const actions = usePromptStore((s) => s.actions);

  // Dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  // Form state for create/edit
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<PromptCategory>('custom');
  const [formContent, setFormContent] = useState('');
  const [formAgentId, setFormAgentId] = useState<string>('');

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load from backend on mount
  useEffect(() => {
    actions.loadFromBackend().catch(() => {
      // Backend might not be available, that's fine
    });
  }, [actions]);

  // ===========================================================================
  // HANDLERS
  // ===========================================================================

  const handleViewPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setViewDialogOpen(true);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setFormName(prompt.name);
    setFormDescription(prompt.description);
    setFormCategory(prompt.category);
    setFormContent(prompt.content);
    setFormAgentId(prompt.agentId || '');
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedPrompt) return;

    actions.updatePrompt(selectedPrompt.id, {
      name: formName,
      description: formDescription,
      category: formCategory,
      content: formContent,
    });

    // Handle agent linkage
    if (formAgentId && formAgentId !== selectedPrompt.agentId) {
      actions.linkPromptToAgent(selectedPrompt.id, formAgentId);
    } else if (!formAgentId && selectedPrompt.agentId) {
      actions.unlinkPromptFromAgent(selectedPrompt.id);
    }

    setSnackbar({ open: true, message: 'Prompt updated successfully', severity: 'success' });
    setEditDialogOpen(false);
    resetForm();
  };

  const handleCreatePrompt = () => {
    setFormName('');
    setFormDescription('');
    setFormCategory('custom');
    setFormContent('');
    setFormAgentId('');
    setCreateDialogOpen(true);
  };

  const handleSaveCreate = () => {
    const newPrompt = actions.createPrompt({
      name: formName,
      description: formDescription,
      category: formCategory,
      content: formContent,
      status: 'draft',
      variables: [],
      version: '1.0.0',
      tags: [],
    });

    if (formAgentId) {
      actions.linkPromptToAgent(newPrompt.id, formAgentId);
    }

    setSnackbar({ open: true, message: 'Prompt created successfully', severity: 'success' });
    setCreateDialogOpen(false);
    resetForm();
  };

  const handleDeletePrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedPrompt) return;
    actions.deletePrompt(selectedPrompt.id);
    setSnackbar({ open: true, message: 'Prompt deleted successfully', severity: 'success' });
    setDeleteDialogOpen(false);
    setSelectedPrompt(null);
  };

  const handleDuplicatePrompt = (prompt: Prompt) => {
    actions.duplicatePrompt(prompt.id);
    setSnackbar({ open: true, message: 'Prompt duplicated', severity: 'success' });
  };

  const handleLinkPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setFormAgentId(prompt.agentId || '');
    setLinkDialogOpen(true);
  };

  const handleSaveLink = () => {
    if (!selectedPrompt) return;

    if (formAgentId) {
      actions.linkPromptToAgent(selectedPrompt.id, formAgentId);
      setSnackbar({ open: true, message: 'Prompt linked to agent', severity: 'success' });
    } else if (selectedPrompt.agentId) {
      actions.unlinkPromptFromAgent(selectedPrompt.id);
      setSnackbar({ open: true, message: 'Prompt unlinked from agent', severity: 'success' });
    }

    setLinkDialogOpen(false);
    setSelectedPrompt(null);
  };

  const handleSync = async () => {
    try {
      await actions.syncToBackend();
      setSnackbar({ open: true, message: 'Synced to backend', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Sync failed', severity: 'error' });
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormCategory('custom');
    setFormContent('');
    setFormAgentId('');
    setSelectedPrompt(null);
  };

  // ===========================================================================
  // RENDER
  // ===========================================================================

  if (isLoading) {
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
            Manage prompts that power AI agents. Each prompt can be linked to an agent.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={isSyncing ? <CircularProgress size={16} /> : <CloudSyncIcon />}
            onClick={handleSync}
            disabled={isSyncing}
          >
            Sync
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreatePrompt}
          >
            Create Prompt
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => actions.setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => actions.setActiveTab(v)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab value="prompts" label={`Prompts (${prompts.length})`} />
        <Tab value="sets" label={`Prompt Sets (${promptSets.length})`} />
        <Tab value="agents" label={`Agents (${agents.length})`} />
      </Tabs>

      {/* Prompts Tab */}
      {activeTab === 'prompts' && (
        <>
          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => actions.setSearchQuery(e.target.value)}
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => actions.setCategoryFilter(e.target.value as PromptCategory | 'all')}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Agent</InputLabel>
              <Select
                value={agentFilter}
                label="Agent"
                onChange={(e) => actions.setAgentFilter(e.target.value)}
              >
                <MenuItem value="all">All Agents</MenuItem>
                {agents.map((agent) => (
                  <MenuItem key={agent.id} value={agent.id}>{agent.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Prompts Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Agent</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prompts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          No prompts found. Create your first prompt to get started.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    prompts.map((prompt) => (
                      <TableRow key={prompt.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {prompt.name}
                          </Typography>
                          {prompt.description && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {prompt.description.slice(0, 60)}
                              {prompt.description.length > 60 ? '...' : ''}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={categoryLabels[prompt.category]}
                            size="small"
                            color={categoryColors[prompt.category]}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {prompt.agentName ? (
                            <Chip
                              icon={<SmartToyIcon sx={{ fontSize: 16 }} />}
                              label={prompt.agentName}
                              size="small"
                              variant="filled"
                              color="primary"
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Unlinked
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={prompt.status}
                            size="small"
                            color={statusColors[prompt.status]}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={prompt.version}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'monospace' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View">
                            <IconButton size="small" onClick={() => handleViewPrompt(prompt)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEditPrompt(prompt)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={prompt.agentId ? 'Change Agent' : 'Link to Agent'}>
                            <IconButton size="small" onClick={() => handleLinkPrompt(prompt)}>
                              {prompt.agentId ? <LinkIcon fontSize="small" /> : <LinkOffIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Duplicate">
                            <IconButton size="small" onClick={() => handleDuplicatePrompt(prompt)}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDeletePrompt(prompt)} color="error">
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
        </>
      )}

      {/* Prompt Sets Tab */}
      {activeTab === 'sets' && (
        <Paper>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Prompt Sets
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} size="small">
              Create Set
            </Button>
          </Box>
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Prompts</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Agent</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {promptSets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No prompt sets found. Create a set to group prompts for sequential execution.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  promptSets.map((set) => (
                    <TableRow key={set.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{set.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {set.promptOrder.map((promptId) => (
                            <Chip key={promptId} label={promptId} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {set.agentName || <Typography variant="caption" color="text.secondary">Unlinked</Typography>}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Agents Tab */}
      {activeTab === 'agents' && (
        <Paper>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Registered Agents
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Agents are AI modules that use prompts to process data. Link prompts to agents to power them.
            </Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Agent</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Linked Prompts</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Has Page</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            backgroundColor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <SmartToyIcon sx={{ color: '#fff', fontSize: 18 }} />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{agent.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{agent.description}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={agent.type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {agent.promptIds.length > 0 ? (
                        <Chip label={`${agent.promptIds.length} prompt(s)`} size="small" color="success" />
                      ) : (
                        <Typography variant="caption" color="text.secondary">None</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {agent.hasPage ? (
                        <Chip label={agent.pagePath} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                      ) : (
                        <Typography variant="caption" color="text.secondary">No</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPrompt?.name}
          <Typography variant="body2" color="text.secondary">
            {categoryLabels[selectedPrompt?.category || 'custom']} • v{selectedPrompt?.version}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
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
            {selectedPrompt?.content || 'No content'}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button onClick={() => { setViewDialogOpen(false); if (selectedPrompt) handleEditPrompt(selectedPrompt); }}>
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Prompt</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                fullWidth
                size="small"
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formCategory}
                  label="Category"
                  onChange={(e) => setFormCategory(e.target.value as PromptCategory)}
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Link to Agent</InputLabel>
                <Select
                  value={formAgentId}
                  label="Link to Agent"
                  onChange={(e) => setFormAgentId(e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {agents.map((agent) => (
                    <MenuItem key={agent.id} value={agent.id}>{agent.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
            <TextField
              label="Prompt Content"
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEditDialogOpen(false); resetForm(); }}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" startIcon={<SaveIcon />}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Create Prompt</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g., SOAP Notes Generator"
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formCategory}
                  label="Category"
                  onChange={(e) => setFormCategory(e.target.value as PromptCategory)}
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Link to Agent</InputLabel>
                <Select
                  value={formAgentId}
                  label="Link to Agent"
                  onChange={(e) => setFormAgentId(e.target.value)}
                >
                  <MenuItem value="">None (create unlinked)</MenuItem>
                  {agents.map((agent) => (
                    <MenuItem key={agent.id} value={agent.id}>{agent.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="What does this prompt do?"
            />
            <TextField
              label="Prompt Content"
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              fullWidth
              multiline
              minRows={15}
              maxRows={30}
              placeholder="Enter your prompt content here...&#10;&#10;You can use variables like {{transcript}}, {{practice_context}}, etc."
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCreateDialogOpen(false); resetForm(); }}>Cancel</Button>
          <Button
            onClick={handleSaveCreate}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!formName || !formContent}
          >
            Create Prompt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Prompt?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete <strong>{selectedPrompt?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Link Prompt to Agent</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Select an agent to link <strong>{selectedPrompt?.name}</strong> to:
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Agent</InputLabel>
            <Select
              value={formAgentId}
              label="Agent"
              onChange={(e) => setFormAgentId(e.target.value)}
            >
              <MenuItem value="">None (unlink)</MenuItem>
              {agents.map((agent) => (
                <MenuItem key={agent.id} value={agent.id}>{agent.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveLink} variant="contained">
            {formAgentId ? 'Link' : 'Unlink'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
