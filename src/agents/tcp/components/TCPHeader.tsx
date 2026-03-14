/**
 * TCPHeader Component (Production-style)
 *
 * Document header with clinic info and patient/document details.
 */

import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import BusinessIcon from '@mui/icons-material/Business';

interface DocumentInfo {
  document: string;
  patient: string;
  dob?: string;
  provider?: string;
  date: string;
}

interface ClinicInfo {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

interface TCPHeaderProps {
  clinic?: ClinicInfo;
  documentInfo: DocumentInfo;
}

interface InfoRowProps {
  icon: React.ReactNode;
  text?: string;
}

function InfoRow({ icon, text }: InfoRowProps) {
  if (!text) return null;
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        columnGap: 1,
        alignItems: 'center',
      }}
    >
      <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
      <Typography variant="body2" fontWeight={400} color="text.secondary" sx={{ wordBreak: 'break-word' }}>
        {text}
      </Typography>
    </Box>
  );
}

interface DocumentInfoRowProps {
  label: string;
  value: string;
}

function DocumentInfoRow({ label, value }: DocumentInfoRowProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '94px 1fr' },
        columnGap: 0.5,
        alignItems: 'flex-start',
      }}
    >
      <Typography variant="body2" color="text.primary" fontWeight={500} textTransform="uppercase">
        {label}:
      </Typography>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {value || '-'}
      </Typography>
    </Box>
  );
}

export function TCPHeader({ clinic, documentInfo }: TCPHeaderProps) {
  const hasClinic = clinic && (clinic.name || clinic.address || clinic.phone || clinic.email);
  const hasLogo = clinic?.logo;

  return (
    <Stack
      sx={{
        bgcolor: 'background.default',
        gap: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: hasLogo ? '150px 1fr 1fr' : hasClinic ? '1fr 1fr' : '1fr',
          },
          columnGap: { xs: 2, sm: 1 },
          rowGap: 1,
          px: 2,
          alignItems: 'start',
          '@media print': {
            gridTemplateColumns: hasLogo ? '150px 0.75fr 1fr' : hasClinic ? '1fr 1fr' : '1fr',
          },
        }}
      >
        {/* Logo */}
        {hasLogo && (
          <Box display="grid" alignSelf="center">
            <Box
              component="img"
              src={clinic.logo}
              alt="Practice Logo"
              sx={{
                width: 150,
                height: 'auto',
                maxHeight: 150,
                objectFit: 'contain',
              }}
            />
          </Box>
        )}

        {/* Clinic Info */}
        {hasClinic && (
          <Box display="grid" rowGap={1} alignSelf={hasLogo ? 'center' : 'start'}>
            <InfoRow icon={<BusinessIcon sx={{ fontSize: 16 }} />} text={clinic.name} />
            <InfoRow icon={<LocationOnIcon sx={{ fontSize: 16 }} />} text={clinic.address} />
            <InfoRow icon={<PhoneIcon sx={{ fontSize: 16 }} />} text={clinic.phone} />
            <InfoRow icon={<EmailIcon sx={{ fontSize: 16 }} />} text={clinic.email} />
            <InfoRow icon={<LanguageIcon sx={{ fontSize: 16 }} />} text={clinic.website} />
          </Box>
        )}

        {/* Document Info */}
        <Box display="grid" rowGap={1}>
          <DocumentInfoRow label="Document" value={documentInfo.document} />
          <DocumentInfoRow label="Patient" value={documentInfo.patient} />
          {documentInfo.dob && <DocumentInfoRow label="DOB" value={documentInfo.dob} />}
          {documentInfo.provider && <DocumentInfoRow label="Provider" value={documentInfo.provider} />}
          <DocumentInfoRow label="Date" value={documentInfo.date} />
        </Box>
      </Box>
    </Stack>
  );
}
