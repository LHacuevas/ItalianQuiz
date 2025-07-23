import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

const MainLayout: React.FC = () => {
  return (
    <Box>
      <header>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Quiz di Italiano
        </Typography>
      </header>
      <main>
        <Outlet />
      </main>
    </Box>
  );
};

export default MainLayout;
