import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Avatar,
  Stack,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { formatDistanceToNow } from 'date-fns';
import { Post, CommentItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

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
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          maxHeight: '85vh',
          height: { xs: '80vh', sm: '70vh' },
          maxWidth: 680,
          mx: 'auto',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
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
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Space Grotesk", sans-serif' }}>
            Discussion ({comments.length})
          </Typography>
        </Box>

        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      {/* Post Snippet preview in drawer header */}
      {post && (
        <Box sx={{ px: 3, py: 1.5, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
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
            }}
          >
            {post.text || '(Image post)'}
          </Typography>
        </Box>
      )}

      {/* Comments List */}
      <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {comments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              No comments yet
            </Typography>
            <Typography variant="body2">
              Start the conversation by leaving the first thought below.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {comments.map((c: CommentItem, idx: number) => {
              let relativeDate = 'just now';
              try {
                if (c.createdAt) {
                  relativeDate = formatDistanceToNow(new Date(c.createdAt), { addSuffix: true });
                }
              } catch {
                relativeDate = 'recently';
              }

              return (
                <Box key={c._id || `comment-${idx}`} sx={{ display: 'flex', gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: 'primary.main',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      fontFamily: '"Space Grotesk", sans-serif',
                    }}
                  >
                    {c.username ? c.username.charAt(0).toUpperCase() : '?'}
                  </Avatar>
                  <Box
                    sx={{
                      flexGrow: 1,
                      p: 1.8,
                      borderRadius: 3,
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
                          fontFamily: '"Space Grotesk", sans-serif',
                          lineHeight: 1,
                        }}
                      >
                        @{c.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
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

      <Divider />

      {/* Comment Input Footer */}
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        {user ? (
          <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Avatar
              src={user.avatarUrl}
              alt={user.username}
              sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontWeight: 700 }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>

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
                  borderRadius: 3,
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
