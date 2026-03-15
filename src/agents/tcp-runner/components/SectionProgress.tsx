/**
 * Section Progress Component
 *
 * Shows the 5-section progress with status indicators.
 */

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EditIcon from '@mui/icons-material/Edit';
import { keyframes } from '@mui/system';
import type { TCPSectionId, SectionState } from '../types';
import { SECTION_ORDER, SECTION_LABELS } from '../types';

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

interface SectionProgressProps {
  sections: Record<TCPSectionId, SectionState>;
  currentSection: TCPSectionId | null;
  onSectionClick?: (sectionId: TCPSectionId) => void;
}

function SectionStatusIcon({ section }: { section: SectionState }) {
  const iconSize = 24;

  switch (section.status) {
    case 'streaming':
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: `${pulse} 1.5s ease-in-out infinite`,
          }}
        >
          <CircularProgress size={iconSize - 4} />
        </Box>
      );
    case 'completed':
      return <CheckCircleIcon sx={{ color: 'success.main', fontSize: iconSize }} />;
    case 'error':
      return <ErrorIcon sx={{ color: 'error.main', fontSize: iconSize }} />;
    case 'editing':
      return <EditIcon sx={{ color: 'warning.main', fontSize: iconSize }} />;
    case 'pending':
    default:
      return (
        <RadioButtonUncheckedIcon sx={{ color: 'text.disabled', fontSize: iconSize }} />
      );
  }
}

export function SectionProgress({
  sections,
  currentSection,
  onSectionClick,
}: SectionProgressProps) {
  const activeStep = currentSection ? SECTION_ORDER.indexOf(currentSection) : -1;

  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      sx={{
        '& .MuiStepLabel-root': {
          cursor: onSectionClick ? 'pointer' : 'default',
        },
      }}
    >
      {SECTION_ORDER.map((sectionId) => {
        const section = sections[sectionId];
        const isActive = sectionId === currentSection;

        return (
          <Step
            key={sectionId}
            completed={section.status === 'completed'}
            onClick={() => onSectionClick?.(sectionId)}
          >
            <StepLabel
              StepIconComponent={() => <SectionStatusIcon section={section} />}
              sx={{
                '& .MuiStepLabel-label': {
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'primary.main' : 'text.secondary',
                },
              }}
            >
              {SECTION_LABELS[sectionId]}
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
}

export default SectionProgress;
