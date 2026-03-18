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
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import {
  usePromptStore,
  useFilteredPrompts,
  useSelectedPrompt,
} from 'stores/promptStore';
import type { Prompt, PromptCategory, PromptStatus, PromptSet } from 'stores/promptStore/types';
import { promptsApi } from 'apiServices/prompts.api';

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

  // Dialog state - Prompts
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  // Dialog state - Prompt Sets
  const [setDialogOpen, setSetDialogOpen] = useState(false);
  const [setDialogMode, setSetDialogMode] = useState<'create' | 'edit'>('create');
  const [deleteSetDialogOpen, setDeleteSetDialogOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<PromptSet | null>(null);

  // Form state for prompt sets
  const [promptSetName, setPromptSetName] = useState('');
  const [promptSetDescription, setPromptSetDescription] = useState('');
  const [promptSetOrder, setPromptSetOrder] = useState<string[]>([]);
  const [promptSetVersions, setPromptSetVersions] = useState<Record<string, string>>({});

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

  // Loading state for fetching prompt content
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Load from backend on mount
  useEffect(() => {
    actions.loadFromBackend().catch(() => {
      // Backend might not be available, that's fine
    });
  }, [actions]);

  // ===========================================================================
  // HANDLERS
  // ===========================================================================

  const handleViewPrompt = async (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setViewDialogOpen(true);

    // If content is empty and we have a backend ID, fetch full content
    if (!prompt.content && prompt.backendId) {
      setIsLoadingContent(true);
      try {
        const fullTemplate = await promptsApi.getTemplate(prompt.backendId);
        // Update local state with fetched content
        setSelectedPrompt({ ...prompt, content: fullTemplate.content });
        // Also update the store
        actions.updatePrompt(prompt.id, { content: fullTemplate.content });
      } catch (err) {
        console.error('Failed to fetch prompt content:', err);
      } finally {
        setIsLoadingContent(false);
      }
    }
  };

  const handleEditPrompt = async (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setFormName(prompt.name);
    setFormDescription(prompt.description);
    setFormCategory(prompt.category);
    setFormAgentId(prompt.agentId || '');
    setEditDialogOpen(true);

    // If content is empty and we have a backend ID, fetch full content
    if (!prompt.content && prompt.backendId) {
      setIsLoadingContent(true);
      setFormContent('Loading...');
      try {
        const fullTemplate = await promptsApi.getTemplate(prompt.backendId);
        setFormContent(fullTemplate.content);
        // Update the store for future access
        actions.updatePrompt(prompt.id, { content: fullTemplate.content });
      } catch (err) {
        console.error('Failed to fetch prompt content:', err);
        setFormContent('Failed to load prompt content');
      } finally {
        setIsLoadingContent(false);
      }
    } else {
      setFormContent(prompt.content);
    }
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

  // ===========================================================================
  // PROMPT SET HANDLERS
  // ===========================================================================

  const handleCreateSet = () => {
    setSetDialogMode('create');
    setPromptSetName('');
    setPromptSetDescription('');
    setPromptSetOrder([]);
    setPromptSetVersions({});
    setSelectedSet(null);
    setSetDialogOpen(true);
  };

  const handleEditSet = (set: PromptSet) => {
    setSetDialogMode('edit');
    setSelectedSet(set);
    setPromptSetName(set.name);
    setPromptSetDescription(set.description);
    setPromptSetOrder([...set.promptOrder]);
    setPromptSetVersions({ ...set.promptVersions });
    setSetDialogOpen(true);
  };

  const handleSaveSet = () => {
    if (setDialogMode === 'create') {
      actions.createPromptSet({
        name: promptSetName,
        description: promptSetDescription,
        promptOrder: promptSetOrder,
        promptVersions: promptSetVersions,
        status: 'active',
      });
      setSnackbar({ open: true, message: 'Prompt set created', severity: 'success' });
    } else if (selectedSet) {
      actions.updatePromptSet(selectedSet.id, {
        name: promptSetName,
        description: promptSetDescription,
        promptOrder: promptSetOrder,
        promptVersions: promptSetVersions,
      });
      setSnackbar({ open: true, message: 'Prompt set updated', severity: 'success' });
    }
    setSetDialogOpen(false);
    resetSetForm();
  };

  const handleDeleteSet = (set: PromptSet) => {
    setSelectedSet(set);
    setDeleteSetDialogOpen(true);
  };

  const handleConfirmDeleteSet = () => {
    if (!selectedSet) return;
    actions.deletePromptSet(selectedSet.id);
    setSnackbar({ open: true, message: 'Prompt set deleted', severity: 'success' });
    setDeleteSetDialogOpen(false);
    setSelectedSet(null);
  };

  const handleAddPromptToSet = (promptId: string) => {
    if (!promptSetOrder.includes(promptId)) {
      setPromptSetOrder([...promptSetOrder, promptId]);
    }
  };

  const handleRemovePromptFromSet = (promptId: string) => {
    setPromptSetOrder(promptSetOrder.filter((id) => id !== promptId));
    const newVersions = { ...promptSetVersions };
    delete newVersions[promptId];
    setPromptSetVersions(newVersions);
  };

  const handleMovePromptInSet = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...promptSetOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newOrder.length) return;
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex]!, newOrder[index]!];
    setPromptSetOrder(newOrder);
  };

  const handleSetPromptVersion = (promptId: string, version: string) => {
    setPromptSetVersions({ ...promptSetVersions, [promptId]: version });
  };

  const resetSetForm = () => {
    setPromptSetName('');
    setPromptSetDescription('');
    setPromptSetOrder([]);
    setPromptSetVersions({});
    setSelectedSet(null);
  };

  // Helper to get prompt by ID or promptOrder ID (like "prompt_1")
  const getPromptForSet = (promptId: string): Prompt | undefined => {
    // First try exact match
    let prompt = prompts.find((p) => p.id === promptId);
    if (prompt) return prompt;
    // Try matching by backendId's prompt_id field (for backend sets)
    prompt = prompts.find((p) => p.backendId === promptId);
    if (prompt) return prompt;
    // Try matching by category/name pattern
    prompt = prompts.find((p) =>
      p.name.toLowerCase().includes(promptId.replace('_', ' '))
    );
    return prompt;
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
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Prompt Sets
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Combine prompts into ordered sequences for multi-pass extraction
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={handleCreateSet}>
              Create Set
            </Button>
          </Box>
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Prompts</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {promptSets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <PlaylistAddIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No prompt sets found. Create a set to group prompts for sequential execution.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  promptSets.map((set) => (
                    <TableRow key={set.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{set.name}</Typography>
                          {set.backendId && (
                            <Chip label="Backend" size="small" color="success" sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 250 }}>
                          {set.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                          {set.promptOrder.map((promptId, idx) => {
                            const version = set.promptVersions[promptId];
                            return (
                              <Box key={promptId} sx={{ display: 'flex', alignItems: 'center' }}>
                                {idx > 0 && <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }}>→</Typography>}
                                <Chip
                                  label={`${promptId}${version ? ` (${version})` : ''}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                                />
                              </Box>
                            );
                          })}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={set.status}
                          size="small"
                          color={set.status === 'active' ? 'success' : set.status === 'draft' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit Set">
                          <IconButton size="small" onClick={() => handleEditSet(set)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Set">
                          <IconButton size="small" color="error" onClick={() => handleDeleteSet(set)}>
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
            {selectedPrompt?.backendId && (
              <Chip label="Backend" size="small" color="success" sx={{ ml: 1 }} />
            )}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {isLoadingContent ? (
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
              {selectedPrompt?.content || 'No content available'}
            </Box>
          )}
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
            {isLoadingContent ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  Loading prompt content...
                </Typography>
              </Box>
            ) : (
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
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEditDialogOpen(false); resetForm(); }}>Cancel</Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isLoadingContent}
          >
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

      {/* Prompt Set Create/Edit Dialog */}
      <Dialog open={setDialogOpen} onClose={() => setSetDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {setDialogMode === 'create' ? 'Create Prompt Set' : 'Edit Prompt Set'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Info */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Set Name"
                value={promptSetName}
                onChange={(e) => setPromptSetName(e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g., 2-Step Patient Intelligence"
              />
            </Box>
            <TextField
              label="Description"
              value={promptSetDescription}
              onChange={(e) => setPromptSetDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="Describe what this prompt set does..."
            />

            {/* Selected Prompts */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Prompts in Set ({promptSetOrder.length})
              </Typography>
              {promptSetOrder.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary">
                    No prompts added yet. Select prompts from below to add them.
                  </Typography>
                </Paper>
              ) : (
                <Paper variant="outlined">
                  {promptSetOrder.map((promptId, index) => {
                    const prompt = getPromptForSet(promptId);
                    const version = promptSetVersions[promptId] || 'latest';
                    return (
                      <Box
                        key={promptId}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1.5,
                          borderBottom: index < promptSetOrder.length - 1 ? 1 : 0,
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24, fontWeight: 600 }}>
                          {index + 1}.
                        </Typography>
                        <DragIndicatorIcon sx={{ color: 'text.disabled', cursor: 'grab' }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {prompt?.name || promptId}
                          </Typography>
                          {prompt?.description && (
                            <Typography variant="caption" color="text.secondary">
                              {prompt.description.slice(0, 60)}...
                            </Typography>
                          )}
                        </Box>
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                          <Select
                            value={version}
                            onChange={(e) => handleSetPromptVersion(promptId, e.target.value)}
                            size="small"
                            sx={{ fontSize: '0.8rem' }}
                          >
                            <MenuItem value="latest">Latest</MenuItem>
                            <MenuItem value="v1">v1</MenuItem>
                            <MenuItem value="v2">v2</MenuItem>
                            <MenuItem value="v3">v3</MenuItem>
                          </Select>
                        </FormControl>
                        <Tooltip title="Move Up">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleMovePromptInSet(index, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUpwardIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Move Down">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleMovePromptInSet(index, 'down')}
                              disabled={index === promptSetOrder.length - 1}
                            >
                              <ArrowDownwardIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemovePromptFromSet(promptId)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    );
                  })}
                </Paper>
              )}
            </Box>

            {/* Available Prompts */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Available Prompts
              </Typography>
              <Paper variant="outlined" sx={{ maxHeight: 250, overflow: 'auto' }}>
                {prompts.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No prompts available. Create prompts first.
                    </Typography>
                  </Box>
                ) : (
                  prompts.map((prompt) => {
                    const isAdded = promptSetOrder.includes(prompt.id) ||
                      promptSetOrder.includes(prompt.backendId || '');
                    return (
                      <Box
                        key={prompt.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1.5,
                          borderBottom: 1,
                          borderColor: 'divider',
                          bgcolor: isAdded ? 'action.selected' : 'transparent',
                          '&:last-child': { borderBottom: 0 },
                        }}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {prompt.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {categoryLabels[prompt.category]} • v{prompt.version}
                          </Typography>
                        </Box>
                        {isAdded ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Added"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddPromptToSet(prompt.backendId || prompt.id)}
                          >
                            Add
                          </Button>
                        )}
                      </Box>
                    );
                  })
                )}
              </Paper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSetDialogOpen(false); resetSetForm(); }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveSet}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!promptSetName || promptSetOrder.length === 0}
          >
            {setDialogMode === 'create' ? 'Create Set' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Prompt Set Dialog */}
      <Dialog open={deleteSetDialogOpen} onClose={() => setDeleteSetDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Prompt Set?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete <strong>{selectedSet?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will not delete the individual prompts, only the set grouping.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDeleteSet} variant="contained" color="error">
            Delete Set
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
