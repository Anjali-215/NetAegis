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

// Import API services
import { 
  checkApiHealth, 
  getModels, 
  predictThreat, 
  getModelPerformance,
  getSampleNetworkData 
} from '../../services/api';

const ThreatVisualization = () => {
  const [filters, setFilters] = useState({
    dateRange: '30',
    threatType: 'all',
    confidence: 'all'
  });

  const [chartType, setChartType] = useState('bar');
  
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

      {/* ML API Status */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6">ML API Status:</Typography>
          <Chip
            label={apiStatus === 'connected' ? 'Connected' : apiStatus === 'checking' ? 'Checking...' : 'Disconnected'}
            color={apiStatus === 'connected' ? 'success' : apiStatus === 'checking' ? 'warning' : 'error'}
            icon={apiStatus === 'checking' ? <CircularProgress size={16} /> : undefined}
          />
          {apiStatus === 'error' && (
            <Button
              variant="outlined"
              size="small"
              onClick={initializeMLAPI}
            >
              Retry Connection
            </Button>
          )}
        </Box>
      </Paper>

      {/* ML Controls */}
      {apiStatus === 'connected' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" mb={2}>Machine Learning Controls</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={1}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Test Threat Type</InputLabel>
                  <Select
                    value={testThreatType}
                    label="Test Threat Type"
                    onChange={(e) => setTestThreatType(e.target.value)}
                  >
                    <MenuItem value="normal">Normal Traffic</MenuItem>
                    <MenuItem value="ddos">DDoS Attack</MenuItem>
                    <MenuItem value="scanning">Port Scanning</MenuItem>
                    <MenuItem value="injection">SQL Injection</MenuItem>
                    <MenuItem value="backdoor">Backdoor</MenuItem>
                    <MenuItem value="xss">XSS Attack</MenuItem>
                    <MenuItem value="ransomware">Ransomware</MenuItem>
                    <MenuItem value="mitm">Man-in-the-Middle</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={isPredicting ? <CircularProgress size={20} /> : <Analytics />}
                  onClick={handleSinglePrediction}
                  disabled={isPredicting}
                  sx={{ 
                    background: 'linear-gradient(135deg, #b71c1c 0%, #ff5252 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #a01515 0%, #e64545 100%)'
                    }
                  }}
                >
                  Test Prediction
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary" align="center">
                CSV uploads are handled in the CSV Upload page
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant={isLiveMonitoring ? "contained" : "outlined"}
                fullWidth
                startIcon={isLiveMonitoring ? <Stop /> : <PlayArrow />}
                onClick={isLiveMonitoring ? stopLiveMonitoring : startLiveMonitoring}
                disabled={isPredicting}
                color={isLiveMonitoring ? "error" : "primary"}
              >
                {isLiveMonitoring ? 'Stop Live Monitoring' : 'Start Live Monitoring'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

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

      {/* Live Monitoring Results */}
      {isLiveMonitoring && livePredictions.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Live Monitoring Results
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                                     <TableRow>
                       <TableCell>Time</TableCell>
                       <TableCell>Threat Type</TableCell>
                       <TableCell>Threat Level</TableCell>
                       <TableCell>Final Prediction</TableCell>
                       <TableCell>Random Forest</TableCell>
                       <TableCell>XGBoost</TableCell>
                       <TableCell>Neural Network</TableCell>
                     </TableRow>
              </TableHead>
              <TableBody>
                {livePredictions.map((pred) => (
                                     <TableRow key={pred.id}>
                     <TableCell>{pred.timestamp}</TableCell>
                     <TableCell>
                       <Chip
                         label={pred.threat_type || 'Unknown'}
                         color={pred.threat_type === 'normal' ? 'success' : 'error'}
                         size="small"
                       />
                     </TableCell>
                     <TableCell>
                       <Chip
                         label={pred.threat_level}
                         color={
                           pred.threat_level === 'Critical' ? 'error' : 
                           pred.threat_level === 'High' ? 'warning' : 
                           pred.threat_level === 'Normal' ? 'success' : 'default'
                         }
                         size="small"
                       />
                     </TableCell>
                     <TableCell>{pred.final_prediction}</TableCell>
                    <TableCell>
                      {pred.predictions?.random_forest !== undefined ? (
                        <Chip
                          label={pred.predictions.random_forest ? 'Attack' : 'Normal'}
                          color={pred.predictions.random_forest ? 'error' : 'success'}
                          size="small"
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {pred.predictions?.xgboost !== undefined ? (
                        <Chip
                          label={pred.predictions.xgboost ? 'Attack' : 'Normal'}
                          color={pred.predictions.xgboost ? 'error' : 'success'}
                          size="small"
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {pred.predictions?.neural_network !== undefined ? (
                        <Chip
                          label={pred.predictions.neural_network ? 'Attack' : 'Normal'}
                          color={pred.predictions.neural_network ? 'error' : 'success'}
                          size="small"
                        />
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Prediction Results Dialog */}
      <Dialog
        open={predictionDialog}
        onClose={() => setPredictionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {batchResults ? 'Batch Prediction Results' : 'Single Prediction Results'}
        </DialogTitle>
        <DialogContent>
          {predictionResult && (
            <Box>
              <Typography variant="h6" gutterBottom>Prediction Summary</Typography>
                             <Grid container spacing={2} mb={3}>
                 <Grid item xs={4}>
                   <Typography variant="body2" color="textSecondary">Threat Type:</Typography>
                   <Chip
                     label={predictionResult.threat_type || 'Unknown'}
                     color={predictionResult.threat_type === 'normal' ? 'success' : 'error'}
                     sx={{ mt: 1 }}
                   />
                 </Grid>
                 <Grid item xs={4}>
                   <Typography variant="body2" color="textSecondary">Threat Level:</Typography>
                   <Chip
                     label={predictionResult.threat_level}
                     color={
                       predictionResult.threat_level === 'Critical' ? 'error' : 
                       predictionResult.threat_level === 'High' ? 'warning' : 
                       predictionResult.threat_level === 'Normal' ? 'success' : 'default'
                     }
                     sx={{ mt: 1 }}
                   />
                 </Grid>
                 <Grid item xs={4}>
                   <Typography variant="body2" color="textSecondary">Final Prediction:</Typography>
                   <Typography variant="body1" sx={{ mt: 1 }}>
                     {predictionResult.threat_type === 'normal' ? 'Normal Traffic' : `${predictionResult.threat_type.toUpperCase()} Attack`}
                   </Typography>
                 </Grid>
               </Grid>

              <Typography variant="h6" gutterBottom>Model Predictions</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                                         <TableRow>
                       <TableCell>Model</TableCell>
                       <TableCell>Prediction</TableCell>
                       <TableCell>Threat Type</TableCell>
                       <TableCell>Confidence</TableCell>
                     </TableRow>
                  </TableHead>
                                     <TableBody>
                     {Object.entries(predictionResult.predictions || {}).map(([model, pred]) => {
                       const threatTypes = {
                         0: "normal",
                         1: "scanning", 
                         2: "ddos",
                         3: "injection",
                         4: "backdoor",
                         5: "xss",
                         6: "ransomware",
                         7: "mitm"
                       };
                       const threatType = threatTypes[pred] || 'unknown';
                       const confidence = predictionResult.probabilities?.[model]?.[threatType] || 
                                        (predictionResult.probabilities?.[model] && 
                                         Object.values(predictionResult.probabilities[model])[0]) || 0;
                       
                       return (
                         <TableRow key={model}>
                           <TableCell>{model.replace('_', ' ').toUpperCase()}</TableCell>
                           <TableCell>
                             <Chip
                               label={pred !== null ? pred : 'Error'}
                               color={threatType === 'normal' ? 'success' : 'error'}
                               size="small"
                             />
                           </TableCell>
                           <TableCell>
                             <Chip
                               label={threatType}
                               color={threatType === 'normal' ? 'success' : 'error'}
                               size="small"
                             />
                           </TableCell>
                           <TableCell>
                             {confidence ? `${(confidence * 100).toFixed(2)}%` : '-'}
                           </TableCell>
                         </TableRow>
                       );
                     })}
                   </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Input Data</Typography>
              <Typography variant="body2" component="pre" sx={{ 
                backgroundColor: '#f5f5f5', 
                p: 2, 
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: 200
              }}>
                {JSON.stringify(predictionResult.input_data, null, 2)}
              </Typography>
            </Box>
          )}

          {batchResults && (
            <Box>
              <Typography variant="h6" gutterBottom>Batch Processing Summary</Typography>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">Total Rows:</Typography>
                  <Typography variant="h6">{batchResults.total_rows}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">Processed:</Typography>
                  <Typography variant="h6">{batchResults.processed_rows}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">Success Rate:</Typography>
                  <Typography variant="h6">
                    {((batchResults.processed_rows / batchResults.total_rows) * 100).toFixed(1)}%
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Sample Results</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                                         <TableRow>
                       <TableCell>Row</TableCell>
                       <TableCell>Threat Type</TableCell>
                       <TableCell>Threat Level</TableCell>
                       <TableCell>Final Prediction</TableCell>
                       <TableCell>Status</TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                                         {batchResults.results.slice(0, 10).map((result, index) => (
                       <TableRow key={index}>
                         <TableCell>{result.row}</TableCell>
                         <TableCell>
                           {result.prediction ? (
                             <Chip
                               label={result.prediction.threat_type || 'Unknown'}
                               color={result.prediction.threat_type === 'normal' ? 'success' : 'error'}
                               size="small"
                             />
                           ) : '-'}
                         </TableCell>
                         <TableCell>
                           {result.prediction ? (
                             <Chip
                               label={result.prediction.threat_level}
                               color={
                                 result.prediction.threat_level === 'Critical' ? 'error' : 
                                 result.prediction.threat_level === 'High' ? 'warning' : 
                                 result.prediction.threat_level === 'Normal' ? 'success' : 'default'
                               }
                               size="small"
                             />
                           ) : '-'}
                         </TableCell>
                         <TableCell>
                           {result.prediction?.threat_type 
                             ? (result.prediction.threat_type === 'normal' ? 'Normal Traffic' : `${result.prediction.threat_type.toUpperCase()} Attack`)
                             : '-'
                           }
                         </TableCell>
                         <TableCell>
                           {result.error ? (
                             <Chip label="Error" color="error" size="small" />
                           ) : (
                             <Chip label="Success" color="success" size="small" />
                           )}
                         </TableCell>
                       </TableRow>
                     ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPredictionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

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