/**
 * PromptList Component
 *
 * Displays prompts grouped by category with search/filter
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import DescriptionIcon from '@mui/icons-material/Description';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';

import { usePromptStore, useFilteredPrompts, usePromptsByCategory } from '../usePromptStore';
import type { Prompt, PromptCategory } from '../types';
import { PROMPT_CATEGORIES } from '../types';

// Icon mapping
const CATEGORY_ICONS: Record<PromptCategory, React.ElementType> = {
  extraction: PsychologyIcon,
  hitl: FactCheckIcon,
  tcp: DescriptionIcon,
  agents: SmartToyIcon,
  reach: EmailIcon,
  coaching: SchoolIcon,
  system: SettingsIcon,
};

interface PromptListProps {
  onAddPrompt?: () => void;
}

export function PromptList({ onAddPrompt }: PromptListProps) {
  const { categoryFilter, searchQuery, selectedPromptId } = usePromptStore();
  const { setCategoryFilter, setSearchQuery, selectPrompt } = usePromptStore((s) => s.actions);
  const promptsByCategory = usePromptsByCategory();
  const filteredPrompts = useFilteredPrompts();

  const [expandedCategories, setExpandedCategories] = useState<Set<PromptCategory>>(
    new Set(Object.keys(PROMPT_CATEGORIES) as PromptCategory[])
  );

  const toggleCategory = (category: PromptCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const categories = Object.entries(PROMPT_CATEGORIES) as [PromptCategory, typeof PROMPT_CATEGORIES[PromptCategory]][];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Prompts
          </Typography>
          {onAddPrompt && (
            <Tooltip title="Add new prompt">
              <IconButton size="small" onClick={onAddPrompt} color="primary">
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* Category chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
          <Chip
            label="All"
            size="small"
            variant={categoryFilter === 'all' ? 'filled' : 'outlined'}
            onClick={() => setCategoryFilter('all')}
            sx={{ fontSize: '0.75rem' }}
          />
          {categories.map(([key, meta]) => (
            <Chip
              key={key}
              label={meta.label}
              size="small"
              variant={categoryFilter === key ? 'filled' : 'outlined'}
              onClick={() => setCategoryFilter(key)}
              sx={{ fontSize: '0.75rem' }}
            />
          ))}
        </Box>
      </Box>

      {/* List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List dense disablePadding>
          {categories.map(([category, meta]) => {
            const prompts = promptsByCategory[category] || [];
            const filteredCategoryPrompts = prompts.filter((p) =>
              searchQuery
                ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.description.toLowerCase().includes(searchQuery.toLowerCase())
                : true
            );

            if (categoryFilter !== 'all' && categoryFilter !== category) return null;
            if (filteredCategoryPrompts.length === 0 && categoryFilter === 'all') return null;

            const CategoryIcon = CATEGORY_ICONS[category];
            const isExpanded = expandedCategories.has(category);

            return (
              <Box key={category}>
                {/* Category header */}
                <ListItem
                  disablePadding
                  sx={{
                    bgcolor: 'action.hover',
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <ListItemButton onClick={() => toggleCategory(category)} dense>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CategoryIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={meta.label}
                      secondary={`${filteredCategoryPrompts.length} prompt${filteredCategoryPrompts.length !== 1 ? 's' : ''}`}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                    {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </ListItemButton>
                </ListItem>

                {/* Prompts in category */}
                <Collapse in={isExpanded}>
                  {filteredCategoryPrompts.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 2, px: 3, fontStyle: 'italic' }}
                    >
                      No prompts in this category
                    </Typography>
                  ) : (
                    filteredCategoryPrompts.map((prompt) => (
                      <PromptListItem
                        key={prompt.id}
                        prompt={prompt}
                        selected={selectedPromptId === prompt.id}
                        onSelect={() => selectPrompt(prompt.id)}
                      />
                    ))
                  )}
                </Collapse>
              </Box>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}

interface PromptListItemProps {
  prompt: Prompt;
  selected: boolean;
  onSelect: () => void;
}

function PromptListItem({ prompt, selected, onSelect }: PromptListItemProps) {
  const statusColor = {
    draft: 'warning',
    active: 'success',
    deprecated: 'error',
  }[prompt.status] as 'warning' | 'success' | 'error';

  return (
    <ListItem
      disablePadding
      secondaryAction={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {prompt.syncedToBackend ? (
            <Tooltip title="Synced to backend">
              <CloudDoneIcon fontSize="small" color="success" sx={{ opacity: 0.6 }} />
            </Tooltip>
          ) : (
            <Tooltip title="Local only">
              <CloudOffIcon fontSize="small" color="disabled" sx={{ opacity: 0.6 }} />
            </Tooltip>
          )}
        </Box>
      }
    >
      <ListItemButton
        selected={selected}
        onClick={onSelect}
        sx={{ pl: 4 }}
      >
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                {prompt.name}
              </Typography>
              <Chip
                label={prompt.status}
                size="small"
                color={statusColor}
                sx={{ height: 18, fontSize: '0.65rem' }}
              />
            </Box>
          }
          secondary={
            <Typography variant="caption" color="text.secondary" noWrap>
              v{prompt.currentVersion} • {prompt.variables.length} vars
            </Typography>
          }
        />
      </ListItemButton>
    </ListItem>
  );
}
