import React from 'react';
import { Container, Box, Typography, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ImplementationGantt from './components/ImplementationGantt';

// Create a theme with Open Sans font
const theme = createTheme({
  typography: {
    fontFamily: "'Open Sans', sans-serif",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Implementation Gantt Chart
          </Typography>
          <ImplementationGantt />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;