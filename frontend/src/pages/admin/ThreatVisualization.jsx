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
  Analytics,
  Delete
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSavedVisualizations, saveVisualization, deleteSavedVisualization } from '../../services/api';

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
<<<<<<< HEAD
  const [intervalId, setIntervalId] = useState(null);
=======
  const [savedVisualizations, setSavedVisualizations] = useState([]);
  const [isSavingVisualization, setIsSavingVisualization] = useState(false);
>>>>>>> 2e0cca0529c3c5f7c41af00d5712fc37fa85e5c1

  // Initialize ML API connection
  useEffect(() => {
    initializeMLAPI();
  }, []);

<<<<<<< HEAD
  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);
=======
  useEffect(() => {
    // Fetch saved visualizations for the user
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    getSavedVisualizations(user.id || 'test-user').then(data => {
      setSavedVisualizations(data.visualizations || []);
    }).catch(error => {
      console.error('Error fetching saved visualizations:', error);
      setSavedVisualizations([]);
    });
  }, []);

  const handleSaveVisualization = async () => {
    if (!hasResults) {
      alert('No results to save. Please process a CSV file first.');
      return;
    }

    setIsSavingVisualization(true);
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Ensure fileMeta has safe defaults
      const safeFileMeta = fileMeta || {};
      const fileName = safeFileMeta.name || 'Unknown File';
      
      // Add upload time if not present
      if (!safeFileMeta.uploadDate) {
        safeFileMeta.uploadDate = new Date().toISOString();
      }
      
      const visualizationData = {
        userId: user.id || 'test-user',
        fileMeta: safeFileMeta,
        results: results,
        chartsData: {
          threatTypeData,
          threatLevelPerType,
          statusData,
          topThreatTypes,
          timeData
        },
        title: `Threat Analysis - ${fileName}`,
        description: `Analysis of ${results.length} records with ${totalThreats} threats detected`
      };

      const response = await saveVisualization(visualizationData);
      console.log('Visualization saved:', response);
      
      // Refresh saved visualizations
      const updatedVisualizations = await getSavedVisualizations(user.id || 'test-user');
      setSavedVisualizations(updatedVisualizations.visualizations || []);
      
      alert('Visualization saved successfully!');
    } catch (error) {
      console.error('Error saving visualization:', error);
      alert('Failed to save visualization: ' + error.message);
    } finally {
      setIsSavingVisualization(false);
    }
  };

  const handleDeleteVisualization = async (visualizationId) => {
    try {
      await deleteSavedVisualization(visualizationId);
      
      // Refresh saved visualizations
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const updatedVisualizations = await getSavedVisualizations(user.id || 'test-user');
      setSavedVisualizations(updatedVisualizations.visualizations || []);
      
      alert('Visualization deleted successfully!');
    } catch (error) {
      console.error('Error deleting visualization:', error);
      alert('Failed to delete visualization: ' + error.message);
    }
  };
>>>>>>> 2e0cca0529c3c5f7c41af00d5712fc37fa85e5c1

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

  // Live monitoring simulation - TEMPORARILY DISABLED to debug 422 errors
  const startLiveMonitoring = () => {
    console.log('Live monitoring disabled for debugging');
    setIsLiveMonitoring(false);
    setLivePredictions([]);
    
    // TODO: Re-enable after fixing 422 errors
    /*
    setIsLiveMonitoring(true);
    setLivePredictions([]);
    
    // Simulate live predictions every 5 seconds
    const interval = setInterval(async () => {
      // Check if monitoring is still active
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

    // Store interval ID for cleanup
    setIntervalId(interval);
    */
  };

  const stopLiveMonitoring = () => {
    setIsLiveMonitoring(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
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
        <Box display="flex" gap={2}>
          {hasResults && results && results.length > 0 && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSaveVisualization}
              disabled={isSavingVisualization}
              startIcon={isSavingVisualization ? <CircularProgress size={20} /> : <Analytics />}
            >
              {isSavingVisualization ? 'Saving...' : 'Save Visualization'}
            </Button>
          )}
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
          <Grid xs={12} md={3}>
            <Card sx={{ background: '#232323', color: '#fff', borderLeft: '6px solid #b71c1c' }}>
              <CardContent>
                <Typography variant="h5">Total Threats</Typography>
                <Typography variant="h3" fontWeight="bold">{totalThreats}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={3}>
            <Card sx={{ background: '#232323', color: '#fff', borderLeft: '6px solid #ff5252' }}>
              <CardContent>
                <Typography variant="h5">Critical Threats</Typography>
                <Typography variant="h3" fontWeight="bold">{criticalThreats}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={3}>
            <Card sx={{ background: '#232323', color: '#fff', borderLeft: '6px solid #388e3c' }}>
              <CardContent>
                <Typography variant="h5">Prediction Accuracy</Typography>
                <Typography variant="h3" fontWeight="bold">{accuracy}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={3}>
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
          <Grid xs={12} md={6}>
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
          <Grid xs={12} md={6}>
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
          <Grid xs={12} md={8}>
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
          <Grid xs={12} md={4}>
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
            <Grid xs={12}>
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
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>Saved Visualizations</Typography>
        {savedVisualizations.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No saved visualizations yet. Process a CSV file and save the visualization to see it here.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {savedVisualizations.map(vis => (
              <Grid xs={12} md={6} lg={4} key={vis.id}>
                <Card sx={{ 
                  background: '#232323', 
                  color: '#fff',
                  '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' }
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {vis.title || vis.fileMeta?.name || 'Threat Analysis'}
                      </Typography>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteVisualization(vis.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                    
                    {/* File Information */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>File:</strong> {vis.fileMeta?.name || 'Unknown File'}
                      </Typography>
                      {vis.fileMeta?.size && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          <strong>Size:</strong> {vis.fileMeta.size}
                        </Typography>
                      )}
                      {vis.fileMeta?.uploadDate && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          <strong>Uploaded:</strong> {new Date(vis.fileMeta.uploadDate).toLocaleString()}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>Records:</strong> {vis.results.length} processed
                      </Typography>
                    </Box>
                    
                    {/* Analysis Summary */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {vis.description || `Analysis of ${vis.results.length} records`}
                    </Typography>
                    
                    {/* Creation Time */}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      <strong>Analysis Created:</strong> {new Date(vis.createdAt).toLocaleString()}
                    </Typography>
                    
                    {/* Action Buttons */}
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate('/admin/threat-visualization', { 
                          state: { 
                            results: vis.results, 
                            fileMeta: vis.fileMeta 
                          } 
                        })}
                      >
                        View Analysis
                      </Button>
                      <Chip 
                        label={`${vis.results.length} records`} 
                        size="small" 
                        color="primary"
                      />
                      {vis.fileMeta?.records && (
                        <Chip 
                          label={`${vis.fileMeta.records} total`} 
                          size="small" 
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default ThreatVisualization;