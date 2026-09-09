import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { motion } from 'framer-motion';
import { useThemeMode } from '../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 1,
        }}
      >
        <motion.div
          key={mode}
          initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.25 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {mode === 'dark' ? (
            <LightModeRoundedIcon sx={{ color: '#E8B04B', fontSize: 20 }} />
          ) : (
            <DarkModeRoundedIcon sx={{ color: '#181A20', fontSize: 20 }} />
          )}
        </motion.div>
      </IconButton>
    </Tooltip>
  );
};
