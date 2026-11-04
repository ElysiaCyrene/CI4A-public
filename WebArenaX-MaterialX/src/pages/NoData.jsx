import { Box, Typography } from '@mui/material';
// Simple inline icon since we don't need the full icon import for a placeholder
function EmptyIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="48" height="40" rx="2" stroke="#d9d9d9" strokeWidth="2" fill="none"/>
      <path d="M8 20h48" stroke="#d9d9d9" strokeWidth="2"/>
      <line x1="20" y1="8" x2="20" y2="20" stroke="#d9d9d9" strokeWidth="2"/>
      <line x1="44" y1="8" x2="44" y2="20" stroke="#d9d9d9" strokeWidth="2"/>
    </svg>
  );
}

export default function NoData() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        pt: 12,
      }}
    >
      <Box sx={{ color: '#d9d9d9', mb: 2 }}>
        <EmptyIcon />
      </Box>
      <Typography sx={{ color: '#999', fontSize: 14 }}>No Data</Typography>
    </Box>
  );
}
