import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Button,
} from '@mui/material';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { motion, AnimatePresence } from 'framer-motion';
import { Post, LikeItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../utils/date';
import { UserAvatar } from '../common/UserAvatar';
import { LikersPopover } from './LikersPopover';

interface PostCardProps {
  post: Post;
  onLikeToggle: (post: Post) => Promise<void>;
  onOpenComments: (post: Post) => void;
  onGuestAction?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLikeToggle,
  onOpenComments,
  onGuestAction,
}) => {
  const { user } = useAuth();
  const countSpanRef = useRef<HTMLSpanElement | null>(null);

  // Likers popover anchor
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Robust check if current user liked this post (comparing both userId string and case-insensitive username)
  const isLikedByMe = Boolean(
    user &&
      post.likes?.some((like: LikeItem) => {
        const likeUserId = String(like.userId);
        const currentUserId = String(user._id);
        const likeUsername = (like.username || '').toLowerCase();
        const currentUsername = (user.username || '').toLowerCase();
        return likeUserId === currentUserId || likeUsername === currentUsername;
      })
  );

  const formattedTime = React.useMemo(() => {
    return formatRelativeTime(post.createdAt);
  }, [post.createdAt]);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Close any open popper immediately on click
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setPopoverAnchor(null);

    if (!user) {
      onGuestAction?.();
      return;
    }
    onLikeToggle(post);
  };

  const handleCountMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (post.likes && post.likes.length > 0) {
      const target = event.currentTarget;
      hoverTimeoutRef.current = setTimeout(() => {
        setPopoverAnchor(target);
      }, 250);
    }
  };

  const handleCountMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setPopoverAnchor(null);
  };

  return (
    <Card
      sx={{
        mb: 3,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? 'none'
              : '0 4px 16px rgba(0, 0, 0, 0.06)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        {/* Post Header: Author Avatar, Username, Timestamp */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <UserAvatar
            username={post.authorUsername}
            avatarUrl={post.authorAvatarUrl}
            size="md"
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                fontFamily: '"Space Grotesk", "Sora", sans-serif',
              }}
            >
              @{post.authorUsername}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                fontWeight: 500,
                display: 'block',
                mt: 0.2,
              }}
            >
              {formattedTime}
            </Typography>
          </Box>
        </Box>

        {/* Post Text Content */}
        {post.text && (
          <Typography
            variant="body1"
            sx={{
              mb: post.imageUrl ? 2 : 2.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 'text.primary',
              fontSize: '0.975rem',
              lineHeight: 1.6,
            }}
          >
            {post.text}
          </Typography>
        )}

        {/* Post Image Content */}
        {post.imageUrl && (
          <Box
            sx={{
              borderRadius: 2.5,
              overflow: 'hidden',
              mb: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              maxHeight: 480,
              bgcolor: 'background.default',
            }}
          >
            <Box
              component="img"
              src={post.imageUrl}
              alt="Post visual"
              loading="lazy"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 480,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Box>
        )}

        {/* Post Footer Action Row: Like & Comment with Hairline Divider */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            pt: 2,
            mt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Heart Burst Animated Like Button */}
          <Button
            size="small"
            onClick={handleLikeClick}
            startIcon={
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLikedByMe ? 'liked' : 'unliked'}
                  initial={{ scale: 0.9 }}
                  animate={
                    isLikedByMe
                      ? { scale: [1, 1.3, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  {isLikedByMe ? (
                    <FavoriteRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  ) : (
                    <FavoriteBorderRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  )}
                </motion.div>
              </AnimatePresence>
            }
            sx={{
              color: isLikedByMe ? 'primary.main' : 'text.secondary',
              fontWeight: 600,
              fontFamily: '"Space Grotesk", "Sora", sans-serif',
              px: 1.5,
              py: 0.6,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'primary.main',
              },
            }}
          >
            <Box
              component="span"
              ref={countSpanRef}
              onMouseEnter={handleCountMouseEnter}
              onMouseLeave={handleCountMouseLeave}
              sx={{ cursor: 'pointer' }}
            >
              {/* Animated count pop on increment/decrement */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={post.likes?.length || 0}
                  initial={{ scale: 0.85, opacity: 0.6 }}
                  animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  style={{ display: 'inline-block' }}
                >
                  {post.likes?.length || 0} {post.likes?.length === 1 ? 'Like' : 'Likes'}
                </motion.span>
              </AnimatePresence>
            </Box>
          </Button>

          {/* Comment Drawer Trigger Button */}
          <Button
            size="small"
            onClick={() => onOpenComments(post)}
            startIcon={<ChatBubbleOutlineRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              fontFamily: '"Space Grotesk", "Sora", sans-serif',
              px: 1.5,
              py: 0.6,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'text.primary',
              },
            }}
          >
            {post.comments?.length || 0} {post.comments?.length === 1 ? 'Comment' : 'Comments'}
          </Button>
        </Stack>

        {/* Hover Avatar Stack Popper (Non-blocking) */}
        <LikersPopover
          anchorEl={popoverAnchor}
          open={Boolean(popoverAnchor)}
          onClose={() => setPopoverAnchor(null)}
          likes={post.likes || []}
        />
      </CardContent>
    </Card>
  );
};
