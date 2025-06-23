import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

const AlertItem = ({ alert }) => {
  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'success';
    }
  };

  return (
    <ListItem
      sx={{
        bgcolor: 'background.paper',
        mb: 1,
        borderRadius: 1,
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color={getSeverityColor(alert.severity)} />
            <Typography variant="subtitle1">{alert.title}</Typography>
            <Chip
              label={alert.severity}
              size="small"
              color={getSeverityColor(alert.severity)}
            />
          </Box>
        }
        secondary={
          <>
            <Typography variant="body2" color="text.secondary">
              {alert.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {alert.timestamp}
            </Typography>
          </>
        }
      />
      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="more">
          <MoreVertIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const Alerts = () => {
  // Sample data - replace with actual data from API
  const [alerts] = useState([
    {
      id: 1,
      title: 'Suspicious DDoS Activity Detected',
      description: 'Multiple connection attempts from IP 192.168.1.100',
      severity: 'Critical',
      timestamp: '2024-03-15 14:30:00',
      status: 'Active',
    },
    {
      id: 2,
      title: 'Potential Ransomware Attack',
      description: 'Unusual file encryption patterns detected',
      severity: 'High',
      timestamp: '2024-03-15 13:45:00',
      status: 'Investigation',
    },
    {
      id: 3,
      title: 'Unauthorized Access Attempt',
      description: 'Failed login attempts from multiple locations',
      severity: 'Medium',
      timestamp: '2024-03-15 12:15:00',
      status: 'Resolved',
    },
  ]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Security Alerts
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Recent Alerts</Typography>
                <Chip
                  icon={<CheckCircleIcon />}
                  label="All Systems Operational"
                  color="success"
                  variant="outlined"
                />
              </Box>
              <List>
                {alerts.map((alert) => (
                  <Box key={alert.id}>
                    <AlertItem alert={alert} />
                    <Divider />
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alert Statistics
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  Alert statistics chart will be displayed here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Alerts; 