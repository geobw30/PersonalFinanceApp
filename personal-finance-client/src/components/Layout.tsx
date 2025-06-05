import { useState } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
  Container,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance as BudgetIcon,
  Receipt as ExpenseIcon,
  LightMode as LightIcon,
  DarkMode as DarkIcon,
  Savings as FinanceIcon,
  Settings as SettingsIcon,
  Report as ReportsIcon
} from '@mui/icons-material';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../contexts/ThemeContext';

const navigationItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Expenses', icon: <ExpenseIcon />, path: '/expenses' },
  { label: 'Budgets', icon: <BudgetIcon />, path: '/budgets' },
  { label: 'Finance', icon: <FinanceIcon />, path: '/finance' },
  { label: 'Report', icon: <ReportsIcon />, path: '/reports' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings' }
];

const getContainerWidth = (pathname: string) => {
  if (pathname === '/expenses') {
    return false; // full width
  }
  if (pathname === '/categories') {
    return 'md'; // medium width (half screen)
  }
  return 'lg'; // default width
};

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const muiTheme = useMuiTheme();
  const { mode, toggleColorMode } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <List>
      {navigationItems.map((item) => (
        <ListItem key={item.path} disablePadding>
          <ListItemButton
            component={RouterLink}
            to={item.path}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {!isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Personal Finance
          </Typography>
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton color="inherit" onClick={toggleColorMode} edge="end">
              {mode === 'light' ? <DarkIcon /> : <LightIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Side drawer for desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              top: ['48px', '56px', '64px'],
              height: 'auto',
              bottom: 0,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: ['48px', '56px', '64px'],
          mb: isMobile ? '56px' : 0,
          ...(isMobile ? {} : { ml: '240px' }),
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: location.pathname === '/expenses' ? '100%' : 'auto',
          p: location.pathname === '/expenses' ? 0 : 2,
        }}
      >
        {location.pathname === '/expenses' ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <Outlet />
          </Box>
        ) : (
          <Container 
            maxWidth={getContainerWidth(location.pathname)} 
            sx={{ 
              height: '100%',
              px: 2
            }}
          >
            <Outlet />
          </Container>
        )}
      </Box>

      {/* Bottom navigation for mobile */}
      {isMobile && (
        <Paper 
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: muiTheme.zIndex.appBar }} 
          elevation={3}
        >
          <BottomNavigation
            value={location.pathname}
            onChange={(_, newValue) => {
              navigate(newValue);
            }}
            showLabels
          >
            {navigationItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.icon}
                value={item.path}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
} 