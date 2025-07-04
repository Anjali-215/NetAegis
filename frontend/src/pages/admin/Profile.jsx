import React from 'react';
import { Box, Container, Typography, Card, CardContent, Avatar, Grid, Chip, Divider } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';

// Example user data (replace with real data from context or API later)
const user = {
  name: 'Jane Doe',
  email: 'jane.doe@company.com',
  role: 'Administrator',
  department: 'Security',
  location: 'New York, NY',
  joined: '2023-01-15',
  avatar: 'JD',
};

const Profile = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card sx={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #231417 100%)',
        color: 'white',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.10)',
        p: 4
      }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar sx={{ width: 96, height: 96, bgcolor: '#b71c1c', fontSize: 40, mb: 2 }}>
              {user.avatar || <AccountCircle fontSize="large" />}
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
              {user.name}
            </Typography>
            <Chip label={user.role} color="primary" sx={{ fontWeight: 'bold', fontSize: 16, mb: 1 }} />
            <Typography variant="body1" sx={{ opacity: 0.8, textAlign: 'center' }}>{user.email}</Typography>
          </Box>
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.10)' }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Department</Typography>
              <Typography variant="body1">{user.department}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Location</Typography>
              <Typography variant="body1">{user.location}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Joined</Typography>
              <Typography variant="body1">{user.joined}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Role</Typography>
              <Typography variant="body1">{user.role}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile; 