import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Container,
  Paper,
  Avatar,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { ThemeToggle } from './ThemeToggle';
import { useThemeMode } from '../../context/ThemeContext';

export const ThemePreview: React.FC = () => {
  const { mode } = useThemeMode();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 6,
          pb: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.2rem',
              boxShadow: '0 0 16px rgba(255, 92, 92, 0.4)',
            }}
          >
            P
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Pulse
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mini Social Platform • Design System Preview
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            label={mode.toUpperCase() + ' MODE'}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: 'action.hover',
              color: 'text.secondary',
              fontFamily: '"Space Grotesk", sans-serif',
            }}
          />
          <ThemeToggle />
        </Stack>
      </Box>

      {/* Palette Tokens */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Brand Colors & Palette
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 5,
        }}
      >
        <Paper
          sx={{
            p: 2.5,
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
            Primary Accent
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Electric Coral
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            #FF5C5C
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2.5,
            bgcolor: 'secondary.main',
            color: '#12141A',
            borderRadius: 3,
          }}
        >
          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
            Secondary Accent
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Muted Amber
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            #E8B04B
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2.5,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Surface Paper
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {mode === 'dark' ? '#1A1D24' : '#FFFFFF'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Card Container
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2.5,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Canvas Background
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {mode === 'dark' ? '#12141A' : '#FAF8F5'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            App Root Body
          </Typography>
        </Paper>
      </Box>

      {/* Typography Preview */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Editorial Typography (Space Grotesk + Inter)
      </Typography>
      <Paper
        sx={{
          p: 3.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          mb: 5,
        }}
      >
        <Typography variant="h4" sx={{ mb: 1, color: 'text.primary' }}>
          Every thought has a frequency.
        </Typography>
        <Typography variant="subtitle1" color="primary.main" sx={{ mb: 2 }}>
          @pulse_explorer • 2m ago
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
          Clean editorial layout crafted specifically for seamless reads, instant micro-interactions,
          and zero visual noise. Typography blends expressive Space Grotesk headings with highly legible Inter body copy.
        </Typography>
      </Paper>

      {/* Post Card Specimen */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Post Card Specimen (Hairline Divider + Soft Elevation)
      </Typography>
      <Card sx={{ mb: 5 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 700,
                width: 44,
                height: 44,
                fontFamily: '"Space Grotesk", sans-serif',
              }}
            >
              AL
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ lineHeight: 1.2 }}>
                alex_chen
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Just now • Shared with Public Feed
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Designing something new for the social web. Micro-interactions should feel immediate, 
            like a tactile heartbeat. Notice how the card uses soft elevation and a 1px border instead of heavy shadows!
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Button
              size="small"
              startIcon={<FavoriteIcon sx={{ color: 'primary.main' }} />}
              sx={{ color: 'text.primary', fontWeight: 600 }}
            >
              24 Likes
            </Button>
            <Button
              size="small"
              startIcon={<ChatBubbleOutlineIcon />}
              sx={{ color: 'text.secondary', fontWeight: 600 }}
            >
              8 Comments
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Buttons and Interactive Elements */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Button Controls & Actions
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1.5 }}>
        <Button variant="contained" color="primary">
          Publish Pulse
        </Button>
        <Button variant="outlined" color="inherit" sx={{ borderColor: 'divider' }}>
          Cancel
        </Button>
        <Button variant="contained" color="secondary">
          Amber Highlight
        </Button>
      </Stack>
    </Container>
  );
};
