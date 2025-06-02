import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';

const Header: React.FC = () => {
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Personal Finance
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 