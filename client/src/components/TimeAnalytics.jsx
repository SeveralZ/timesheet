import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

ChartJS.register(BarElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const TimeAnalytics = () => {
  // Sample project data
  const projects = [
    {
      id: 1,
      name: "P01 Project 01",
      startDate: "19-Aug-2024",
      endDate: "31-Mar-2025",
      data: {
        November: {
          billable: Array(30).fill(9),
          nonBillable: Array(30).fill(1),
          attendance: Array.from({ length: 30 }, (_, i) => ({
            x: i + 1,
            y: Math.random() * 2 + 7,
          })),
        },
        December: {
          billable: Array(31).fill(8),
          nonBillable: Array(31).fill(2),
          attendance: Array.from({ length: 31 }, (_, i) => ({
            x: i + 1,
            y: Math.random() * 2 + 7,
          })),
        },
      },
    },
    {
      id: 2,
      name: "P02 Project 02",
      startDate: "01-Apr-2025",
      endDate: "31-Dec-2025",
      data: {
        November: {
          billable: Array(30).fill(7),
          nonBillable: Array(30).fill(2),
          attendance: Array.from({ length: 30 }, (_, i) => ({
            x: i + 1,
            y: Math.random() * 2 + 7,
          })),
        },
        December: {
          billable: Array(31).fill(6),
          nonBillable: Array(31).fill(3),
          attendance: Array.from({ length: 31 }, (_, i) => ({
            x: i + 1,
            y: Math.random() * 2 + 7,
          })),
        },
      },
    },
  ];

  const recentActions = [
    { type: "Timesheet", raised: 5, approved: 3, rejected: 2 },
    { type: "Leave", raised: 2, approved: 1, rejected: 1 },
    { type: "Reopen", raised: 1, approved: 1, rejected: 0 },
    { type: "Shift", raised: 0, approved: 0, rejected: 0 },
  ];

  const [selectedProjectId, setSelectedProjectId] = useState(projects[0].id);
  const [selectedMonth, setSelectedMonth] = useState("November");

  const months = ["November", "December"];
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const barChartData = {
    labels: Array.from(
      { length: selectedProject.data[selectedMonth].billable.length },
      (_, i) => i + 1
    ),
    datasets: [
      {
        label: "Billable Efforts",
        data: selectedProject.data[selectedMonth].billable,
        backgroundColor: "#1E88E5",
        stack: "Efforts",
      },
      {
        label: "Non-Billable Efforts",
        data: selectedProject.data[selectedMonth].nonBillable,
        backgroundColor: "#FFC107",
        stack: "Efforts",
      },
      {
        label: "Attendance",
        type: "scatter",
        data: selectedProject.data[selectedMonth].attendance,
        backgroundColor: "#FF9800",
        pointRadius: 5,
        pointHoverRadius: 7,
        stack: "Attendance",
      },
    ],
  };

  const barChartOptions = {
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const datasetLabel = tooltipItem.dataset.label || "";
            const value = tooltipItem.raw?.y ?? tooltipItem.raw;
            return `${datasetLabel}: ${value}`;
          },
        },
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: "Timesheet Hours",
        },
      },
    },
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>
        Time Analytics
      </Typography>
      <Grid container spacing={3}>
        {/* Bar Chart Section */}
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Time Booking Trend</Typography>
              <Box display="flex" alignItems="center">
                <IconButton
                  onClick={() => {
                    const currentIndex = months.indexOf(selectedMonth);
                    const prevIndex = (currentIndex - 1 + months.length) % months.length;
                    setSelectedMonth(months[prevIndex]);
                  }}
                >
                  <ArrowBackIosNewIcon />
                </IconButton>
                <Typography variant="h6" style={{ margin: "0 10px" }}>
                  {selectedMonth} - 2024
                </Typography>
                <IconButton
                  onClick={() => {
                    const currentIndex = months.indexOf(selectedMonth);
                    const nextIndex = (currentIndex + 1) % months.length;
                    setSelectedMonth(months[nextIndex]);
                  }}
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="subtitle1">
                Total Billable Efforts:{" "}
                <strong>
                  {selectedProject.data[selectedMonth].billable.reduce((a, b) => a + b, 0)}
                </strong>
              </Typography>
              <Typography variant="subtitle1">
                Total Non Billable Efforts:{" "}
                <strong>
                  {selectedProject.data[selectedMonth].nonBillable.reduce((a, b) => a + b, 0)}
                </strong>
              </Typography>
            </Box>
            <Bar data={barChartData} options={barChartOptions} />
          </Paper>
        </Grid>

        {/* Project Details and Recent Actions */}
        <Grid item xs={12} container spacing={3}>
          {/* Project Details */}
          <Grid item xs={6}>
            <Paper elevation={3} style={{ padding: "20px" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Project Details</Typography>
                <Select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  size="small"
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <Typography variant="body1">
                <strong>Project Name:</strong> {selectedProject.name}
              </Typography>
              <Typography variant="body1">
                <strong>Start Date:</strong> {selectedProject.startDate}
              </Typography>
              <Typography variant="body1">
                <strong>End Date:</strong> {selectedProject.endDate}
              </Typography>
            </Paper>
          </Grid>

          {/* Recent Actions */}
          <Grid item xs={6}>
            <Paper elevation={3} style={{ padding: "20px" }}>
              <Typography variant="h6">Recent Actions</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Request Type</TableCell>
                      <TableCell>Raised</TableCell>
                      <TableCell>Approved</TableCell>
                      <TableCell>Rejected</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActions.map((action, index) => (
                      <TableRow key={index}>
                        <TableCell>{action.type}</TableCell>
                        <TableCell>{action.raised}</TableCell>
                        <TableCell>{action.approved}</TableCell>
                        <TableCell>{action.rejected}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TimeAnalytics;
