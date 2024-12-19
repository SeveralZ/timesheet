require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { addDays, format, startOfWeek, endOfWeek } = require('date-fns');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const EMPLOYEE_ID = 2;

const NON_PROJECT_TASK_IDS = {
  Training: 9999,
  Meeting: 9998,
};

async function getTimesheetData(employeeId, weekStart, weekEnd) {
  try {
    const startDate = new Date(weekStart);
    const [taskRows] = await pool.query(
      `
      SELECT 
        t.task_id, t.task_name, t.estimated_hours AS allocatedHours,
        p.project_name, p.start_date AS project_start, p.end_date AS project_end
      FROM Tasks t
      LEFT JOIN Projects p ON t.project_id = p.project_id
      WHERE t.assigned_to = ?
    `,
      [employeeId]
    );

    const [timesheetRows] = await pool.query(
      `
      SELECT task_id, DATE_FORMAT(date, '%Y-%m-%d') as date, hours_logged
      FROM timesheets
      WHERE employee_id = ? AND date BETWEEN ? AND ?
    `,
      [employeeId, weekStart, weekEnd]
    );

    const timesheetMap = {};
    timesheetRows.forEach((entry) => {
      const key = `${entry.task_id}-${entry.date}`;
      timesheetMap[key] = entry.hours_logged;
    });

    const dayMap = {};
    for (let i = 0; i < 7; i++) {
      const dayStr = format(addDays(startDate, i), 'yyyy-MM-dd');
      dayMap[dayStr] = i;
    }

    const rows = taskRows.map((task) => {
      const hours = Array(7).fill("");
      Object.keys(dayMap).forEach((date) => {
        const key = `${task.task_id}-${date}`;
        if (timesheetMap[key] !== undefined) {
          hours[dayMap[date]] = timesheetMap[key].toString();
        }
      });

      return {
        project: task.project_name || "Non-Project",
        task: task.task_name,
        task_id: task.task_id,
        allocatedHours: task.project_name ? task.allocatedHours : null,
        startDate: task.project_start ? format(task.project_start, 'yyyy-MM-dd') : null,
        endDate: task.project_end ? format(task.project_end, 'yyyy-MM-dd') : null,
        hours,
        isEditable: task.project_name === null, 
      };
    });

    for (const [taskName, taskId] of Object.entries(NON_PROJECT_TASK_IDS)) {
      if (!rows.find((row) => row.task_id === taskId)) {
        const hours = Array(7).fill("");
        Object.keys(dayMap).forEach((date) => {
          const key = `${taskId}-${date}`;
          if (timesheetMap[key] !== undefined) {
            hours[dayMap[date]] = timesheetMap[key].toString();
          }
        });

        rows.push({
          project: "Non-Project",
          task: taskName,
          task_id: taskId,
          allocatedHours: null,
          startDate: null,
          endDate: null,
          hours,
          isEditable: true,
        });
      }
    }

    return { rows, nonProjectTasks: Object.keys(NON_PROJECT_TASK_IDS) };
  } catch (error) {
    console.error("Error in getTimesheetData:", error);
    throw error;
  }
}

app.post('/api/save-timesheet', async (req, res) => {
  const { weekStart, weekEnd, rows } = req.body;

  if (!weekStart || !weekEnd || !rows) {
    return res.status(400).json({ error: 'Missing weekStart, weekEnd, or rows.' });
  }

  try {
    const startDate = new Date(weekStart);
    const queries = [];

    for (const row of rows) {
      const { task_id, hours } = row;

      if (!task_id) continue;

      for (let i = 0; i < 7; i++) {
        const date = format(addDays(startDate, i), 'yyyy-MM-dd');
        const loggedHours = isNaN(parseFloat(hours[i])) ? null : parseFloat(hours[i]);

        if (loggedHours !== null) {
          if (loggedHours > 9) {
            return res.status(400).json({
              error: `Cannot log more than 9 hours in a single day for task_id: ${task_id} on ${date}`,
            });
          }

          console.log(`Saving timesheet for task_id=${task_id}, date=${date}, hours=${loggedHours}`);

          queries.push(pool.query(
            `
            INSERT INTO timesheets (task_id, employee_id, date, hours_logged, status)
            VALUES (?, ?, ?, ?, 'Approved')
            ON DUPLICATE KEY UPDATE hours_logged = VALUES(hours_logged), status = 'Approved'
            `,
            [task_id, EMPLOYEE_ID, date, loggedHours]
          ));
        }
      }
    }

    await Promise.all(queries);

    const updatedData = await getTimesheetData(EMPLOYEE_ID, weekStart, weekEnd);
    res.json({ success: true, ...updatedData });

  } catch (error) {
    console.error("Error saving timesheet data:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get('/api/timesheet-data', async (req, res) => {
  const { weekStart, weekEnd } = req.query;
  if (!weekStart || !weekEnd) {
    return res.status(400).json({ error: 'Missing weekStart or weekEnd parameter.' });
  }

  try {
    const data = await getTimesheetData(EMPLOYEE_ID, weekStart, weekEnd);
    res.json(data);
  } catch (error) {
    console.error("Error fetching timesheet data:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
