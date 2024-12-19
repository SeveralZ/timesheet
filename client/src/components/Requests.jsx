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
  Button,
  Checkbox,
  IconButton,
  TextField,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const RequestsPage = () => {
  const months = ["November-2024", "December-2024"];
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const approvers = ["Chirag Mehta", "Priya Sharma", "Ankit Gupta"];
  const reasons = [
    "Billing Effort Correction",
    "LOP Reversal",
    "Forgot to fill timesheet",
    "Applying Leave",
    "Incorrect Efforts",
    "Attendance regularization",
    "Others",
  ];

  const [selectedMonth, setSelectedMonth] = useState("December-2024");
  const [requests, setRequests] = useState([
    {
      id: 1,
      date: "01-Dec-2024",
      day: "SUN",
      booked: 0.0,
      pending: 0.0,
      approved: 0.0,
      rejected: 0.0,
      invoiced: "No",
      approver: "Chirag Mehta",
      reason: "",
      status: "Pending",
    },
  ]);

  const handleFieldChange = (id, field, value) => {
    const updatedRequests = requests.map((request) =>
      request.id === id ? { ...request, [field]: value } : request
    );
    setRequests(updatedRequests);
  };

  const handleMonthChange = (direction) => {
    const currentIndex = months.indexOf(selectedMonth);
    const newIndex =
      direction === "prev"
        ? (currentIndex - 1 + months.length) % months.length
        : (currentIndex + 1) % months.length;
    setSelectedMonth(months[newIndex]);
  };

  const handleAddRequest = () => {
    const newRequest = {
      id: requests.length + 1,
      date: "",
      day: "",
      booked: 0.0,
      pending: 0.0,
      approved: 0.0,
      rejected: 0.0,
      invoiced: "No",
      approver: "",
      reason: "",
      status: "Pending",
    };
    setRequests([...requests, newRequest]);
  };

  const handleSubmit = () => {
    console.log("Submitted Requests:", requests);
    alert("Requests submitted successfully!");
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>
        Timesheet Reopen
      </Typography>
      <Grid container spacing={3}>
        {/* Month Selector */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center">
              <IconButton onClick={() => handleMonthChange("prev")}>
                <ArrowBackIosNewIcon />
              </IconButton>
              <Typography variant="h6" style={{ margin: "0 10px" }}>
                {selectedMonth}
              </Typography>
              <IconButton onClick={() => handleMonthChange("next")}>
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mr: 2,
                  color: "#4CAF50",
                }}
              >
                <span
                  style={{
                    height: 10,
                    width: 10,
                    backgroundColor: "#4CAF50",
                    borderRadius: "50%",
                    display: "inline-block",
                    marginRight: 5,
                  }}
                ></span>
                Approved
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "#FFC107",
                }}
              >
                <span
                  style={{
                    height: 10,
                    width: 10,
                    backgroundColor: "#FFC107",
                    borderRadius: "50%",
                    display: "inline-block",
                    marginRight: 5,
                  }}
                ></span>
                Pending
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Request Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Day</TableCell>
                  <TableCell>Booked</TableCell>
                  <TableCell>Approval Pending Hrs</TableCell>
                  <TableCell>Approved Hrs</TableCell>
                  <TableCell>Rejected Hrs</TableCell>
                  <TableCell>Invoiced Status</TableCell>
                  <TableCell>Approver</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={request.date}
                        onChange={(e) =>
                          handleFieldChange(request.id, "date", e.target.value)
                        }
                        placeholder="DD-MMM-YYYY"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={request.day}
                        onChange={(e) =>
                          handleFieldChange(request.id, "day", e.target.value)
                        }
                        displayEmpty
                        fullWidth
                      >
                        <MenuItem value="">Select</MenuItem>
                        {daysOfWeek.map((day, idx) => (
                          <MenuItem key={idx} value={day}>
                            {day}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={request.booked}
                        onChange={(e) =>
                          handleFieldChange(request.id, "booked", e.target.value)
                        }
                        type="number"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{request.pending.toFixed(2)}</TableCell>
                    <TableCell>{request.approved.toFixed(2)}</TableCell>
                    <TableCell>{request.rejected.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={request.invoiced}
                        onChange={(e) =>
                          handleFieldChange(request.id, "invoiced", e.target.value)
                        }
                        displayEmpty
                        fullWidth
                      >
                        <MenuItem value="No">No</MenuItem>
                        <MenuItem value="Yes">Yes</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={request.approver}
                        onChange={(e) =>
                          handleFieldChange(request.id, "approver", e.target.value)
                        }
                        displayEmpty
                        fullWidth
                      >
                        <MenuItem value="">Select</MenuItem>
                        {approvers.map((approver, idx) => (
                          <MenuItem key={idx} value={approver}>
                            {approver}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={request.reason}
                        onChange={(e) =>
                          handleFieldChange(request.id, "reason", e.target.value)
                        }
                        displayEmpty
                        fullWidth
                      >
                        <MenuItem value="">Select</MenuItem>
                        {reasons.map((reason, idx) => (
                          <MenuItem key={idx} value={reason}>
                            {reason}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        style={{
                          color:
                            request.status === "Approved"
                              ? "#4CAF50"
                              : request.status === "Pending"
                              ? "#FFC107"
                              : "inherit",
                        }}
                      >
                        {request.status}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Buttons */}
        <Grid item xs={12} style={{ textAlign: "center" }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleAddRequest}
            style={{ marginRight: 20 }}
          >
            Add Request
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RequestsPage;
