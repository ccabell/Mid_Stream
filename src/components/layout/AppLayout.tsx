import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Sidebar } from './Sidebar';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: 0,
          width: `calc(100% - ${collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)`,
          minHeight: '100vh',
          backgroundColor: 'background.default',
          transition: 'width 200ms ease-in-out',
        }}
      >
        <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
