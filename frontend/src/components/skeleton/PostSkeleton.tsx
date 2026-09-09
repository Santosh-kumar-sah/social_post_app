import React from 'react';
import { Card, CardContent, Box, Skeleton, Stack } from '@mui/material';

export const PostSkeleton: React.FC = () => {
  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        {/* Header Skeleton: Avatar + Handle + Timestamp */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} animation="wave" />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="30%" height={22} animation="wave" sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width="18%" height={16} animation="wave" sx={{ borderRadius: 1, mt: 0.3 }} />
          </Box>
        </Box>

        {/* Content Lines */}
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width="100%" height={20} animation="wave" sx={{ borderRadius: 1 }} />
          <Skeleton variant="text" width="94%" height={20} animation="wave" sx={{ borderRadius: 1 }} />
          <Skeleton variant="text" width="65%" height={20} animation="wave" sx={{ borderRadius: 1 }} />
        </Box>

        {/* Optional Media Block Skeleton */}
        <Skeleton
          variant="rounded"
          width="100%"
          height={180}
          animation="wave"
          sx={{ borderRadius: 2.5, mb: 2 }}
        />

        {/* Action Row Skeleton with Hairline Divider */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            pt: 2,
            mt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Skeleton variant="rounded" width={80} height={32} animation="wave" sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" width={105} height={32} animation="wave" sx={{ borderRadius: 2 }} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export const FeedSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={`skeleton-${index}`} />
      ))}
    </Box>
  );
};
