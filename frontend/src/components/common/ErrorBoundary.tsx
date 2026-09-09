import { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Card, CardContent, Typography, Button, Box } from '@mui/material';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by Pulse ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ py: 10 }}>
          <Card
            sx={{
              textAlign: 'center',
              p: 4,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 92, 92, 0.1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                  mb: 2,
                }}
              >
                <WarningAmberRoundedIcon sx={{ fontSize: 32 }} />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, fontFamily: '"Space Grotesk", sans-serif' }}>
                Something unexpected happened
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                Pulse encountered a temporary issue while rendering this view.
              </Typography>

              <Button
                variant="contained"
                color="primary"
                startIcon={<ReplayRoundedIcon />}
                onClick={this.handleReload}
                sx={{ px: 3, py: 1, fontWeight: 600 }}
              >
                Reload Feed
              </Button>
            </CardContent>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}
