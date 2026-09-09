import React from 'react';
import {
  Popper,
  Fade,
  Paper,
  Box,
  Typography,
  Stack,
  AvatarGroup,
  Divider,
  ClickAwayListener,
} from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { LikeItem } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface LikersPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  likes: LikeItem[];
}

export const LikersPopover: React.FC<LikersPopoverProps> = ({
  anchorEl,
  open,
  onClose,
  likes,
}) => {
  if (!open || !anchorEl || likes.length === 0) return null;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      transition
      style={{ zIndex: 1200, pointerEvents: 'none' }}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <Box sx={{ pointerEvents: 'auto', pt: 1 }}>
            <ClickAwayListener onClickAway={onClose}>
              <Paper
                elevation={6}
                sx={{
                  p: 2,
                  minWidth: 220,
                  maxWidth: 280,
                  borderRadius: 3,
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 12px 36px rgba(0, 0, 0, 0.7)'
                      : '0 12px 36px rgba(0, 0, 0, 0.12)',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <FavoriteRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      fontFamily: '"Space Grotesk", sans-serif',
                    }}
                  >
                    Liked by {likes.length} {likes.length === 1 ? 'person' : 'people'}
                  </Typography>
                </Box>

                <AvatarGroup
                  max={5}
                  sx={{
                    justifyContent: 'flex-start',
                    mb: 1.5,
                    '& .MuiAvatar-root': {
                      width: 30,
                      height: 30,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      borderColor: 'background.paper',
                      fontFamily: '"Space Grotesk", sans-serif',
                    },
                  }}
                >
                  {likes.map((like, index) => (
                    <UserAvatar
                      key={`avatar-${like.userId || index}`}
                      username={like.username}
                      size="sm"
                    />
                  ))}
                </AvatarGroup>

                <Divider sx={{ my: 1, borderColor: 'divider' }} />

                <Stack spacing={1} sx={{ maxHeight: 150, overflowY: 'auto' }}>
                  {likes.map((like, index) => (
                    <Box
                      key={`name-${like.userId || index}`}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <UserAvatar
                        username={like.username}
                        size="xs"
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          fontFamily: '"Space Grotesk", sans-serif',
                          color: 'text.primary',
                        }}
                      >
                        @{like.username}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </ClickAwayListener>
          </Box>
        </Fade>
      )}
    </Popper>
  );
};
