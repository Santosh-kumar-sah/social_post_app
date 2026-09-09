import React from 'react';
import { Card, CardContent, Box, Skeleton, Stack } from '@mui/material';

export const PostSkeleton: React.FC = () => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        {/* Header Skeleton */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Skeleton variant="circular" width={42} height={42} animation="wave" />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="28%" height={24} animation="wave" />
            <Skeleton variant="text" width="16%" height={16} animation="wave" />
          </Box>
        </Box>

        {/* Content Lines */}
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width="100%" height={20} animation="wave" />
          <Skeleton variant="text" width="92%" height={20} animation="wave" />
          <Skeleton variant="text" width="60%" height={20} animation="wave" />
        </Box>

        {/* Image Placeholder */}
        <Skeleton
          variant="rounded"
          width="100%"
          height={200}
          animation="wave"
          sx={{ borderRadius: 3, mb: 2.5 }}
        />

        {/* Footer Actions */}
        <Stack
          direction="row"
          spacing={3}
          sx={{
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" width={100} height={32} sx={{ borderRadius: 2 }} />
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
