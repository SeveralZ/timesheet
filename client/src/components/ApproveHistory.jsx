import React, { useState } from "react";
import { Box, Typography, TextField, Button, List, ListItem } from "@mui/material";

const ApproveHistory = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (newItem) {
      setHistoryItems([...historyItems, newItem]);
      setNewItem("");
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Approve History Section
      </Typography>
      <TextField
        label="Add Item"
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" onClick={addItem}>
        Add Item
      </Button>
      <List>
        {historyItems.map((item, index) => (
          <ListItem key={index}>{item}</ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ApproveHistory;
