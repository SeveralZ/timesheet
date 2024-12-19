import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  isSameWeek,
  isAfter,
  isWithinInterval,
  startOfDay,
  endOfDay,
  addDays,
} from "date-fns";
import AddIcon from "@mui/icons-material/Add";
import axios from 'axios';

// Chart config
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const weekStartsOn = 0; 
const today = new Date();
const initialTimesheets = {};

const BookTimesheet = () => {
  // date states
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeStartDate, setActiveStartDate] = useState(today);
  
  // main data
  const [rows, setRows] = useState([]);
  const [nonProjectTasks, setNonProjectTasks] = useState([]);
  const [timesheets, setTimesheets] = useState(initialTimesheets);

  // ui states
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const currentWeekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn }), [selectedDate]);
  const currentWeekEnd = endOfWeek(selectedDate, { weekStartsOn });
  const weekStartStr = format(currentWeekStart, "yyyy-MM-dd");
  const weekEndStr = format(currentWeekEnd, "yyyy-MM-dd");

  useEffect(() => {
    // Fetching data from backend
    async function fetchData() {
      try {
        const response = await axios.get("/api/timesheet-data", {
          params: { weekStart: weekStartStr, weekEnd: weekEndStr },
          headers: { 'Cache-Control': 'no-cache' }
        });
        const { rows: fetchedRows, nonProjectTasks: fetchedNonProjectTasks } = response.data;
        setRows(fetchedRows || []);
        setNonProjectTasks(fetchedNonProjectTasks || []);
        const weekKey = format(currentWeekStart, "yyyy-MM-dd");
        setTimesheets(prev => ({ ...prev, [weekKey]: fetchedRows }));
      } catch (error) {
        setErrorMsg("Failed to fetsh data, pls try again.");
        setErrorOpen(true);
      }
    }
    fetchData();
  }, [selectedDate, weekStartStr, weekEndStr, currentWeekStart]);

  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  const updateChartData = useCallback(() => {
    const billableData = Array(7).fill(0);
    const nonBillableData = Array(7).fill(0);

    rows.forEach((row) => {
      row.hours.forEach((value, index) => {
        const hours = parseFloat(value) || 0;
        if (row.project === "Non-Project") {
          nonBillableData[index] += hours;
        } else {
          billableData[index] += hours;
        }
      });
    });

    const currentWeekDays = Array.from({ length: 7 }, (_, i) =>
      format(addDays(currentWeekStart, i), "EEE, dd")
    );

    setChartData({
      labels: currentWeekDays,
      datasets: [
        { label: "Billable Efforts", data: billableData, backgroundColor: "#1E88E5", stack: "Efforts" },
        { label: "Non-Billable Efforts", data: nonBillableData, backgroundColor: "#FFC107", stack: "Efforts" },
      ],
    });
  }, [rows, currentWeekStart]);

  useEffect(() => {
    updateChartData();
  }, [updateChartData]);

  const handleDateChange = (date) => {
    if (!isSameWeek(date, selectedDate, { weekStartsOn })) {
      setSelectedDate(date);
    }
  };

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    setActiveStartDate(activeStartDate);
  };

  const updateTask = (rowIndex, field, value) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex][field] = value;
    setRows(updatedRows);
  };

  const updateHours = (rowIndex, dayIndex, value) => {
    const updatedRows = [...rows];
    const row = updatedRows[rowIndex];
    const newHours = parseFloat(value) || 0;
    const totalOtherHours = row.hours.reduce((sum, h, i) => sum + (i !== dayIndex ? (parseFloat(h) || 0) : 0), 0);
    const newTotal = totalOtherHours + newHours;

    if (row.allocatedHours !== null && newTotal > row.allocatedHours) {
      setErrorMsg(`Total hrs exceed alloocated hrs (${row.allocatedHours} hrs) for "${row.task}".`);
      setErrorOpen(true);
      return;
    }

    row.hours[dayIndex] = value;
    setRows(updatedRows);
  };

  const addNonProjectTask = () => {
    const taskName = prompt("Enter new non-billable task name:");
    if (taskName && !nonProjectTasks.includes(taskName)) {
      setNonProjectTasks([...nonProjectTasks, taskName]);
      setRows([
        ...rows,
        {
          project: "Non-Project",
          task: taskName,
          task_id: null,
          allocatedHours: null,
          startDate: null,
          endDate: null,
          hours: ["", "", "", "", "", "", ""],
          isEditable: true,
        },
      ]);
    } else if (taskName) {
      setErrorMsg(`Task "${taskName}" already exst.`);
      setErrorOpen(true);
    }
  };

  const calculateTotalHoursForWeek = (weekStartDate) => {
    const weekKey = format(weekStartDate, "yyyy-MM-dd");
    const timesheet = timesheets[weekKey] || [];
    return timesheet.reduce((sum, row) =>
      sum + row.hours.reduce((daySum, hour) => daySum + (parseFloat(hour) || 0), 0)
    , 0);
  };

  const saveTimesheet = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/save-timesheet", {
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        rows
      }, {
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (response.data && response.data.rows) {
        setRows(response.data.rows);
        setNonProjectTasks(response.data.nonProjectTasks || []);
        const weekKey = format(currentWeekStart, "yyyy-MM-dd");
        setTimesheets(prev => ({ ...prev, [weekKey]: response.data.rows }));
      }

      setSuccessOpen(true);
    } catch (err) {
      setErrorMsg("Err saving timesheet.");
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const submitTimesheet = async () => {
    await saveTimesheet();
  };

  const totalHoursThisWeek = rows.reduce(
    (sum, row) => sum + row.hours.reduce((daySum, hour) => daySum + (parseFloat(hour) || 0), 0),
    0
  );

  const weeksInView = useMemo(() => {
    const weeks = [];
    const start = startOfWeek(startOfMonth(activeStartDate), { weekStartsOn });
    const end = endOfWeek(endOfMonth(activeStartDate), { weekStartsOn });

    let current = start;
    while (current <= end) {
      weeks.push(new Date(current));
      current = addDays(current, 7);
    }
    return weeks;
  }, [activeStartDate]);

  const handleSuccessClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSuccessOpen(false);
  };

  const handleErrorClose = (event, reason) => {
    if (reason === "clickaway") return;
    setErrorOpen(false);
  };

  return (
    <Box p={3}>
      <style>
        {`.selected-week-tile {
          background-color: #d7ebf9 !important;
          border-radius: 50%;
          color: #003366;
          font-weight: bold;
        }
        .my-calendar {
          padding: 0;
          margin: 0;
        }
        .react-calendar__month-view__weekdays {
          height: 40px;
        }
        .react-calendar__month-view__weekdays__weekday {
          height: 40px;
        }
        .react-calendar__month-view__days__day {
          height: 40px;
        }`}
      </style>

      <Typography variant="h5" mb={2}>
        Book Timesheet
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} style={{ marginBottom: "20px" }}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Select Week
              </Typography>
              <div style={{ display: "table", width: "100%", borderSpacing: 0, borderCollapse: "collapse" }}>
                <div style={{ display: "table-row" }}>
                  <div style={{ display: "table-cell", verticalAlign: "top", padding: 0 }}>
                    <Calendar
                      onChange={handleDateChange}
                      value={selectedDate}
                      tileDisabled={({ date }) => isAfter(startOfWeek(date, { weekStartsOn }), new Date())}
                      onActiveStartDateChange={handleActiveStartDateChange}
                      locale="en-US"
                      tileClassName={({ date, view }) => {
                        if (view === "month") {
                          if (isSameWeek(date, selectedDate, { weekStartsOn })) {
                            return "selected-week-tile";
                          }
                        }
                        return null;
                      }}
                      className="my-calendar"
                    />
                  </div>
                  <div style={{ display: "table-cell", verticalAlign: "top", width: "60px", paddingLeft: "5px" }}>
                    <div style={{ display: "table", width: "100%", borderSpacing: 0, borderCollapse: "collapse" }}>
                      <div style={{ display: "table-row", height: "40px" }}>
                        <div style={{ display: "table-cell", padding: 0 }}></div>
                      </div>
                      <div style={{ display: "table-row", height: "40px" }}>
                        <div style={{ display: "table-cell", padding: 0 }}></div>
                      </div>

                      {weeksInView.map((weekStartDate, index) => {
                        const totalHours = calculateTotalHoursForWeek(weekStartDate);
                        const isSelectedWeek = isSameWeek(weekStartDate, selectedDate, { weekStartsOn });
                        return (
                          <div key={index} style={{ display: "table-row", height: "40px" }}>
                            <div style={{ display: "table-cell", textAlign: "center", verticalAlign: "middle", padding: 0 }}>
                              <Typography
                                variant="body2"
                                style={{
                                  color: isSelectedWeek ? "#1565c0" : "#001433",
                                  fontWeight: isSelectedWeek ? "bold" : "normal",
                                }}
                              >
                                {totalHours} hrs
                              </Typography>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Box>
          </Paper>

          <Paper elevation={2}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Timesheet Hours
              </Typography>
              <Bar
                data={chartData}
                options={{
                  plugins: { legend: { display: true } },
                  responsive: true,
                  scales: {
                    x: { stacked: true },
                    y: { stacked: true },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Total Hours This Week: {totalHoursThisWeek} hrs
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell>Task</TableCell>
                  <TableCell>Allocated Hours</TableCell>
                  <TableCell>Allocated Dates</TableCell>
                  {chartData.labels && chartData.labels.map((day) => (
                    <TableCell key={day}>{day}</TableCell>
                  ))}
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, rowIndex) => {
                  const totalBookedHours = row.hours.reduce((total, h) => total + (parseFloat(h) || 0), 0);
                  const exceedsAllocated = row.allocatedHours !== null && totalBookedHours > row.allocatedHours;

                  const startDateObj = row.startDate ? new Date(row.startDate) : null;
                  const endDateObj = row.endDate ? new Date(row.endDate) : null;

                  return (
                    <TableRow key={rowIndex}>
                      <TableCell><Typography>{row.project}</Typography></TableCell>
                      <TableCell>
                        {row.isEditable && row.project === "Non-Project" ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Select
                              value={row.task}
                              onChange={(e) => updateTask(rowIndex, "task", e.target.value)}
                              fullWidth
                            >
                              <MenuItem value="">Select Task</MenuItem>
                              {nonProjectTasks.map((task, idx) => (
                                <MenuItem key={idx} value={task}>
                                  {task}
                                </MenuItem>
                              ))}
                            </Select>
                            <Button variant="outlined" startIcon={<AddIcon />} onClick={addNonProjectTask}>
                              Add
                            </Button>
                          </Box>
                        ) : row.isEditable ? (
                          <Select
                            value={row.task}
                            onChange={(e) => updateTask(rowIndex, "task", e.target.value)}
                            fullWidth
                          >
                            <MenuItem value="">Select Task</MenuItem>
                            {nonProjectTasks.map((task, idx) => (
                              <MenuItem key={idx} value={task}>
                                {task}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : (
                          <Typography>{row.task}</Typography>
                        )}
                      </TableCell>
                      <TableCell>{row.allocatedHours !== null ? row.allocatedHours : "-"}</TableCell>
                      <TableCell>
                        {startDateObj && endDateObj
                          ? `${format(startDateObj, "MMM dd")} - ${format(endDateObj, "MMM dd")}`
                          : "-"}
                      </TableCell>
                      {row.hours.map((hour, dayIndex) => {
                        const currentDate = addDays(currentWeekStart, dayIndex);
                        const isWithinDateRange = (startDateObj && endDateObj)
                          ? isWithinInterval(currentDate, {
                              start: startOfDay(startDateObj),
                              end: endOfDay(endDateObj),
                            })
                          : true;

                        return (
                          <TableCell key={dayIndex}>
                            <TextField
                              value={hour}
                              onChange={(e) => updateHours(rowIndex, dayIndex, e.target.value)}
                              type="number"
                              size="small"
                              inputProps={{ min: 0, step: 0.5, style: { appearance: "textfield" } }}
                              sx={{
                                "& input[type=number]::-webkit-inner-spin-button": { display: "none" },
                                "& input[type=number]::-webkit-outer-spin-button": { display: "none" },
                                "& input[type=number]": { MozAppearance: "textfield" },
                              }}
                              disabled={!isWithinDateRange && row.allocatedHours !== null}
                            />
                          </TableCell>
                        );
                      })}
                      <TableCell style={{ color: exceedsAllocated ? "red" : "inherit" }}>
                        {totalBookedHours}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={2} display="flex" justifyContent="center" alignItems="center">
            <Button variant="contained" color="secondary" onClick={saveTimesheet} style={{ marginRight: "10px" }} disabled={loading}>
              Save Timesheet
            </Button>
            <Button variant="contained" color="primary" onClick={submitTimesheet} disabled={loading} startIcon={loading && <CircularProgress size={20}/>}>
              {loading ? "Submitting..." : "Submit Timesheet"}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={successOpen}
        autoHideDuration={6000}
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSuccessClose} severity="success" sx={{ width: "100%" }}>
          Timesheet saved!
        </Alert>
      </Snackbar>

      <Snackbar
        open={errorOpen}
        autoHideDuration={8000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: "100%" }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookTimesheet;
