import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { Post, CommentItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../utils/date';
import { UserAvatar } from '../common/UserAvatar';

interface CommentDrawerProps {
  open: boolean;
  onClose: () => void;
  post: Post | null;
  onAddComment: (postId: string, text: string) => Promise<void>;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  open,
  onClose,
  post,
  onAddComment,
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const comments = post?.comments || [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentText.trim() || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      const textToSubmit = commentText.trim();
      setCommentText('');
      await onAddComment(post._id, textToSubmit);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      anchor={isDesktop ? 'right' : 'bottom'}
      open={open}
      onClose={onClose}
      transitionDuration={{ enter: 320, exit: 240 }}
      sx={{
        zIndex: (th) => th.zIndex.modal + 10,
      }}
      PaperProps={{
        sx: {
          width: isDesktop ? 460 : '100%',
          maxWidth: isDesktop ? 480 : 680,
          height: isDesktop ? '100%' : { xs: '82vh', sm: '75vh' },
          mx: isDesktop ? 0 : 'auto',
          borderTopLeftRadius: isDesktop ? 0 : 20,
          borderTopRightRadius: isDesktop ? 0 : 20,
          borderBottomLeftRadius: isDesktop ? 20 : 0,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: (th) =>
            th.palette.mode === 'dark'
              ? '-8px 0 40px rgba(0, 0, 0, 0.6)'
              : '-8px 0 40px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Mobile Drawer Drag Handle Indicator */}
      {!isDesktop && (
        <Box
          sx={{
            width: 40,
            height: 4,
            borderRadius: 2,
            bgcolor: 'divider',
            mx: 'auto',
            mt: 1.5,
            mb: 0.5,
          }}
        />
      )}

      {/* Header bar */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <ChatBubbleOutlineRoundedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontFamily: '"Space Grotesk", "Sora", sans-serif' }}
          >
            Discussion ({comments.length})
          </Typography>
        </Box>

        <Tooltip title="Close discussion">
          <IconButton
            onClick={onClose}
            aria-label="Close comments"
            size="small"
            sx={{
              color: 'text.primary',
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 0.8,
              '&:hover': {
                bgcolor: 'primary.main',
                color: '#FFFFFF',
                borderColor: 'primary.main',
              },
              transition: 'all 0.15s ease-in-out',
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Post Snippet preview in drawer header */}
      {post && (
        <Box
          sx={{
            px: 3,
            py: 1.8,
            bgcolor: 'action.hover',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mb: 0.5,
              fontWeight: 600,
              fontFamily: '"Space Grotesk", "Sora", sans-serif',
            }}
          >
            Replying to @{post.authorUsername}'s pulse:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: 'text.primary',
            }}
          >
            {post.text || '(Visual pulse)'}
          </Typography>
        </Box>
      )}

      {/* Comments Scrollable List */}
      <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {comments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'action.hover',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                mb: 1.5,
              }}
            >
              <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, fontFamily: '"Space Grotesk", "Sora", sans-serif' }}>
              No comments yet
            </Typography>
            <Typography variant="body2">
              Start the discussion by sharing your thoughts below.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {comments.map((c: CommentItem, idx: number) => {
              const relativeDate = formatRelativeTime(c.createdAt);

              return (
                <Box key={c._id || `comment-${idx}`} sx={{ display: 'flex', gap: 1.5 }}>
                  <UserAvatar
                    username={c.username}
                    size="sm"
                  />
                  <Box
                    sx={{
                      flexGrow: 1,
                      p: 1.8,
                      borderRadius: 2.5,
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          fontFamily: '"Space Grotesk", "Sora", sans-serif',
                          lineHeight: 1,
                        }}
                      >
                        @{c.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        • {relativeDate}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'text.primary' }}
                    >
                      {c.text}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      <Divider sx={{ borderColor: 'divider' }} />

      {/* Comment Input Footer */}
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        {user ? (
          <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <UserAvatar
              username={user.username}
              avatarUrl={user.avatarUrl}
              size="sm"
            />

            <TextField
              size="small"
              fullWidth
              placeholder="Add your thought to this pulse..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={submitting}
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!commentText.trim() || submitting}
              sx={{ minWidth: 44, height: 40, borderRadius: 2.5, px: 2 }}
            >
              {submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SendRoundedIcon fontSize="small" />
              )}
            </Button>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Please log in to join the conversation.
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};
