import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Avatar,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  IconButton,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openDonateDialog, setOpenDonateDialog] = useState(false);
  const [donationForm, setDonationForm] = useState({
    amount: '',
    description: '',
    payment_method: 'upi',
    reference_number: '',
    notes: ''
  });
  const [donationError, setDonationError] = useState('');
  const [donationStats, setDonationStats] = useState({
    totalDonated: 0,
    verifiedDonations: 0,
    pendingDonations: 0,
    rejectedDonations: 0
  });
  const [profile, setProfile] = useState({
    full_name: '',
    dob: '',
    college_roll_number: '',
    ikshana_id: '',
    designation: '',
    department: '',
    section: '',
    profile_picture: ''
  });
  const [editProfile, setEditProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [itemType, setItemType] = useState(''); // 'announcement' or 'event'
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [countdowns, setCountdowns] = useState({});

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log('Fetching member data...');

      // Fetch events
      const eventsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/events`,
        config
      );
      console.log('Fetched events:', eventsResponse.data);
      setEvents(eventsResponse.data);

      // Fetch announcements
      const announcementsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/announcements`,
        config
      );
      console.log('Fetched announcements:', announcementsResponse.data);
      setAnnouncements(announcementsResponse.data);

      // Fetch attendance
      const attendanceResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/attendance`,
        config
      );
      console.log('Fetched attendance:', attendanceResponse.data);
      setAttendance(attendanceResponse.data);

      // Fetch donations
      const donationsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/donations/my-donations`,
        config
      );
      setDonations(donationsResponse.data.donations);
      setDonationStats(donationsResponse.data.statistics);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Failed to fetch data. Please try again.');
      setLoading(false);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/profile`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.response?.data?.message || 'Failed to fetch profile');
    }
  };

  const handleDonateClick = () => {
    setDonationForm({
      amount: '',
      description: '',
      payment_method: 'upi',
      reference_number: '',
      notes: ''
    });
    setDonationError('');
    setOpenDonateDialog(true);
  };

  const handleDonationSubmit = async () => {
    try {
      setDonationError('');
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/donations`,
        donationForm,
        config
      );

      setOpenDonateDialog(false);
      fetchData(); // Refresh the donations list
      setSuccessMessage('Donation submitted successfully');
    } catch (error) {
      console.error('Error submitting donation:', error);
      setDonationError(error.response?.data?.message || 'Failed to submit donation. Please try again.');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/profile`,
        tempProfile,
        config
      );

      setProfile(response.data.data);
      setEditProfile(false);
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setTempProfile({
      full_name: profile.full_name || '',
      dob: profile.dob || '',
      college_roll_number: profile.college_roll_number || '',
      designation: profile.designation || '',
      department: profile.department || '',
      section: profile.section || ''
    });
    setEditProfile(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempProfile(prev => ({
      ...prev,
      [name]: value === '' ? null : value
    }));
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const handleDonationChange = (e) => {
    const { name, value } = e.target;
    setDonationForm(prev => ({
      ...prev,
      [name]: value === '' ? null : value
    }));
  };

  const handleItemClick = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setItemType('');
  };

  const renderDetailDialog = () => {
    if (!selectedItem) return null;

    return (
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {itemType === 'announcement' ? 'Announcement Details' : 'Event Details'}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {itemType === 'announcement' ? (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedItem.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedItem.content}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Posted on: {new Date(selectedItem.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedItem.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedItem.description}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Date: {new Date(selectedItem.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Time: {selectedItem.time}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Location: {selectedItem.location}
              </Typography>
              {selectedItem.additional_info && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Additional Information: {selectedItem.additional_info}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderEvents = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day for fair comparison
    
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return showPastEvents ? eventDate < now : eventDate >= now;
    }).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return showPastEvents ? dateB - dateA : dateA - dateB;
    });

    return (
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {showPastEvents ? 'Past Events' : 'Upcoming Events'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showPastEvents}
                    onChange={(e) => setShowPastEvents(e.target.checked)}
                    color="primary"
                  />
                }
                label={showPastEvents ? "Show Upcoming Events" : "Show Past Events"}
              />
            </Box>
          </Box>
          <Grid container spacing={2}>
            {filteredEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}
                  onClick={() => handleItemClick(event, 'event')}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {event.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1
                      }}
                    >
                      {event.description}
                    </Typography>
                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="subtitle2" color="primary">
                        Date: {new Date(event.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                      {event.time && (
                        <Typography variant="subtitle2" color="primary">
                          Time: {event.time}
                        </Typography>
                      )}
                      {event.location && (
                        <Typography variant="subtitle2" color="text.secondary" noWrap>
                          Location: {event.location}
                        </Typography>
                      )}
                      {!showPastEvents && countdowns[event.id] && (
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={`${countdowns[event.id].days}d ${countdowns[event.id].hours}h ${countdowns[event.id].minutes}m left`}
                            color="error"
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {filteredEvents.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body1" align="center" color="text.secondary">
                  {showPastEvents ? 'No past events' : 'No upcoming events scheduled'}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
    );
  };

  const renderAnnouncements = () => (
    <Grid item xs={12}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>Announcements</Typography>
        <Grid container spacing={2}>
          {announcements.map((announcement) => (
            <Grid item xs={12} sm={6} md={4} key={announcement.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6
                  }
                }}
                onClick={() => handleItemClick(announcement, 'announcement')}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {announcement.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 1
                    }}
                  >
                    {announcement.content}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Posted: {new Date(announcement.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {announcements.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body1" align="center" color="text.secondary">
                No announcements found
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Grid>
  );

  const renderDonateDialog = () => (
    <Dialog open={openDonateDialog} onClose={() => setOpenDonateDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>Make a Donation</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Payment Details Section */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Bank Details:
                </Typography>
                <Typography variant="body2">
                  Account Name: Ikshana Foundation<br />
                  Account Number: 1234567890<br />
                  IFSC Code: SBIN0123456<br />
                  Bank: State Bank of India<br />
                  Branch: Hyderabad Main Branch
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>
                  UPI QR Code
                </Typography>
                <Box
                  component="img"
                  src="/images/upi-qr.png"
                  alt="UPI QR Code"
                  sx={{
                    width: '200px',
                    height: '200px',
                    mb: 1,
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    p: 1
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  UPI ID: ikshana@upi
                </Typography>
              </Paper>
            </Box>
          </Grid>

          {/* Donation Form Section */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Donation Details
              </Typography>
              {donationError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {donationError}
                </Alert>
              )}
              <TextField
                fullWidth
                label="Amount"
                type="number"
                name="amount"
                value={donationForm.amount}
                onChange={handleDonationChange}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  name="payment_method"
                  value={donationForm.payment_method}
                  onChange={handleDonationChange}
                  required
                >
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Reference Number"
                name="reference_number"
                value={donationForm.reference_number}
                onChange={handleDonationChange}
                required
                sx={{ mb: 2 }}
                helperText="Enter UPI reference number or bank transaction ID"
              />
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={donationForm.notes}
                onChange={handleDonationChange}
                multiline
                rows={3}
                sx={{ mb: 2 }}
                helperText="Any additional information about your donation"
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDonateDialog(false)}>Cancel</Button>
        <Button 
          onClick={handleDonationSubmit}
          variant="contained" 
          color="primary"
          disabled={!donationForm.amount || !donationForm.reference_number || !donationForm.payment_method}
        >
          Submit Donation
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Update countdowns every second
  useEffect(() => {
    const calculateCountdown = (eventDate) => {
      const now = new Date();
      const eventTime = new Date(eventDate);
      const diff = eventTime - now;

      if (diff <= 0) return null;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      return { days, hours, minutes };
    };

    const timer = setInterval(() => {
      const newCountdowns = {};
      events.forEach(event => {
        const countdown = calculateCountdown(event.date);
        if (countdown) {
          newCountdowns[event.id] = countdown;
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(timer);
  }, [events]);

  useEffect(() => {
    fetchData();
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Personal Details Section */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={editProfile ? (selectedImage ? URL.createObjectURL(selectedImage) : tempProfile.profile_picture) : profile.profile_picture}
                  sx={{ width: 100, height: 100, mr: 2 }}
                />
                {editProfile && (
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="profile-picture-upload"
                      type="file"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="profile-picture-upload">
                      <Button variant="outlined" component="span">
                        Change Picture
                      </Button>
                    </label>
                  </Box>
                )}
              </Box>
              {!editProfile ? (
                <Button variant="contained" onClick={handleEditProfile}>
                  Edit Profile
                </Button>
              ) : (
                <Box>
                  <Button 
                    variant="outlined" 
                    onClick={() => setEditProfile(false)} 
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={editProfile ? tempProfile.full_name : profile.full_name}
                  onChange={handleInputChange}
                  disabled={!editProfile}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={editProfile ? tempProfile.dob : profile.dob}
                  onChange={handleInputChange}
                  disabled={!editProfile}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="College Roll Number"
                  name="college_roll_number"
                  value={editProfile ? tempProfile.college_roll_number : profile.college_roll_number}
                  onChange={handleInputChange}
                  disabled={!editProfile}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ikshana ID"
                  value={profile.ikshana_id}
                  disabled={true}
                  sx={{ mb: 2 }}
                  helperText="This is your unique Ikshana ID and cannot be changed"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  name="designation"
                  value={editProfile ? tempProfile.designation : profile.designation}
                  onChange={handleInputChange}
                  disabled={!editProfile}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={editProfile ? tempProfile.department : profile.department}
                  onChange={handleInputChange}
                  disabled={!editProfile}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Section"
                  name="section"
                  value={editProfile ? tempProfile.section : profile.section}
                  onChange={handleInputChange}
                  disabled={!editProfile}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Member Dashboard
        </Typography>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {renderEvents()}
        {renderAnnouncements()}
        {/* Attendance Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Attendance
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Marked By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.status}</TableCell>
                      <TableCell>{record.marked_by_name || 'System'}</TableCell>
                    </TableRow>
                  ))}
                  {attendance.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No attendance records found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Donations Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Your Donations</Typography>
              <Button variant="contained" color="primary" onClick={handleDonateClick}>
                Make New Donation
              </Button>
            </Box>

            {/* Donation Statistics */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
                  <Typography variant="h6">Total Donated</Typography>
                  <Typography variant="h4">₹{donationStats.totalDonated}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'white' }}>
                  <Typography variant="h6">Verified Donations</Typography>
                  <Typography variant="h4">{donationStats.verifiedDonations}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'white' }}>
                  <Typography variant="h6">Pending</Typography>
                  <Typography variant="h4">{donationStats.pendingDonations}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'white' }}>
                  <Typography variant="h6">Rejected</Typography>
                  <Typography variant="h4">{donationStats.rejectedDonations}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Reference Number</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Verified By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {donations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No donations found</TableCell>
                    </TableRow>
                  ) : (
                    donations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell>{new Date(donation.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>₹{donation.amount}</TableCell>
                        <TableCell>{donation.description}</TableCell>
                        <TableCell>{donation.payment_method}</TableCell>
                        <TableCell>{donation.reference_number || '-'}</TableCell>
                        <TableCell>
                          <Typography
                            color={
                              donation.status === 'verified'
                                ? 'success.main'
                                : donation.status === 'rejected'
                                ? 'error.main'
                                : 'warning.main'
                            }
                          >
                            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                          </Typography>
                        </TableCell>
                        <TableCell>{donation.verified_by || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {renderDonateDialog()}
      {renderDetailDialog()}
    </Container>
  );
};

export default MemberDashboard;
