import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Stack,
  Button,
} from '@mui/material';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Post, LikeItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
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

  // Likers popover anchor
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const isPopoverOpen = Boolean(popoverAnchor);

  // Check if current user liked this post
  const isLikedByMe = Boolean(
    user &&
      post.likes?.some(
        (like: LikeItem) =>
          like.userId === user._id || like.username.toLowerCase() === user.username.toLowerCase()
      )
  );

  const formattedTime = React.useMemo(() => {
    try {
      const date = new Date(post.createdAt);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'recently';
    }
  }, [post.createdAt]);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onGuestAction?.();
      return;
    }
    onLikeToggle(post);
  };

  const handleLikeCountMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (post.likes && post.likes.length > 0) {
      setPopoverAnchor(event.currentTarget);
    }
  };

  const handleLikeCountMouseLeave = () => {
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
              ? '0 8px 30px rgba(0, 0, 0, 0.45)'
              : '0 8px 30px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        {/* Post Header: Author Avatar, Username, Timestamp */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar
            src={post.authorAvatarUrl}
            alt={post.authorUsername}
            sx={{
              width: 42,
              height: 42,
              bgcolor: 'primary.main',
              fontWeight: 700,
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '1rem',
            }}
          >
            {post.authorUsername.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                fontFamily: '"Space Grotesk", sans-serif',
              }}
            >
              @{post.authorUsername}
            </Typography>
            <Typography variant="caption" color="text.secondary">
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
              borderRadius: 3,
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

        {/* Post Footer Action Row: Like & Comment */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            pt: 1.8,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Heart Burst Animated Like Button */}
          <Button
            size="small"
            onClick={handleLikeClick}
            onMouseEnter={handleLikeCountMouseEnter}
            onMouseLeave={handleLikeCountMouseLeave}
            startIcon={
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLikedByMe ? 'liked' : 'unliked'}
                  initial={{ scale: 0.8 }}
                  animate={
                    isLikedByMe
                      ? { scale: [1, 1.45, 0.9, 1], rotate: [0, -12, 12, 0] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.35, ease: 'easeOut' }}
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
              fontFamily: '"Space Grotesk", sans-serif',
              px: 1.5,
              py: 0.6,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'primary.main',
              },
            }}
          >
            {post.likes?.length || 0} {post.likes?.length === 1 ? 'Like' : 'Likes'}
          </Button>

          {/* Comment Drawer Trigger Button */}
          <Button
            size="small"
            onClick={() => onOpenComments(post)}
            startIcon={<ChatBubbleOutlineRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              fontFamily: '"Space Grotesk", sans-serif',
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

        {/* Hover Avatar Stack Popover */}
        <LikersPopover
          anchorEl={popoverAnchor}
          open={isPopoverOpen}
          onClose={handleLikeCountMouseLeave}
          likes={post.likes || []}
        />
      </CardContent>
    </Card>
  );
};
