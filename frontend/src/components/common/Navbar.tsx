import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  Stack,
  Container,
  IconButton,
  Tooltip,
} from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        backdropFilter: 'blur(10px)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 68 }}>
          {/* Logo & Brand */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.25rem',
                fontFamily: '"Space Grotesk", sans-serif',
                boxShadow: '0 0 16px rgba(255, 92, 92, 0.45)',
              }}
            >
              P
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  fontFamily: '"Space Grotesk", sans-serif',
                  lineHeight: 1,
                }}
              >
                Pulse
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontSize: '0.65rem',
                }}
              >
                Social
              </Typography>
            </Box>
          </Box>

          {/* Right Controls */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ThemeToggle />

            {user ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    px: 1.5,
                    py: 0.6,
                    borderRadius: 3,
                    bgcolor: 'action.hover',
                  }}
                >
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.username}
                    sx={{
                      width: 30,
                      height: 30,
                      bgcolor: 'primary.main',
                      fontSize: '0.85rem',
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontWeight: 700,
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      fontFamily: '"Space Grotesk", sans-serif',
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    @{user.username}
                  </Typography>
                </Box>

                <Tooltip title="Log Out">
                  <IconButton
                    onClick={handleLogout}
                    size="small"
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 0.9,
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <LogoutRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: 'divider',
                    color: 'text.primary',
                  }}
                >
                  Log In
                </Button>
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  Join Pulse
                </Button>
              </Stack>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
