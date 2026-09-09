import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { ComposeBox } from '../components/feed/ComposeBox';
import { PostCard } from '../components/feed/PostCard';
import { CommentDrawer } from '../components/feed/CommentDrawer';
import { EmptyFeed } from '../components/feed/EmptyFeed';
import { FeedSkeleton } from '../components/skeleton/PostSkeleton';
import { fetchPostsApi, toggleLikeApi, addCommentApi } from '../api/posts';
import { Post, CommentItem } from '../types';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 10;

export const FeedPage: React.FC = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'info' | 'error'>('success');

  // Comment Drawer State
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);

  // Sentinel ref for infinite scroll observer
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadInitialPosts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const data = await fetchPostsApi(PAGE_SIZE);
      setPosts(data.posts || []);
      setHasMore(Boolean(data.hasMore));
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      setErrorMessage('Could not load community feed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialPosts();
  }, [loadInitialPosts]);

  // Load next batch via cursor (?before=<createdAt>&limit=10)
  const loadMorePosts = useCallback(async () => {
    if (loading || loadingMore || !hasMore || posts.length === 0) return;

    try {
      setLoadingMore(true);
      const lastPost = posts[posts.length - 1];
      const data = await fetchPostsApi(PAGE_SIZE, lastPost.createdAt);

      if (data.posts && data.posts.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const uniqueNewPosts = data.posts.filter((p) => !existingIds.has(p._id));
          return [...prev, ...uniqueNewPosts];
        });
      }
      setHasMore(Boolean(data.hasMore));
    } catch (err) {
      console.error('Error fetching more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, posts]);

  // IntersectionObserver for cursor infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMorePosts();
        }
      },
      {
        root: null,
        rootMargin: '250px',
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingMore, loading, loadMorePosts]);

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

    // Save snapshot for rollback
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
    <Container maxWidth="sm" sx={{ py: { xs: 2.5, sm: 4 } }}>
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

          {/* Infinite Scroll Sentinel */}
          <Box ref={sentinelRef} sx={{ height: 20, my: 1 }} />

          {/* Loading More Indicator */}
          {loadingMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={28} color="primary" />
            </Box>
          )}

          {/* All Caught Up Milestone */}
          {!hasMore && posts.length > 2 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Divider sx={{ mb: 3, borderColor: 'divider' }} />
              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                <CheckCircleOutlineRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  You're all caught up on the latest pulses
                </Typography>
              </Stack>
            </Box>
          )}
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
