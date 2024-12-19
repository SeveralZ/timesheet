import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import BookIcon from "@mui/icons-material/Book";
import BarChartIcon from "@mui/icons-material/BarChart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ReportIcon from "@mui/icons-material/Assessment";
import EventIcon from "@mui/icons-material/Event";

// Example user data (in a real app, this might come from state or props)
const userName = "John Doe";
const lastLogin = "2024-12-09 10:23 AM";

const TopMenu = () => {
  const location = useLocation();

  const menuItems = [
    { label: "Book Timesheet", path: "/time-tracker", icon: <BookIcon /> },
    { label: "Time Analytics", path: "/time-analytics", icon: <BarChartIcon /> },
    { label: "Requests", path: "/requests", icon: <AssignmentIcon /> },
    { label: "Reports", path: "/reports", icon: <ReportIcon /> },
    { label: "Approver History", path: "/approve-history", icon: <EventIcon /> },
  ];

  return (
    <>
      {/* User Info Bar with Logo on the Left */}
      <AppBar position="static" style={{ backgroundColor: "#f5f5f5", boxShadow: "none" }}>
        <Toolbar style={{ display: "flex", justifyContent: "space-between", minHeight: "60px" }}>
          {/* Logo on the Left */}
          <Box>
            <img
              src="/logo-dark.jpg"
              alt="Logo"
              style={{ height: "40px", marginRight: "20px" }}
            />
          </Box>

          {/* User Info on the Right */}
          <Typography variant="body1" style={{ color: "#001433", fontWeight: "bold" }}>
            Hi, <strong>{userName}</strong> | Last login: {lastLogin}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Navigation Menu */}
      <AppBar position="static" style={{ backgroundColor: "#80B8C4" }}>
        <Toolbar>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                color="inherit"
                startIcon={item.icon}
                variant={isActive ? "contained" : "text"}
                style={{
                  color: isActive ? "#003366" : "#fff",
                  textTransform: "none",
                  marginRight: 20,
                  backgroundColor: isActive ? "#fff" : "transparent",
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default TopMenu;
