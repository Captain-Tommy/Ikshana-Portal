import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Avatar,
  IconButton,
  Switch,
  FormControlLabel,
  Chip,
  Fab,
  Card,
  CardContent,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Drawer
} from '@mui/material';
import {
  Close as CloseIcon,
  Home as HomeIcon,
  Event as EventIcon,
  Announcement as AnnouncementIcon,
  HowToReg as HowToRegIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import axios from 'axios';
import upiQRCode from '../images/upi-qr.png';  // Import QR code image

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
  const [activeSection, setActiveSection] = useState('dashboard');
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f0f7ff',
      background: 'linear-gradient(135deg, #f0f7ff 0%, #e3f2ff 100%)',
    },
    sidebar: {
      width: '240px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.3)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      overflowY: 'auto',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      zIndex: 1000,
    },
    sidebarItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      borderRadius: '12px',
      marginBottom: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: '#1a237e',
      '&:hover': {
        backgroundColor: 'rgba(26, 35, 126, 0.05)',
        transform: 'translateX(5px)',
      },
    },
    mainContent: {
      marginLeft: '260px', // Increased margin to create buffer
      flex: 1,
      padding: '24px 32px', // Increased left padding
      width: 'calc(100% - 260px)', // Adjusted to account for new margin
      boxSizing: 'border-box',
    },
    header: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    section: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.05)',
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
      },
    },
    statCard: {
      padding: '24px',
      borderRadius: '16px',
      color: 'white',
      backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
    },
    table: {
      '& .MuiTableCell-root': {
        borderColor: 'rgba(224, 224, 224, 0.4)',
      },
      '& .MuiTableRow-root:nth-of-type(odd)': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      },
      '& .MuiTableRow-root:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
    fab: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: '#2e7d32',  // Green color for donation
      color: 'white',
      '&:hover': {
        backgroundColor: '#1b5e20',
      },
    },
    userProfile: {
      marginTop: 'auto',
      padding: '16px',
      borderTop: '1px solid rgba(255, 255, 255, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      position: 'sticky',
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    profilePicture: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: '2px solid #1a237e',
    },
  };

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

  const handleProfileClick = () => {
    setProfileDrawerOpen(true);
    setEditedProfile({ ...profile });
  };

  const handleProfileEdit = () => {
    setEditMode(true);
  };

  const handleProfileSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/profile`,
        editedProfile,
        config
      );

      setProfile(editedProfile);
      setEditMode(false);
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileCancel = () => {
    setEditMode(false);
    setEditedProfile({ ...profile });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
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

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            {/* Stats Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Donations Stats */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ ...styles.statCard, background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)' }}>
                  <Typography variant="subtitle1" gutterBottom>Total Donated</Typography>
                  <Typography variant="h4">₹{donationStats.totalDonated}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ ...styles.statCard, background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)' }}>
                  <Typography variant="subtitle1" gutterBottom>Verified Donations</Typography>
                  <Typography variant="h4">{donationStats.verifiedDonations}</Typography>
                </Paper>
              </Grid>

              {/* Events & Announcements Stats */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ ...styles.statCard, background: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)' }}>
                  <Typography variant="subtitle1" gutterBottom>Upcoming Events</Typography>
                  <Typography variant="h4">{events.filter(e => new Date(e.date) >= new Date()).length}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ ...styles.statCard, background: 'linear-gradient(135deg, #c2185b 0%, #e91e63 100%)' }}>
                  <Typography variant="subtitle1" gutterBottom>Recent Announcements</Typography>
                  <Typography variant="h4">{announcements.length}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Recent Activity Section */}
            <Grid container spacing={3}>
              {/* Recent Events */}
              <Grid item xs={12} md={6}>
                <Paper sx={styles.section}>
                  <Typography variant="h6" gutterBottom>Recent Event</Typography>
                  <List>
                    {events.slice(0, 1).map((event) => (
                      <ListItem 
                        key={event.id} 
                        sx={{ 
                          cursor: 'pointer',
                          borderRadius: 1,
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                          }
                        }} 
                        onClick={() => handleItemClick(event, 'event')}
                      >
                        <ListItemText
                          primary={<Typography variant="subtitle1">{event.title}</Typography>}
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {new Date(event.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button color="primary" onClick={() => setActiveSection('events')}>View All Events</Button>
                </Paper>
              </Grid>

              {/* Recent Announcements */}
              <Grid item xs={12} md={6}>
                <Paper sx={styles.section}>
                  <Typography variant="h6" gutterBottom>Recent Announcement</Typography>
                  <List>
                    {announcements.slice(0, 1).map((announcement) => (
                      <ListItem 
                        key={announcement.id} 
                        sx={{ 
                          cursor: 'pointer',
                          borderRadius: 1,
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                          }
                        }} 
                        onClick={() => handleItemClick(announcement, 'announcement')}
                      >
                        <ListItemText
                          primary={<Typography variant="subtitle1">{announcement.title}</Typography>}
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {new Date(announcement.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button color="primary" onClick={() => setActiveSection('announcements')}>View All Announcements</Button>
                </Paper>
              </Grid>
            </Grid>
          </>
        );

      case 'events':
        return (
          <Box sx={styles.section}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Events</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={showPastEvents}
                    onChange={(e) => setShowPastEvents(e.target.checked)}
                  />
                }
                label={showPastEvents ? "Show Upcoming Events" : "Show Past Events"}
              />
            </Box>
            <Grid container spacing={3}>
              {events
                .filter(event => {
                  const eventDate = new Date(event.date);
                  const now = new Date();
                  return showPastEvents ? eventDate < now : eventDate >= now;
                })
                .map((event) => (
                  <Grid item xs={12} sm={6} md={4} key={event.id}>
                    <Card sx={styles.card} onClick={() => handleItemClick(event, 'event')}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>{event.title}</Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {event.description}
                        </Typography>
                        <Typography variant="subtitle2">
                          Date: {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                        {event.time && (
                          <Typography variant="subtitle2">Time: {event.time}</Typography>
                        )}
                        {event.location && (
                          <Typography variant="subtitle2">Location: {event.location}</Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        );

      case 'announcements':
        return (
          <Box sx={styles.section}>
            <Typography variant="h6" gutterBottom>Announcements</Typography>
            <Grid container spacing={3}>
              {announcements.map((announcement) => (
                <Grid item xs={12} sm={6} md={4} key={announcement.id}>
                  <Card sx={styles.card} onClick={() => handleItemClick(announcement, 'announcement')}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{announcement.title}</Typography>
                      <Typography variant="body2" paragraph>{announcement.content}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Posted on: {new Date(announcement.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 'attendance':
        return (
          <Box sx={styles.section}>
            <Typography variant="h6" gutterBottom>Attendance Records</Typography>
            <TableContainer>
              <Table sx={styles.table}>
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
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={record.status === 'present' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{record.marked_by_name || 'System'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );

      case 'donations':
        return (
          <Box sx={styles.section}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Donations</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<MonetizationOnIcon />}
                onClick={handleDonateClick}
              >
                Make Donation
              </Button>
            </Box>
            <TableContainer>
              <Table sx={styles.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Reference Number</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>{new Date(donation.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>₹{donation.amount}</TableCell>
                      <TableCell>{donation.description}</TableCell>
                      <TableCell>{donation.payment_method}</TableCell>
                      <TableCell>{donation.reference_number || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                          color={
                            donation.status === 'verified'
                              ? 'success'
                              : donation.status === 'rejected'
                              ? 'error'
                              : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );

      default:
        return null;
    }
  };

  const renderDonateDialog = () => (
    <Dialog open={openDonateDialog} onClose={() => setOpenDonateDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Make a Donation</Typography>
          <IconButton onClick={() => setOpenDonateDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Payment Details Section */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Bank Details
              </Typography>
              <Typography variant="body2" component="div" sx={{ mb: 2 }}>
                Account Name: Ikshana Foundation<br />
                Account Number: 1234567890<br />
                IFSC Code: SBIN0123456<br />
                Bank: State Bank of India<br />
                Branch: Hyderabad Main Branch
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                UPI QR Code
              </Typography>
              <Box
                component="img"
                src={upiQRCode}
                alt="UPI QR Code"
                sx={{
                  width: '200px',
                  height: '200px',
                  mb: 1,
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  p: 1,
                  objectFit: 'contain',
                  backgroundColor: '#fff'
                }}
                onError={(e) => {
                  console.error('Failed to load UPI QR code');
                  e.target.style.display = 'none';
                }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                UPI ID: ikshana@upi
              </Typography>
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

  const renderProfileDrawer = () => (
    <Drawer
      anchor="right"
      open={profileDrawerOpen}
      onClose={() => {
        setProfileDrawerOpen(false);
        setEditMode(false);
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: '400px',
          padding: '24px',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Profile Details</Typography>
          <Box>
            {editMode ? (
              <>
                <Button variant="outlined" onClick={handleProfileCancel} sx={{ mr: 1 }}>
                  Cancel
                </Button>
                <Button variant="contained" color="primary" onClick={handleProfileSave}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button variant="contained" color="primary" onClick={handleProfileEdit}>
                Edit Profile
              </Button>
            )}
            <IconButton onClick={() => setProfileDrawerOpen(false)} sx={{ ml: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {/* Profile Picture */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar
              src={profile.profile_picture}
              alt={profile.full_name}
              sx={{ width: 120, height: 120 }}
            />
          </Box>

          {/* ID Number - Read Only */}
          <TextField
            label="ID Number"
            value={profile.ikshana_id || ''}
            disabled
            fullWidth
          />

          {/* Full Name */}
          <TextField
            label="Full Name"
            name="full_name"
            value={editMode ? editedProfile.full_name || '' : profile.full_name || ''}
            onChange={handleProfileChange}
            disabled={true}
            fullWidth
          />

          {/* Date of Birth */}
          <TextField
            label="Date of Birth"
            name="dob"
            type="date"
            value={editMode ? editedProfile.dob || '' : profile.dob || ''}
            onChange={handleProfileChange}
            disabled={!editMode}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* College Roll Number */}
          <TextField
            label="College Roll Number"
            name="college_roll_number"
            value={editMode ? editedProfile.college_roll_number || '' : profile.college_roll_number || ''}
            onChange={handleProfileChange}
            disabled={true}
            fullWidth
          />

          {/* Department */}
          <TextField
            label="Department"
            name="department"
            value={editMode ? editedProfile.department || '' : profile.department || ''}
            onChange={handleProfileChange}
            disabled={!editMode}
            fullWidth
          />

          {/* Section */}
          <TextField
            label="Section"
            name="section"
            value={editMode ? editedProfile.section || '' : profile.section || ''}
            onChange={handleProfileChange}
            disabled={!editMode}
            fullWidth
          />

          {/* Designation */}
          <TextField
            label="Designation"
            name="designation"
            value={editMode ? editedProfile.designation || '' : profile.designation || ''}
            onChange={handleProfileChange}
            disabled={true} // Changed from !editMode to true to make it always disabled
            fullWidth
          />
        </Box>

        {/* Remove the bottom action buttons since they're now in the header */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        </Box>
      </Box>
    </Drawer>
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
    <Box sx={styles.container}>
      {/* Sidebar */}
      <Box sx={styles.sidebar}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            component="img"
            src="/images/favicon.ico"
            alt="Ikshana Logo"
            sx={{
              width: '32px',
              height: '32px',
              mr: 2
            }}
          />
          <Typography variant="h6" sx={{ color: '#1a237e' }}>
            Ikshana Portal
          </Typography>
        </Box>

        {/* Navigation Items */}
        <Box
          sx={{
            ...styles.sidebarItem,
            backgroundColor: activeSection === 'dashboard' ? 'rgba(26, 35, 126, 0.1)' : 'transparent',
          }}
          onClick={() => setActiveSection('dashboard')}
        >
          <HomeIcon sx={{ mr: 2 }} />
          <Typography>Dashboard</Typography>
        </Box>
        <Box
          sx={{
            ...styles.sidebarItem,
            backgroundColor: activeSection === 'events' ? 'rgba(26, 35, 126, 0.1)' : 'transparent',
          }}
          onClick={() => setActiveSection('events')}
        >
          <EventIcon sx={{ mr: 2 }} />
          <Typography>Events</Typography>
        </Box>
        <Box
          sx={{
            ...styles.sidebarItem,
            backgroundColor: activeSection === 'announcements' ? 'rgba(26, 35, 126, 0.1)' : 'transparent',
          }}
          onClick={() => setActiveSection('announcements')}
        >
          <AnnouncementIcon sx={{ mr: 2 }} />
          <Typography>Announcements</Typography>
        </Box>
        <Box
          sx={{
            ...styles.sidebarItem,
            backgroundColor: activeSection === 'attendance' ? 'rgba(26, 35, 126, 0.1)' : 'transparent',
          }}
          onClick={() => setActiveSection('attendance')}
        >
          <HowToRegIcon sx={{ mr: 2 }} />
          <Typography>Attendance</Typography>
        </Box>
        <Box
          sx={{
            ...styles.sidebarItem,
            backgroundColor: activeSection === 'donations' ? 'rgba(26, 35, 126, 0.1)' : 'transparent',
          }}
          onClick={() => setActiveSection('donations')}
        >
          <MonetizationOnIcon sx={{ mr: 2 }} />
          <Typography>Donations</Typography>
        </Box>

        {/* User Profile Section */}
        <Box 
          sx={{ 
            ...styles.userProfile,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(26, 35, 126, 0.05)',
            }
          }}
          onClick={handleProfileClick}
        >
          <Avatar
            src={profile.profile_picture}
            alt={profile.full_name}
            sx={styles.profilePicture}
          />
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#1a237e' }}>
              {profile.full_name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#1a237e' }}>
              {profile.ikshana_id}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={styles.mainContent}>
        {/* Header */}
        <Box sx={styles.header}>
          <Typography variant="h5" sx={{ color: '#1a237e' }}>
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        {/* Dynamic Section Content */}
        {renderSectionContent()}
      </Box>

      {/* Dialogs */}
      {renderDetailDialog()}
      {renderDonateDialog()}
      {renderProfileDrawer()}

      {/* Add Floating Donation Button */}
      <Fab 
        color="primary" 
        sx={styles.fab}
        onClick={handleDonateClick}
        aria-label="donate"
      >
        <MonetizationOnIcon />
      </Fab>
    </Box>
  );
};

export default MemberDashboard;
