import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { ThemeModeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { FeedPage } from './pages/FeedPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ThemePreview } from './components/common/ThemePreview';

export const App: React.FC = () => {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Box
            sx={{
              minHeight: '100vh',
              bgcolor: 'background.default',
              color: 'text.primary',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<FeedPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/theme-preview" element={<ThemePreview />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </ThemeModeProvider>
  );
};

export default App;
