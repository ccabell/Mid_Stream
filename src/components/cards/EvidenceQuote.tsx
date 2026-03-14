/**
 * EvidenceQuote - Display transcript evidence with speaker attribution
 *
 * Shows a quoted snippet from the transcript with speaker indicator
 * and optional confidence score.
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

export interface EvidenceQuoteProps {
  /** The quoted text from transcript */
  quote: string;
  /** Who said this */
  speaker: 'patient' | 'provider';
  /** Confidence score 0-1 */
  confidence?: number;
  /** Whether to show compact version */
  compact?: boolean;
}

export function EvidenceQuote({ quote, speaker, confidence, compact = false }: EvidenceQuoteProps) {
  const speakerColor = speaker === 'patient' ? '#6366f1' : '#0891b2';
  const speakerLabel = speaker === 'patient' ? 'Patient' : 'Provider';
  const SpeakerIcon = speaker === 'patient' ? PersonIcon : MedicalServicesIcon;

  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          py: 0.75,
        }}
      >
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: `${speakerColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            mt: 0.25,
          }}
        >
          <SpeakerIcon sx={{ fontSize: 12, color: speakerColor }} />
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}
        >
          "{quote}"
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        backgroundColor: 'grey.50',
        borderLeft: '3px solid',
        borderColor: speakerColor,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              backgroundColor: `${speakerColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SpeakerIcon sx={{ fontSize: 13, color: speakerColor }} />
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: speakerColor }}>
            {speakerLabel}
          </Typography>
        </Box>
        {confidence !== undefined && (
          <Chip
            label={`${Math.round(confidence * 100)}%`}
            size="small"
            sx={{
              height: 20,
              fontSize: 10,
              fontWeight: 600,
              backgroundColor: confidence >= 0.8 ? '#dcfce7' : confidence >= 0.5 ? '#fef9c3' : '#fee2e2',
              color: confidence >= 0.8 ? '#166534' : confidence >= 0.5 ? '#854d0e' : '#991b1b',
            }}
          />
        )}
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontStyle: 'italic',
          lineHeight: 1.6,
          pl: 3.5,
        }}
      >
        "{quote}"
      </Typography>
    </Box>
  );
}

/** Display a list of evidence quotes */
export interface EvidenceListProps {
  evidence: Array<{
    quote: string;
    speaker: 'patient' | 'provider';
    confidence?: number;
  }>;
  maxItems?: number;
  compact?: boolean;
}

export function EvidenceList({ evidence, maxItems = 3, compact = false }: EvidenceListProps) {
  const displayEvidence = evidence.slice(0, maxItems);
  const remainingCount = evidence.length - maxItems;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: compact ? 0 : 1 }}>
      {displayEvidence.map((item, i) => (
        <EvidenceQuote
          key={i}
          quote={item.quote}
          speaker={item.speaker}
          confidence={item.confidence}
          compact={compact}
        />
      ))}
      {remainingCount > 0 && (
        <Typography variant="caption" sx={{ color: 'text.secondary', pl: compact ? 3.5 : 0 }}>
          +{remainingCount} more evidence
        </Typography>
      )}
    </Box>
  );
}
