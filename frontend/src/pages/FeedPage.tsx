import React, { useEffect, useState, useCallback } from 'react';
import { Container, Box, Typography, Alert, Snackbar } from '@mui/material';
import { ComposeBox } from '../components/feed/ComposeBox';
import { PostCard } from '../components/feed/PostCard';
import { CommentDrawer } from '../components/feed/CommentDrawer';
import { EmptyFeed } from '../components/feed/EmptyFeed';
import { FeedSkeleton } from '../components/skeleton/PostSkeleton';
import { fetchPostsApi, toggleLikeApi, addCommentApi } from '../api/posts';
import { Post, CommentItem } from '../types';
import { useAuth } from '../context/AuthContext';

export const FeedPage: React.FC = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'info' | 'error'>('success');

  // Comment Drawer State
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const data = await fetchPostsApi(25);
      setPosts(data.posts || []);
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      setErrorMessage('Could not load posts. Please check server connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const showToast = (message: string, severity: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    showToast('Pulse posted successfully to the community feed!');
  };

  // Instant Optimistic Like Toggle with Error Rollback
  const handleLikeToggle = async (postToLike: Post) => {
    if (!user) {
      showToast('Please sign in or create an account to like posts.', 'info');
      return;
    }

    const currentUserId = String(user._id);
    const currentUsername = (user.username || '').toLowerCase();

    const isMatch = (l: { userId?: any; username?: string }) => {
      const matchId = l.userId && String(l.userId) === currentUserId;
      const matchName = l.username && l.username.toLowerCase() === currentUsername;
      return Boolean(matchId || matchName);
    };

    const isCurrentlyLiked = Boolean(postToLike.likes?.some(isMatch));

    // Save snapshot for potential rollback
    const previousPosts = [...posts];

    // Optimistically update local posts state instantly
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p._id !== postToLike._id) return p;

        let updatedLikes = [...(p.likes || [])];
        if (isCurrentlyLiked) {
          updatedLikes = updatedLikes.filter((l) => !isMatch(l));
        } else {
          updatedLikes.push({ userId: user._id, username: user.username });
        }

        return { ...p, likes: updatedLikes };
      })
    );

    // Also update active comment drawer post if open
    if (activeCommentPost?._id === postToLike._id) {
      setActiveCommentPost((prev) => {
        if (!prev) return null;
        let updatedLikes = [...(prev.likes || [])];
        if (isCurrentlyLiked) {
          updatedLikes = updatedLikes.filter((l) => !isMatch(l));
        } else {
          updatedLikes.push({ userId: user._id, username: user.username });
        }
        return { ...prev, likes: updatedLikes };
      });
    }

    try {
      const result = await toggleLikeApi(postToLike._id);
      // Synchronize with server returned authoritative likes array
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === postToLike._id ? { ...p, likes: result.likes } : p))
      );
      if (activeCommentPost?._id === postToLike._id) {
        setActiveCommentPost((prev) => (prev ? { ...prev, likes: result.likes } : null));
      }
    } catch (err: any) {
      // Rollback on network failure
      setPosts(previousPosts);
      if (activeCommentPost?._id === postToLike._id) {
        setActiveCommentPost(postToLike);
      }
      showToast('Could not record like. Reverting optimistic update.', 'error');
    }
  };

  // Open Comment Drawer
  const handleOpenComments = (post: Post) => {
    setActiveCommentPost(post);
    setCommentDrawerOpen(true);
  };

  // Instant Optimistic Comment with Error Rollback
  const handleAddComment = async (postId: string, commentText: string) => {
    if (!user) {
      showToast('Please sign in to leave a comment.', 'info');
      return;
    }

    const optimisticComment: CommentItem = {
      _id: `temp-${Date.now()}`,
      userId: user._id,
      username: user.username,
      text: commentText,
      createdAt: new Date().toISOString(),
    };

    const previousPosts = [...posts];
    const previousActive = activeCommentPost;

    // Optimistically update post comments in feed state
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p._id !== postId) return p;
        return {
          ...p,
          comments: [...(p.comments || []), optimisticComment],
        };
      })
    );

    // Also optimistically update the open drawer post
    setActiveCommentPost((prev) => {
      if (!prev || prev._id !== postId) return prev;
      return {
        ...prev,
        comments: [...(prev.comments || []), optimisticComment],
      };
    });

    try {
      const res = await addCommentApi(postId, commentText);
      // Synchronize authoritative comments from server
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === postId ? { ...p, comments: res.comments } : p))
      );
      setActiveCommentPost((prev) => {
        if (!prev || prev._id !== postId) return prev;
        return { ...prev, comments: res.comments };
      });
      showToast('Comment published!');
    } catch (err: any) {
      // Rollback on error
      setPosts(previousPosts);
      setActiveCommentPost(previousActive);
      showToast('Failed to add comment. Please try again.', 'error');
      throw err;
    }
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

      {/* Guest Exploration Notice */}
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
          You are viewing the public feed. Sign in to share posts, like, and join the conversation!
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
        <EmptyFeed onStartFirstPost={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      ) : (
        <Box>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLikeToggle={handleLikeToggle}
              onOpenComments={handleOpenComments}
              onGuestAction={() => showToast('Sign in or register to like and comment.', 'info')}
            />
          ))}
        </Box>
      )}

      {/* Slide-up Comment Drawer */}
      <CommentDrawer
        open={commentDrawerOpen}
        onClose={() => setCommentDrawerOpen(false)}
        post={activeCommentPost}
        onAddComment={handleAddComment}
      />

      {/* Notification Toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity={toastSeverity}
          sx={{ width: '100%', borderRadius: 2.5 }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};
