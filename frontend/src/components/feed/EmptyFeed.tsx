import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useAuth } from '../../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

export const EmptyFeed: React.FC<{ onStartFirstPost?: () => void }> = ({ onStartFirstPost }) => {
  const { user } = useAuth();

  return (
    <Card sx={{ textAlign: 'center', py: 6, px: 3, my: 4 }}>
      <CardContent>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            mb: 2.5,
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 32 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, fontFamily: '"Space Grotesk", sans-serif' }}>
          No pulses on the radar yet
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mx: 'auto', mb: 3 }}>
          The feed is currently waiting for its first spark. Share a thought, milestone, or visual to start the pulse!
        </Typography>

        {user ? (
          <Button
            variant="contained"
            color="primary"
            onClick={onStartFirstPost}
            sx={{ px: 3, fontWeight: 600 }}
          >
            Create the First Pulse
          </Button>
        ) : (
          <Button
            component={RouterLink}
            to="/signup"
            variant="contained"
            color="primary"
            sx={{ px: 3, fontWeight: 600 }}
          >
            Join to Share the First Pulse
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
