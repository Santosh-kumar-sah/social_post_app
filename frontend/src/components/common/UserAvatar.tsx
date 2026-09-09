import React from 'react';
import { Avatar, AvatarProps } from '@mui/material';
import { getInitial, getDiceBearAvatar } from '../../utils/avatar';

export type UserAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | number;

export interface UserAvatarProps extends Omit<AvatarProps, 'size'> {
  username?: string;
  avatarUrl?: string;
  size?: UserAvatarSize;
}

const SIZE_MAP: Record<'xs' | 'sm' | 'md' | 'lg', { dim: number; fontSize: string }> = {
  xs: { dim: 24, fontSize: '0.7rem' },
  sm: { dim: 32, fontSize: '0.825rem' },
  md: { dim: 40, fontSize: '0.95rem' },
  lg: { dim: 64, fontSize: '1.4rem' },
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  avatarUrl,
  size = 'md',
  sx,
  alt,
  ...rest
}) => {
  const sizeConfig =
    typeof size === 'number'
      ? { dim: size, fontSize: `${Math.round(size * 0.45)}px` }
      : SIZE_MAP[size] || SIZE_MAP.md;

  const resolvedSrc = avatarUrl?.trim() || (username ? getDiceBearAvatar(username) : undefined);
  const initial = getInitial(username);

  return (
    <Avatar
      src={resolvedSrc}
      alt={alt || username || 'User'}
      sx={{
        width: sizeConfig.dim,
        height: sizeConfig.dim,
        fontSize: sizeConfig.fontSize,
        fontWeight: 700,
        bgcolor: 'primary.main',
        color: '#FFFFFF',
        fontFamily: '"Space Grotesk", "Sora", sans-serif',
        ...sx,
      }}
      {...rest}
    >
      {initial}
    </Avatar>
  );
};
