/**
 * File Upload Zone
 *
 * Drag-and-drop file upload component for importing library data.
 * Accepts JSON and CSV files.
 */

import { useCallback, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

const ACCEPTED_TYPES = ['.json', '.csv'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  disabled?: boolean;
}

export function FileUploadZone({
  onFileSelect,
  selectedFile,
  onClear,
  disabled = false,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      return `Invalid file type. Please upload ${ACCEPTED_TYPES.join(' or ')} files.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is 5MB.`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleBrowseClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (selectedFile) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderRadius: 1,
          bgcolor: 'success.lighter',
          border: '1px solid',
          borderColor: 'success.light',
        }}
      >
        <InsertDriveFileIcon sx={{ color: 'success.main', fontSize: 40 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }} noWrap>
            {selectedFile.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatFileSize(selectedFile.size)}
          </Typography>
        </Box>
        <IconButton onClick={onClear} size="small" disabled={disabled}>
          <DeleteIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          p: 4,
          borderRadius: 2,
          border: '2px dashed',
          borderColor: isDragOver ? 'primary.main' : error ? 'error.main' : 'divider',
          bgcolor: isDragOver ? 'primary.lighter' : 'background.default',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.2s ease',
          '&:hover': disabled
            ? {}
            : {
                borderColor: 'primary.light',
                bgcolor: 'action.hover',
              },
        }}
        onClick={disabled ? undefined : handleBrowseClick}
      >
        <CloudUploadIcon
          sx={{
            fontSize: 48,
            color: isDragOver ? 'primary.main' : 'text.secondary',
          }}
        />
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          Drag and drop your file here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Accepts JSON and CSV files (max 5MB)
        </Typography>
        <Button variant="outlined" size="small" disabled={disabled}>
          Browse Files
        </Button>
      </Box>

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
    </Box>
  );
}
