import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Stack,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { createPostApi } from '../../api/posts';
import { Post } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface ComposeBoxProps {
  onPostCreated: (post: Post) => void;
}

const MAX_CHAR_LIMIT = 500;

export const ComposeBox: React.FC<ComposeBoxProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const trimmedLength = text.trim().length;
  // Disabled state strictly driven by actual input state
  const isPostDisabled = isSubmitting || (trimmedLength === 0 && !selectedFile);
  const charRemaining = MAX_CHAR_LIMIT - text.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 10MB.');
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPostDisabled) return;

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const formData = new FormData();
      if (text.trim()) {
        formData.append('text', text.trim());
      }
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const res = await createPostApi(formData);
      if (res.post) {
        onPostCreated(res.post);
        // Reset composer state
        setText('');
        setSelectedFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to publish post. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Card
      sx={{
        mb: 4,
        position: 'sticky',
        top: 80,
        zIndex: 10,
        bgcolor: 'background.paper',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.45)'
            : '0 8px 32px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(12px)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Image Thumbnail Preview with Remove Button (above input) */}
          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-block',
                    mb: 2,
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    maxWidth: 220,
                  }}
                >
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Upload thumbnail preview"
                    sx={{
                      maxHeight: 140,
                      width: 'auto',
                      maxWidth: '100%',
                      display: 'block',
                      objectFit: 'cover',
                      borderRadius: 2,
                    }}
                  />
                  <Tooltip title="Remove image">
                    <IconButton
                      size="small"
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        bgcolor: 'rgba(18, 20, 26, 0.75)',
                        color: 'white',
                        backdropFilter: 'blur(4px)',
                        p: 0.5,
                        '&:hover': {
                          bgcolor: 'rgba(255, 92, 92, 0.95)',
                        },
                      }}
                    >
                      <CloseRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Avatar + Input Area */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 1.5 }}>
            <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size={38} />

            <Box sx={{ flexGrow: 1 }}>
              <TextField
                placeholder="What's happening on your frequency? (Text or Image)"
                multiline
                minRows={2}
                maxRows={5}
                fullWidth
                variant="standard"
                value={text}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHAR_LIMIT) {
                    setText(e.target.value);
                  }
                }}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontSize: '0.975rem',
                    lineHeight: 1.5,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Action Row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pt: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
              ml: { xs: 0, sm: 6 },
            }}
          >
            {/* Hidden file input & Camera/Media button */}
            <Stack direction="row" spacing={1} alignItems="center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Tooltip title="Attach image">
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: '1px solid',
                    borderColor: selectedFile ? 'primary.main' : 'divider',
                    color: selectedFile ? 'primary.main' : 'text.secondary',
                    borderRadius: 2,
                    p: 0.8,
                  }}
                >
                  <ImageRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {selectedFile && (
                <Typography variant="caption" color="text.secondary">
                  {selectedFile.name.length > 20
                    ? selectedFile.name.substring(0, 17) + '...'
                    : selectedFile.name}
                </Typography>
              )}
            </Stack>

            {/* Character Counter & Submit Button */}
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Dynamic character counter: turns warning when < 20 */}
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Space Grotesk", "Sora", sans-serif',
                  fontWeight: 600,
                  color:
                    charRemaining <= 0
                      ? 'error.main'
                      : charRemaining < 20
                      ? 'warning.main'
                      : 'text.secondary',
                  transition: 'color 0.2s ease',
                }}
              >
                {charRemaining}
              </Typography>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="small"
                disabled={isPostDisabled}
                endIcon={
                  isSubmitting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SendRoundedIcon fontSize="small" />
                  )
                }
                sx={{
                  px: 2.2,
                  py: 0.8,
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                {isSubmitting ? 'Posting...' : 'Pulse Post'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
