import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const Reports = () => {
  const [dateRange, setDateRange] = useState('7days');
  const [threatType, setThreatType] = useState('all');

  // Sample data - replace with actual data from API
  const rows = [
    {
      id: 1,
      timestamp: '2024-03-15 14:30:00',
      threatType: 'DDoS',
      severity: 'High',
      sourceIP: '192.168.1.100',
      status: 'Blocked',
    },
    {
      id: 2,
      timestamp: '2024-03-15 13:45:00',
      threatType: 'Ransomware',
      severity: 'Critical',
      sourceIP: '10.0.0.50',
      status: 'Investigation',
    },
    // Add more sample data as needed
  ];

  const columns = [
    { field: 'timestamp', headerName: 'Timestamp', width: 180 },
    { field: 'threatType', headerName: 'Threat Type', width: 130 },
    { field: 'severity', headerName: 'Severity', width: 100 },
    { field: 'sourceIP', headerName: 'Source IP', width: 130 },
    { field: 'status', headerName: 'Status', width: 130 },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Security Reports
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Date Range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="24hours">Last 24 Hours</MenuItem>
                <MenuItem value="7days">Last 7 Days</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Threat Type"
                value={threatType}
                onChange={(e) => setThreatType(e.target.value)}
              >
                <MenuItem value="all">All Threats</MenuItem>
                <MenuItem value="ddos">DDoS</MenuItem>
                <MenuItem value="ransomware">Ransomware</MenuItem>
                <MenuItem value="malware">Malware</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="contained" fullWidth>
                Generate Report
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="outlined" fullWidth>
                Export Data
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              checkboxSelection
              disableSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports; 