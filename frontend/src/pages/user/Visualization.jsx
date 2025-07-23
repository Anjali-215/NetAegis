import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardContent, Typography, Paper, Button, Chip } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Legend } from 'recharts';

const COLORS = ['#b71c1c', '#ff5252', '#c50e29', '#7f0000', '#3a2323', '#ff867f', '#ffb300', '#388e3c'];

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || 'Unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function getThreatLevelPerType(results) {
  const map = {};
  results.forEach(r => {
    const type = r.threatType || 'Unknown';
    const level = r.threatLevel || 'Unknown';
    if (!map[type]) map[type] = {};
    map[type][level] = (map[type][level] || 0) + 1;
  });
  // Convert to array for stacked bar
  const levels = Array.from(new Set(results.map(r => r.threatLevel || 'Unknown')));
  return Object.entries(map).map(([type, levelsObj]) => {
    const row = { type };
    levels.forEach(lvl => { row[lvl] = levelsObj[lvl] || 0; });
    return row;
  });
}

const Visualization = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results = [], fileMeta = {} } = location.state || {};

  if (!results.length) {
    return (
      <Box p={6} textAlign="center">
        <Typography variant="h4" gutterBottom>No results to visualize.</Typography>
        <Button variant="contained" color="error" onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  // Dashboard metrics
  const totalThreats = results.filter(r => r.threatType && r.threatType !== 'None').length;
  const criticalThreats = results.filter(r => r.threatLevel && r.threatLevel.toLowerCase() === 'critical').length;
  const processedRows = results.length;
  const successCount = results.filter(r => r.status === 'completed').length;
  const accuracy = processedRows ? ((successCount / processedRows) * 100).toFixed(1) : 0;

  // Threat Type Distribution
  const threatTypeCounts = groupBy(results.filter(r => r.threatType), 'threatType');
  const threatTypeData = Object.entries(threatTypeCounts).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));

  // Threat Level per Type
  const threatLevelPerType = getThreatLevelPerType(results);
  const allLevels = Array.from(new Set(results.map(r => r.threatLevel || 'Unknown')));

  // Prediction Status
  const statusCounts = groupBy(results, 'status');
  const statusData = Object.entries(statusCounts).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));

  // Top Frequent Threat Types
  const topThreatTypes = [...threatTypeData].sort((a, b) => b.value - a.value).slice(0, 5);

  // Threats Over Time (if timestamp available)
  let timeData = [];
  if (results.some(r => r.data && r.data.timestamp)) {
    const byTime = {};
    results.forEach(r => {
      const t = r.data.timestamp ? r.data.timestamp.split('T')[0] : 'Unknown';
      if (!byTime[t]) byTime[t] = 0;
      byTime[t] += 1;
    });
    timeData = Object.entries(byTime).map(([date, count]) => ({ date, count }));
    timeData.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, background: '#181818', minHeight: '100vh' }}>
      <Button variant="outlined" color="error" sx={{ mb: 3 }} onClick={() => navigate(-1)}>Back to Results</Button>
      <Typography variant="h3" fontWeight="bold" gutterBottom color="#b71c1c">Threats Visualization</Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        File: {fileMeta.name} | Processed Rows: {fileMeta.recordCount || processedRows}
      </Typography>
      {/* Dashboard Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: '#232323', color: '#fff', borderLeft: '6px solid #b71c1c' }}>
            <CardContent>
              <Typography variant="h5">Total Threats</Typography>
              <Typography variant="h3" fontWeight="bold">{totalThreats}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: '#232323', color: '#fff', borderLeft: '6px solid #ff5252' }}>
            <CardContent>
              <Typography variant="h5">Critical Threats</Typography>
              <Typography variant="h3" fontWeight="bold">{criticalThreats}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: '#232323', color: '#fff', borderLeft: '6px solid #388e3c' }}>
            <CardContent>
              <Typography variant="h5">Prediction Accuracy</Typography>
              <Typography variant="h3" fontWeight="bold">{accuracy}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: '#232323', color: '#fff', borderLeft: '6px solid #ffb300' }}>
            <CardContent>
              <Typography variant="h5">Processed Rows</Typography>
              <Typography variant="h3" fontWeight="bold">{processedRows}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Charts */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, background: '#222', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Threat Type Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={threatTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {threatTypeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, background: '#222', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Prediction Status</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, background: '#222', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Threat Level per Type</Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={threatLevelPerType} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                {allLevels.map((lvl, i) => (
                  <Bar key={lvl} dataKey={lvl} stackId="a" fill={COLORS[i % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, background: '#222', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Top Frequent Threat Types</Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart layout="vertical" data={topThreatTypes} margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#b71c1c">
                  {topThreatTypes.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {timeData.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, background: '#222', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Threats Over Time</Typography>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="count" stroke="#b71c1c" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Visualization; 