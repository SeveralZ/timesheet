import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // The theme file you created
import TopMenu from './components/TopMenu';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TimeTracker from './components/BookTimesheet';
import TimeAnalytics from './components/TimeAnalytics';
import Requests from './components/Requests';
import Reports from './components/Reports';
import ApproveHistory from './components/ApproveHistory';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <TopMenu />
        <Routes>
          {/* Add a default route for "/" */}
          <Route path="/" element={<TimeTracker />} />
          <Route path="/time-tracker" element={<TimeTracker />} />
          <Route path="/time-analytics" element={<TimeAnalytics />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/approve-history" element={<ApproveHistory />} />
          {/* Optional: Add a fallback route */}
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
