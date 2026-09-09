import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Link,
  Snackbar,
  Stack,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDiceBearAvatar } from '../utils/avatar';
import { UserAvatar } from '../components/common/UserAvatar';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, user } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // If already logged in, redirect to feed
  React.useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Preview avatar live
  const previewAvatar = useMemo(() => {
    if (avatarUrl.trim()) return avatarUrl.trim();
    return getDiceBearAvatar(username || 'pulse');
  }, [username, avatarUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedEmail || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      setSnackbarOpen(true);
      return;
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      setErrorMessage('Username must be between 3 and 30 characters.');
      setSnackbarOpen(true);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setErrorMessage('Username can only contain letters, numbers, and underscores.');
      setSnackbarOpen(true);
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      setSnackbarOpen(true);
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      setSnackbarOpen(true);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setSnackbarOpen(true);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      await signup({
        username: trimmedUsername,
        email: trimmedEmail,
        password,
        avatarUrl: avatarUrl.trim() || previewAvatar,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Failed to create account. Please try again with a different email or username.';
      setErrorMessage(msg);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
          <UserAvatar
            username={username || 'New User'}
            avatarUrl={previewAvatar}
            size="lg"
            sx={{
              boxShadow: '0 4px 20px rgba(255, 92, 92, 0.35)',
              border: '2px solid',
              borderColor: 'primary.main',
            }}
          />
        </Stack>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Join Pulse to share thoughts, images, and conversations
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="dense"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. sora_pulse"
              helperText="Letters, numbers, underscores only (3-30 chars)"
              sx={{ mb: 1.5 }}
            />

            <TextField
              margin="dense"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              sx={{ mb: 1.5 }}
            />

            <TextField
              margin="dense"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="At least 6 characters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1.5 }}
            />

            <TextField
              margin="dense"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 1.5 }}
            />

            <TextField
              margin="dense"
              fullWidth
              name="avatarUrl"
              label="Custom Avatar URL (Optional)"
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://... (defaults to auto-generated avatar)"
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddRoundedIcon />}
              sx={{ py: 1.4, mb: 2.5 }}
            >
              {loading ? 'Creating Account...' : 'Get Started'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};
