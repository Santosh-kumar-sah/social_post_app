import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import { useAuth } from '../../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

export const EmptyFeed: React.FC<{ onStartFirstPost?: () => void }> = ({ onStartFirstPost }) => {
  const { user } = useAuth();

  return (
    <Card
      sx={{
        textAlign: 'center',
        py: 7,
        px: 3,
        my: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Simple friendly line-icon */}
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            mb: 2.5,
          }}
        >
          <PostAddRoundedIcon sx={{ fontSize: 30 }} />
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 1,
            fontFamily: '"Space Grotesk", "Sora", sans-serif',
            letterSpacing: '-0.01em',
          }}
        >
          No posts yet — be the first to post!
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 360, mx: 'auto', mb: 3.5, lineHeight: 1.6 }}
        >
          The feed is quiet right now. Share a thought, idea, or image to start the conversation!
        </Typography>

        {user ? (
          <Button
            variant="contained"
            color="primary"
            onClick={onStartFirstPost}
            sx={{ px: 3, py: 1, fontWeight: 600, borderRadius: 2 }}
          >
            Create the First Post
          </Button>
        ) : (
          <Button
            component={RouterLink}
            to="/signup"
            variant="contained"
            color="primary"
            sx={{ px: 3, py: 1, fontWeight: 600, borderRadius: 2 }}
          >
            Join to Share a Post
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
