import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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
  CheckCircle,
  PlayArrow,
  Stop,
  Analytics
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const COLORS = ['#b71c1c', '#ff5252', '#c50e29', '#7f0000', '#3a2323', '#ff867f', '#ffb300', '#388e3c'];
// Import API services
import { 
  checkApiHealth, 
  getModels, 
  predictThreat, 
  getModelPerformance,
  getSampleNetworkData 
} from '../../services/api';

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
  const levels = Array.from(new Set(results.map(r => r.threatLevel || 'Unknown')));
  return Object.entries(map).map(([type, levelsObj]) => {
    const row = { type };
    levels.forEach(lvl => { row[lvl] = levelsObj[lvl] || 0; });
    return row;
  });
}
const ThreatVisualization = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results = [], fileMeta = {} } = location.state || {};
  // If results are passed, use them for all charts and cards
  const hasResults = results && results.length > 0;
  // Dashboard metrics
  const totalThreats = hasResults ? results.filter(r => r.threatType && r.threatType !== 'None').length : 0;
  const criticalThreats = hasResults ? results.filter(r => r.threatLevel && r.threatLevel.toLowerCase() === 'critical').length : 0;
  const processedRows = hasResults ? results.length : 0;
  const successCount = hasResults ? results.filter(r => r.status === 'completed' || r.status === 'Success').length : 0;
  const accuracy = processedRows ? ((successCount / processedRows) * 100).toFixed(1) : 0;
  // Threat Type Distribution
  const threatTypeCounts = hasResults ? groupBy(results.filter(r => r.threatType), 'threatType') : {};
  const threatTypeData = hasResults ? Object.entries(threatTypeCounts).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] })) : [];
  // Threat Level per Type
  const threatLevelPerType = hasResults ? getThreatLevelPerType(results) : [];
  const allLevels = hasResults ? Array.from(new Set(results.map(r => r.threatLevel || 'Unknown'))) : [];
  // Prediction Status
  const statusCounts = hasResults ? groupBy(results, 'status') : {};
  const statusData = hasResults ? Object.entries(statusCounts).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] })) : [];
  // Top Frequent Threat Types
  const topThreatTypes = hasResults ? [...threatTypeData].sort((a, b) => b.value - a.value).slice(0, 5) : [];
  // Threats Over Time (if timestamp available)
  let timeData = [];
  if (hasResults && results.some(r => r.data && r.data.timestamp)) {
    const byTime = {};
    results.forEach(r => {
      const t = r.data.timestamp ? r.data.timestamp.split('T')[0] : 'Unknown';
      if (!byTime[t]) byTime[t] = 0;
      byTime[t] += 1;
    });
    timeData = Object.entries(byTime).map(([date, count]) => ({ date, count }));
    timeData.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // ML Integration states
  const [apiStatus, setApiStatus] = useState('checking');
  const [models, setModels] = useState({});
  const [modelPerformance, setModelPerformance] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionDialog, setPredictionDialog] = useState(false);
  const [batchResults, setBatchResults] = useState(null);
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(false);
  const [livePredictions, setLivePredictions] = useState([]);
  const [testThreatType, setTestThreatType] = useState('normal');

  // Initialize ML API connection
  useEffect(() => {
    initializeMLAPI();
  }, []);

  const initializeMLAPI = async () => {
    try {
      setApiStatus('checking');
      const health = await checkApiHealth();
      if (health.status === 'healthy') {
        setApiStatus('connected');
        
        // Load models and performance data
        const [modelsData, performanceData] = await Promise.all([
          getModels(),
          getModelPerformance()
        ]);
        
        setModels(modelsData.available_models || {});
        setModelPerformance(performanceData.model_performance || {});
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      console.error('ML API initialization failed:', error);
      setApiStatus('error');
    }
  };

  // Make single prediction
  const handleSinglePrediction = async () => {
    try {
      setIsPredicting(true);
      const sampleData = getSampleNetworkData(testThreatType);
      const result = await predictThreat(sampleData);
      setPredictionResult(result);
      setPredictionDialog(true);
    } catch (error) {
      console.error('Prediction failed:', error);
      alert('Prediction failed: ' + error.message);
    } finally {
      setIsPredicting(false);
    }
  };

  // Batch prediction removed - handled in CSV upload page

  // Live monitoring simulation
  const startLiveMonitoring = () => {
    setIsLiveMonitoring(true);
    setLivePredictions([]);
    
    // Simulate live predictions every 5 seconds
    const interval = setInterval(async () => {
      if (!isLiveMonitoring) {
        clearInterval(interval);
        return;
      }

      try {
        const sampleData = getSampleNetworkData();
        // Add some randomness to simulate real network data
        sampleData.src_bytes = Math.floor(Math.random() * 1000);
        sampleData.dst_bytes = Math.floor(Math.random() * 5000);
        sampleData.count = Math.floor(Math.random() * 20);
        
        const result = await predictThreat(sampleData);
        setLivePredictions(prev => [
          {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            ...result
          },
          ...prev.slice(0, 9) // Keep only last 10 predictions
        ]);
      } catch (error) {
        console.error('Live prediction failed:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  };

  const stopLiveMonitoring = () => {
    setIsLiveMonitoring(false);
  };

  // Chart data - will be populated from API
  const threatData = [];
  const threatTypesData = [];
  const confidenceData = [];
  const trendData = [];

  // For all chart series, use only these COLORS.
  // const COLORS = ['#b71c1c', '#ff5252', '#c50e29', '#7f0000', '#3a2323', '#ff867f', '#ffb300', '#388e3c'];

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
            onClick={() => navigate(-1)}
          >
            Back to Results
          </Button>
        </Box>
      </Box>
      {/* Dashboard Cards */}
      {hasResults && (
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
      )}
      {/* Charts */}
      {hasResults && (
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
      )}
      {/* Fallback to static/sample data if no results */}
      {!hasResults && (
        <Box textAlign="center" mt={8}>
          <Typography variant="h5" color="text.secondary">No results to visualize. Please upload and process a CSV file first.</Typography>
        </Box>
      )}
    </Container>
  );
};

export default ThreatVisualization; 