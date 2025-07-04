import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import {
  Download,
  FilterList,
  Refresh,
  TrendingUp,
  TrendingDown,
  Security,
  Warning,
  Error,
  CheckCircle
} from '@mui/icons-material';

const ThreatVisualization = () => {
  const [filters, setFilters] = useState({
    dateRange: '30',
    threatType: 'all',
    confidence: 'all'
  });

  const [chartType, setChartType] = useState('bar');

  // Sample data
  const threatData = [
    { name: 'Jan', Malware: 65, DDoS: 45, Phishing: 30, SQLInjection: 20, Other: 10 },
    { name: 'Feb', Malware: 89, DDoS: 52, Phishing: 38, SQLInjection: 25, Other: 12 },
    { name: 'Mar', Malware: 120, DDoS: 78, Phishing: 45, SQLInjection: 32, Other: 15 },
    { name: 'Apr', Malware: 95, DDoS: 65, Phishing: 42, SQLInjection: 28, Other: 13 },
    { name: 'May', Malware: 150, DDoS: 95, Phishing: 58, SQLInjection: 40, Other: 18 },
    { name: 'Jun', Malware: 180, DDoS: 120, Phishing: 72, SQLInjection: 48, Other: 22 }
  ];

  // For all chart series and pie segments, replace colors like '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', etc. with '#b71c1c', '#ff5252', '#c50e29', '#7f0000', '#3a2323'.
  const threatTypesData = [
    { name: 'Malware', value: 35, color: '#b71c1c' },
    { name: 'DDoS', value: 25, color: '#ff5252' },
    { name: 'Phishing', value: 20, color: '#c50e29' },
    { name: 'SQL Injection', value: 15, color: '#7f0000' },
    { name: 'Other', value: 5, color: '#3a2323' }
  ];

  const confidenceData = [
    { name: 'High', value: 45, color: '#b71c1c' },
    { name: 'Medium', value: 35, color: '#ff5252' },
    { name: 'Low', value: 20, color: '#3a2323' }
  ];

  const trendData = [
    { name: 'Jan', threats: 65, blocked: 60, detected: 5 },
    { name: 'Feb', threats: 89, blocked: 82, detected: 7 },
    { name: 'Mar', threats: 120, blocked: 108, detected: 12 },
    { name: 'Apr', threats: 95, blocked: 87, detected: 8 },
    { name: 'May', threats: 150, blocked: 135, detected: 15 },
    { name: 'Jun', threats: 180, blocked: 162, detected: 18 }
  ];

  // For all chart series, use only these COLORS.
  const COLORS = ['#b71c1c', '#ff5252', '#c50e29', '#7f0000', '#3a2323'];

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleDownloadChart = () => {
    // Simulate chart download
    alert('Chart download started...');
  };

  const handleGenerateReport = () => {
    // Simulate report generation
    alert('Report generation started...');
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={threatData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="Malware" fill="#b71c1c" />
              <Bar dataKey="DDoS" fill="#ff5252" />
              <Bar dataKey="Phishing" fill="#c50e29" />
              <Bar dataKey="SQLInjection" fill="#7f0000" />
              <Bar dataKey="Other" fill="#3a2323" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="threats" stroke="#b71c1c" strokeWidth={3} />
              <Line type="monotone" dataKey="blocked" stroke="#ff5252" strokeWidth={3} />
              <Line type="monotone" dataKey="detected" stroke="#c50e29" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={threatData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area type="monotone" dataKey="Malware" stackId="1" stroke="#b71c1c" fill="#b71c1c" />
              <Area type="monotone" dataKey="DDoS" stackId="1" stroke="#ff5252" fill="#ff5252" />
              <Area type="monotone" dataKey="Phishing" stackId="1" stroke="#c50e29" fill="#c50e29" />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Threat Visualization
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownloadChart}
          >
            Download Chart
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleGenerateReport}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            Generate Report
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <FilterList color="primary" />
          <Typography variant="h6">Filters</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={filters.dateRange}
                label="Date Range"
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <MenuItem value="7">Last 7 days</MenuItem>
                <MenuItem value="30">Last 30 days</MenuItem>
                <MenuItem value="90">Last 90 days</MenuItem>
                <MenuItem value="365">Last year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Threat Type</InputLabel>
              <Select
                value={filters.threatType}
                label="Threat Type"
                onChange={(e) => handleFilterChange('threatType', e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="malware">Malware</MenuItem>
                <MenuItem value="ddos">DDoS</MenuItem>
                <MenuItem value="phishing">Phishing</MenuItem>
                <MenuItem value="sqlinjection">SQL Injection</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Confidence Level</InputLabel>
              <Select
                value={filters.confidence}
                label="Confidence Level"
                onChange={(e) => handleFilterChange('confidence', e.target.value)}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                label="Chart Type"
                onChange={(e) => setChartType(e.target.value)}
              >
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="area">Area Chart</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Threat Detection Trends
          </Typography>
          <Tooltip title="Refresh Data">
            <IconButton>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
        {renderChart()}
      </Paper>

      {/* Summary Cards */}
      <Grid container rowSpacing={3} columnSpacing={3} columns={12}>
        <Grid xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    1,247
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Threats
                  </Typography>
                </Box>
                <Security sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #7f0000 0%, #b71c1c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    1,123
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Blocked Threats
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #c50e29 0%, #ff867f 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    124
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Detected Threats
                  </Typography>
                </Box>
                <TrendingDown sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #231417 0%, #7f0000 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    90.1%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Block Rate
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pie Charts */}
      <Grid container rowSpacing={3} columnSpacing={3} columns={12}>
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Threat Types Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={threatTypesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {threatTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Confidence Level Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={confidenceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {confidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Alerts */}
      <Box sx={{ mt: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Tip:</strong> Use the filters above to customize your threat visualization. 
            You can download charts as images or generate comprehensive PDF reports.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default ThreatVisualization; 