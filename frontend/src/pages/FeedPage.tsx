import React, { useEffect, useState, useCallback } from 'react';
import { Container, Box, Typography, Alert, Snackbar } from '@mui/material';
import { ComposeBox } from '../components/feed/ComposeBox';
import { PostCard } from '../components/feed/PostCard';
import { EmptyFeed } from '../components/feed/EmptyFeed';
import { FeedSkeleton } from '../components/skeleton/PostSkeleton';
import { fetchPostsApi } from '../api/posts';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';

export const FeedPage: React.FC = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const data = await fetchPostsApi(25);
      setPosts(data.posts || []);
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      setErrorMessage('Could not load posts. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    setToastMessage('Pulse posted successfully to the public feed!');
    setToastOpen(true);
  };

  const handleGuestInteractionNotice = () => {
    setToastMessage('Please sign in or create an account to like and comment on posts.');
    setToastOpen(true);
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, sm: 4 } }}>
      {/* Editorial Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            fontFamily: '"Space Grotesk", sans-serif',
          }}
        >
          Community Feed
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Live thoughts and visual stories from all Pulse creators
        </Typography>
      </Box>

      {/* Guest Notice */}
      {!user && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'action.hover',
          }}
        >
          You are exploring the public feed. Sign in anytime to share your own pulse, like, or comment!
        </Alert>
      )}

      {/* Sticky Composer */}
      {user && <ComposeBox onPostCreated={handlePostCreated} />}

      {/* Error Message */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {/* Feed List or Skeletons */}
      {loading ? (
        <FeedSkeleton count={3} />
      ) : posts.length === 0 ? (
        <EmptyFeed />
      ) : (
        <Box>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLikeClick={() => (!user ? handleGuestInteractionNotice() : undefined)}
              onCommentClick={() => (!user ? handleGuestInteractionNotice() : undefined)}
            />
          ))}
        </Box>
      )}

      {/* Toast Notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="success" sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};
