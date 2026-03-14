/**
 * PromptEditor Component
 *
 * Full-featured markdown editor for prompts with syntax highlighting
 */

import { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import UndoIcon from '@mui/icons-material/Undo';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HistoryIcon from '@mui/icons-material/History';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { usePromptStore, useSelectedPrompt, extractVariables } from '../usePromptStore';
import type { Prompt, PromptVariable } from '../types';
import { PROMPT_CATEGORIES } from '../types';

interface PromptEditorProps {
  onRunTest?: () => void;
}

export function PromptEditor({ onRunTest }: PromptEditorProps) {
  const selectedPrompt = useSelectedPrompt();
  const { editedContent, hasUnsavedChanges } = usePromptStore();
  const { setEditedContent, saveChanges, discardChanges } = usePromptStore((s) => s.actions);

  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Extract variables from current content
  const detectedVariables = useMemo(() => {
    return editedContent ? extractVariables(editedContent) : [];
  }, [editedContent]);

  // Word/line count
  const stats = useMemo(() => {
    if (!editedContent) return { lines: 0, words: 0, chars: 0 };
    const lines = editedContent.split('\n').length;
    const words = editedContent.split(/\s+/).filter(Boolean).length;
    const chars = editedContent.length;
    return { lines, words, chars };
  }, [editedContent]);

  const handleCopy = useCallback(async () => {
    if (editedContent) {
      await navigator.clipboard.writeText(editedContent);
    }
  }, [editedContent]);

  const handleExportMd = useCallback(() => {
    if (!selectedPrompt || !editedContent) return;
    const blob = new Blob([editedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPrompt.slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedPrompt, editedContent]);

  if (!selectedPrompt) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
        }}
      >
        <Typography variant="body1">Select a prompt to edit</Typography>
      </Box>
    );
  }

  const categoryMeta = PROMPT_CATEGORIES[selectedPrompt.category];

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...(isFullscreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          bgcolor: 'background.default',
        }),
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {selectedPrompt.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip label={categoryMeta.label} size="small" variant="outlined" />
              <Chip label={`v${selectedPrompt.currentVersion}`} size="small" />
              <Typography variant="caption" color="text.secondary">
                {stats.lines} lines • {stats.words} words
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasUnsavedChanges && (
              <Chip label="Unsaved" color="warning" size="small" />
            )}

            <Tooltip title="Discard changes">
              <span>
                <IconButton
                  size="small"
                  onClick={discardChanges}
                  disabled={!hasUnsavedChanges}
                >
                  <UndoIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Copy to clipboard">
              <IconButton size="small" onClick={handleCopy}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              <IconButton size="small" onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MoreVertIcon fontSize="small" />
            </IconButton>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem onClick={() => { handleExportMd(); setMenuAnchor(null); }}>
                <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Export as .md</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => setMenuAnchor(null)}>
                <ListItemIcon><CloudUploadIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Sync to backend</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => setMenuAnchor(null)}>
                <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Version history</ListItemText>
              </MenuItem>
            </Menu>

            <Button
              variant="outlined"
              size="small"
              startIcon={<PlayArrowIcon />}
              onClick={onRunTest}
              sx={{ ml: 1 }}
            >
              Test
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              onClick={saveChanges}
              disabled={!hasUnsavedChanges}
            >
              Save
            </Button>
          </Box>
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {selectedPrompt.description}
        </Typography>

        {/* Detected variables */}
        {detectedVariables.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              Variables:
            </Typography>
            {detectedVariables.map((v) => (
              <Chip
                key={v.name}
                label={`{{${v.name}}}`}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 40 }}>
          <Tab
            value="edit"
            label="Edit"
            icon={<CodeIcon fontSize="small" />}
            iconPosition="start"
            sx={{ minHeight: 40, py: 0 }}
          />
          <Tab
            value="preview"
            label="Preview"
            icon={<VisibilityIcon fontSize="small" />}
            iconPosition="start"
            sx={{ minHeight: 40, py: 0 }}
          />
        </Tabs>
      </Box>

      {/* Editor / Preview */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', p: 2 }}>
        {tab === 'edit' ? (
          <TextField
            fullWidth
            multiline
            value={editedContent || ''}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Enter prompt content..."
            sx={{
              height: '100%',
              '& .MuiInputBase-root': {
                height: '100%',
                alignItems: 'flex-start',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                lineHeight: 1.6,
              },
              '& .MuiInputBase-input': {
                height: '100% !important',
                overflow: 'auto !important',
              },
            }}
          />
        ) : (
          <Paper
            variant="outlined"
            sx={{
              height: '100%',
              overflow: 'auto',
              p: 2,
              bgcolor: 'grey.50',
            }}
          >
            <MarkdownPreview content={editedContent || ''} />
          </Paper>
        )}
      </Box>
    </Box>
  );
}

// Simple markdown preview component
function MarkdownPreview({ content }: { content: string }) {
  // Very basic markdown rendering - in production use react-markdown
  const rendered = useMemo(() => {
    return content
      .split('\n')
      .map((line, i) => {
        // Headers
        if (line.startsWith('# ')) {
          return (
            <Typography key={i} variant="h4" gutterBottom sx={{ mt: i > 0 ? 2 : 0 }}>
              {line.slice(2)}
            </Typography>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <Typography key={i} variant="h5" gutterBottom sx={{ mt: 2 }}>
              {line.slice(3)}
            </Typography>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <Typography key={i} variant="h6" gutterBottom sx={{ mt: 1.5 }}>
              {line.slice(4)}
            </Typography>
          );
        }

        // Code blocks
        if (line.startsWith('```')) {
          return null; // Simplified - skip code fence markers
        }

        // Lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <Typography key={i} variant="body2" sx={{ pl: 2 }}>
              • {line.slice(2)}
            </Typography>
          );
        }

        // Numbered lists
        if (/^\d+\.\s/.test(line)) {
          return (
            <Typography key={i} variant="body2" sx={{ pl: 2 }}>
              {line}
            </Typography>
          );
        }

        // Tables (simplified)
        if (line.startsWith('|')) {
          return (
            <Typography
              key={i}
              variant="body2"
              sx={{ fontFamily: 'monospace', fontSize: '0.8rem', bgcolor: 'grey.100', px: 1 }}
            >
              {line}
            </Typography>
          );
        }

        // Empty lines
        if (!line.trim()) {
          return <Box key={i} sx={{ height: 8 }} />;
        }

        // Regular text - highlight variables
        const highlighted = line.replace(
          /\{\{(\w+)\}\}/g,
          '<span style="background: #e3f2fd; padding: 2px 4px; border-radius: 3px; font-family: monospace;">{{$1}}</span>'
        );

        return (
          <Typography
            key={i}
            variant="body2"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        );
      });
  }, [content]);

  return <Box>{rendered}</Box>;
}
