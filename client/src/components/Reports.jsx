import React from "react";
import { Box, Typography, Button } from "@mui/material";

const Reports = () => {
  const generateReport = () => {
    console.log("Generating report...");
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Typography variant="body1">
        Add functionality to generate and view reports here soon.
      </Typography>
      <Button variant="contained" onClick={generateReport} style={{ marginTop: "20px" }}>
        Generate Report
      </Button>
    </Box>
  );
};

export default Reports;
