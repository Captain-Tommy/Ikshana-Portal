import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  Tooltip,
  FormHelperText,
  Stack,
  Chip
} from '@mui/material';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [spendings, setSpendings] = useState([]);
  const [spendingStats, setSpendingStats] = useState({
    totalSpent: 0,
    categoryTotals: {}
  });
  const [donationStats, setDonationStats] = useState({
    totalDonated: 0,
    totalPending: 0,
    verifiedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    userTotals: {},
    monthlyTotals: {}
  });
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState('');
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openSpendingDialog, setOpenSpendingDialog] = useState(false);
  const [spendingForm, setSpendingForm] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    reference_number: ''
  });
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingDonation, setEditingDonation] = useState(null);
  const [editingSpending, setEditingSpending] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchAnnouncements();
    fetchEvents();
    fetchData();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched users:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
      setError('Failed to fetch users');
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch donations with statistics
      const donationsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/donations/all`,
        config
      );
      setDonations(donationsResponse.data.donations);
      setDonationStats(donationsResponse.data.statistics);

      // Fetch spendings and statistics
      const spendingsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/spending`,
        config
      );
      setSpendings(spendingsResponse.data.spending || []);
      setSpendingStats({
        totalSpent: spendingsResponse.data.statistics?.totalSpent || 0,
        categoryTotals: spendingsResponse.data.statistics?.categoryTotals || {}
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Failed to fetch data');
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/announcements`,
        config
      );
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError(error.response?.data?.message || 'Failed to fetch announcements');
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/events`,
        config
      );
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.response?.data?.message || 'Failed to fetch events');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDialogOpen = (dialogType) => {
    setOpenDialog(dialogType);
    setFormData({});
    setError('');
  };

  const handleDialogClose = () => {
    setOpenDialog('');
    setFormData({});
    setEditAnnouncement(null);
    setEditEvent(null);
    setEditingUser(null);
    setEditingDonation(null);
    setEditingSpending(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed - name: ${name}, value: ${value}`);
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      console.log('Updated form data:', updated);
      return updated;
    });
  };

  const isAttendanceFormValid = () => {
    console.log('Checking attendance form validity:', formData);
    return formData.user_id && formData.date && formData.status;
  };

  const isEventFormValid = () => {
    console.log('Checking event form validity:', formData);
    return (
      formData.title?.trim() &&
      formData.description?.trim() &&
      formData.date &&
      formData.time &&
      formData.location?.trim()
    );
  };

  const handleSubmit = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      let response;
      if (editAnnouncement) {
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/admin/announcements/${editAnnouncement.id}`,
          {
            ...formData,
            core_members: formData.visibility === 'core' ? formData.core_members : []
          },
          config
        );
        setAnnouncements(prev => 
          prev.map(a => a.id === editAnnouncement.id ? response.data : a)
        );
        setSuccessMessage('Announcement updated successfully');
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/admin/announcements`,
          {
            ...formData,
            core_members: formData.visibility === 'core' ? formData.core_members : []
          },
          config
        );
        setAnnouncements(prev => [response.data, ...prev]);
        setSuccessMessage('Announcement created successfully');
      }

      handleDialogClose();
    } catch (err) {
      console.error('Error submitting announcement:', err);
      setError(err.response?.data?.message || 'Failed to save announcement');
    }
  };

  const handleVerifyDonation = async (id, newStatus) => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/donations/${id}/verify`,
        { status: newStatus },
        config
      );

      setDonations(prev => prev.map(d => d.id === id ? response.data : d));
      setSuccessMessage(`Donation ${newStatus === 'verified' ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      console.error('Error verifying donation:', err);
      setError(err.response?.data?.message || 'Failed to update donation status');
    }
  };

  const handleInitEditSpending = (spending) => {
    setSpendingForm({
      amount: spending.amount.toString(),
      description: spending.description,
      category: spending.category,
      date: spending.date,
      reference_number: spending.reference_number || ''
    });
    setEditingSpending(spending.id);
    setOpenDialog('spending');
  };

  const handleSubmitSpending = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const spendingData = {
        amount: Number(spendingForm.amount),
        description: spendingForm.description.trim(),
        category: spendingForm.category.trim(),
        date: spendingForm.date,
        reference_number: spendingForm.reference_number?.trim() || ''
      };

      if (editingSpending) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/admin/spending/${editingSpending}`,
          spendingData,
          config
        );
        setSuccessMessage('Spending updated successfully');
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/admin/spending`,
          spendingData,
          config
        );
        setSuccessMessage('Spending added successfully');
      }

      setOpenDialog('');
      setSpendingForm({
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        reference_number: ''
      });
      setEditingSpending(null);
      await fetchData(); // Refresh data after adding/editing
    } catch (error) {
      console.error('Error handling spending:', error);
      setError(error.response?.data?.message || 'Failed to handle spending');
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      visibility: announcement.visibility || 'all',
      core_members: announcement.core_members || []
    });
    setOpenDialog('announcement');
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      if (!window.confirm('Are you sure you want to delete this announcement?')) {
        return;
      }

      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/announcements/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      setSuccessMessage('Announcement deleted successfully');
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setError(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const handleCreateEvent = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      location: ''
    });
    setEditEvent(null);
    setOpenDialog('event');
  };

  const handleEditEvent = (event) => {
    setEditEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location
    });
    setOpenDialog('event');
  };

  const handleDeleteEvent = async (id) => {
    try {
      if (!window.confirm('Are you sure you want to delete this event?')) {
        return;
      }

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/admin/events/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      setEvents(prev => prev.filter(e => e.id !== id));
      setSuccessMessage('Event deleted successfully');
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleEventSubmit = async () => {
    try {
      setError('');
      let response;

      if (editEvent) {
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/admin/events/${editEvent.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        setEvents(prev => 
          prev.map(e => e.id === editEvent.id ? response.data : e)
        );
        setSuccessMessage('Event updated successfully');
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/admin/events`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        setEvents(prev => [response.data, ...prev]);
        setSuccessMessage('Event created successfully');
      }

      handleDialogClose();
    } catch (err) {
      console.error('Error submitting event:', err);
      setError(err.response?.data?.message || 'Failed to save event');
    }
  };

  const handleEditUser = (user) => {
    setFormData({
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    });
    setEditingUser(user);
    setOpenDialog('user');
  };

  const handleDeleteUser = async (id) => {
    try {
      if (!window.confirm('Are you sure you want to delete this user?')) {
        return;
      }

      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/admin/users/${id}`,
        config
      );

      setUsers(prev => prev.filter(u => u.id !== id));
      setSuccessMessage('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleUserSubmit = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      let response;
      if (editingUser) {
        // Update existing user
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/admin/users/${editingUser.id}`,
          formData,
          config
        );
        setUsers(prev => prev.map(user => user.id === editingUser.id ? response.data : user));
        setSuccessMessage('User updated successfully');
      } else {
        // Create new user
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/admin/users`,
          {
            ...formData,
            password: formData.password || 'ikshana123' // Default password if not provided
          },
          config
        );
        setUsers(prev => [response.data, ...prev]);
        setSuccessMessage('User created successfully');
      }

      handleDialogClose();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleEditDonation = (donation) => {
    setFormData({
      amount: donation.amount,
      reference_number: donation.reference_number,
      status: donation.status,
      notes: donation.notes,
      username: donation.created_by
    });
    setEditingDonation(donation);
    setOpenDialog('donation');
  };

  const handleDeleteDonation = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/admin/donations/${id}`,
        config
      );

      setDonations(prev => prev.filter(d => d.id !== id));
      setSuccessMessage('Donation deleted successfully');
    } catch (error) {
      console.error('Error deleting donation:', error);
      setError(error.response?.data?.message || 'Failed to delete donation');
    }
  };

  const handleCreateDonation = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/donations`,
        {
          ...formData,
          username: formData.username || 'Unknown'  // Add username of donation maker
        },
        config
      );

      setDonations(prev => [response.data, ...prev]);
      handleDialogClose();
      setSuccessMessage('Donation created successfully');
    } catch (error) {
      console.error('Error creating donation:', error);
      setError(error.response?.data?.message || 'Failed to create donation');
    }
  };

  const handleUpdateDonation = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/donations/${editingDonation.id}`,
        formData,
        config
      );

      setDonations(prev => prev.map(d => d.id === editingDonation.id ? response.data : d));
      handleDialogClose();
      setSuccessMessage('Donation updated successfully');
    } catch (error) {
      console.error('Error updating donation:', error);
      setError(error.response?.data?.message || 'Failed to update donation');
    }
  };

  const isDonationFormValid = () => {
    return (
      formData.amount > 0 &&
      formData.reference_number?.trim() &&
      formData.status &&
      formData.username?.trim()
    );
  };

  const handleEditSpending = (spending) => {
    handleInitEditSpending(spending);
  };

  const handleDeleteSpending = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/admin/spending/${id}`,
        config
      );
      
      setSpendings(prev => prev.filter(s => s.id !== id));
      setSuccessMessage('Spending record deleted successfully');
    } catch (err) {
      console.error('Error deleting spending:', err);
      setError(err.response?.data?.message || 'Failed to delete spending record');
    }
  };

  const isSpendingFormValid = () => {
    return (
      spendingForm.amount > 0 &&
      spendingForm.description?.trim() &&
      spendingForm.category &&
      spendingForm.date
    );
  };

  const isUserFormValid = () => {
    return (
      formData.username?.trim() &&
      formData.full_name?.trim() &&
      formData.email?.trim() &&
      formData.role &&
      (!formData.password || formData.password.length >= 6)
    );
  };

  const isAnnouncementFormValid = () => {
    return (
      formData.title?.trim() &&
      formData.content?.trim() &&
      formData.visibility
    );
  };

  const renderCreateAnnouncementDialog = () => {
    return (
      <Dialog open={openDialog === 'announcement'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            required
            value={formData.title || ''}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="content"
            label="Content"
            type="text"
            fullWidth
            multiline
            rows={4}
            required
            value={formData.content || ''}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Visibility</InputLabel>
            <Select
              name="visibility"
              value={formData.visibility || 'all'}
              onChange={handleInputChange}
              required
            >
              <MenuItem value="all">Everyone</MenuItem>
              <MenuItem value="core">Core Committee Only</MenuItem>
            </Select>
          </FormControl>
          {formData.visibility === 'core' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Core Committee Members</InputLabel>
              <Select
                name="core_members"
                multiple
                value={formData.core_members || []}
                onChange={handleInputChange}
                required
                renderValue={(selected) => selected.join(', ')}
              >
                {users
                  .filter(user => user.role === 'member')
                  .map(user => (
                    <MenuItem key={user.username} value={user.username}>
                      <Checkbox checked={(formData.core_members || []).indexOf(user.username) > -1} />
                      <ListItemText primary={`${user.full_name} (${user.username})`} />
                    </MenuItem>
                  ))
                }
              </Select>
              <FormHelperText>Select members who can see this announcement</FormHelperText>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained" 
            color="primary"
            disabled={!isAnnouncementFormValid()}
          >
            {editAnnouncement ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderCreateDonationDialog = () => {
    return (
      <Dialog open={openDialog === 'donation'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingDonation ? 'Edit Donation' : 'Create Donation'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username || ''}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Reference Number"
              value={formData.reference_number || ''}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status || ''}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={4}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={editingDonation ? handleUpdateDonation : handleCreateDonation}
            disabled={!isDonationFormValid()}
            variant="contained" 
            color="primary"
          >
            {editingDonation ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderSpendingDialog = () => (
    <Dialog open={openDialog === 'spending'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingSpending ? 'Edit Spending' : 'Add Spending'}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          name="amount"
          label="Amount"
          type="number"
          fullWidth
          required
          value={spendingForm.amount}
          onChange={(e) => setSpendingForm(prev => ({ ...prev, amount: e.target.value }))}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="description"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={3}
          required
          value={spendingForm.description}
          onChange={(e) => setSpendingForm(prev => ({ ...prev, description: e.target.value }))}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={spendingForm.category}
            onChange={(e) => setSpendingForm(prev => ({ ...prev, category: e.target.value }))}
            required
          >
            <MenuItem value="Food">Food</MenuItem>
            <MenuItem value="Transportation">Transportation</MenuItem>
            <MenuItem value="Supplies">Supplies</MenuItem>
            <MenuItem value="Equipment">Equipment</MenuItem>
            <MenuItem value="Maintenance">Maintenance</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          name="date"
          label="Date"
          type="date"
          fullWidth
          required
          value={spendingForm.date}
          onChange={(e) => setSpendingForm(prev => ({ ...prev, date: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="reference_number"
          label="Reference Number"
          type="text"
          fullWidth
          value={spendingForm.reference_number}
          onChange={(e) => setSpendingForm(prev => ({ ...prev, reference_number: e.target.value }))}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button 
          onClick={handleSubmitSpending}
          variant="contained" 
          color="primary"
          disabled={!isSpendingFormValid()}
        >
          {editingSpending ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderAnnouncements = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Content</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Visibility</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {announcements.map((announcement) => (
            <TableRow key={announcement.id}>
              <TableCell>{announcement.title}</TableCell>
              <TableCell>{announcement.content}</TableCell>
              <TableCell>{announcement.created_by}</TableCell>
              <TableCell>
                {new Date(announcement.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </TableCell>
              <TableCell>
                {(announcement.visibility || 'all') === 'all' ? 'Everyone' : (
                  <Tooltip title={`Visible to: ${(announcement.core_members || []).join(', ')}`}>
                    <span>Core Committee ({(announcement.core_members || []).length})</span>
                  </Tooltip>
                )}
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEditAnnouncement(announcement)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {announcements.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">No announcements found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderEventDialog = () => {
    return (
      <Dialog open={openDialog === 'event'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            required
            value={formData.title || ''}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            required
            value={formData.description || ''}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="date"
            label="Date"
            type="date"
            fullWidth
            required
            value={formData.date || ''}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="time"
            label="Time"
            type="time"
            fullWidth
            required
            value={formData.time || ''}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="location"
            label="Location"
            type="text"
            fullWidth
            required
            value={formData.location || ''}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleEventSubmit}
            variant="contained" 
            color="primary"
            disabled={!formData.title || !formData.description || !formData.date || !formData.time || !formData.location}
          >
            {editEvent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderEvents = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.title}</TableCell>
              <TableCell>{event.description}</TableCell>
              <TableCell>
                {new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </TableCell>
              <TableCell>{event.time}</TableCell>
              <TableCell>{event.location}</TableCell>
              <TableCell>{event.created_by}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEditEvent(event)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {events.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">No events found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderUsers = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Full Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setFormData({
                        username: user.username,
                        full_name: user.full_name,
                        email: user.email,
                        role: user.role
                      });
                      setEditingUser(user);
                      setOpenDialog('user');
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">No users found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderDonations = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Amount</TableCell>
            <TableCell>Reference Number</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Donor</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {donations.map((donation) => (
            <TableRow key={donation.id}>
              <TableCell>₹{donation.amount}</TableCell>
              <TableCell>{donation.reference_number}</TableCell>
              <TableCell>
                <Chip 
                  label={donation.status} 
                  color={
                    donation.status === 'verified' ? 'success' : 
                    donation.status === 'rejected' ? 'error' : 
                    'warning'
                  }
                />
              </TableCell>
              <TableCell>{donation.created_by}</TableCell>
              <TableCell>{new Date(donation.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{donation.notes}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  {donation.status === 'pending' && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleVerifyDonation(donation.id, 'verified')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleVerifyDonation(donation.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {donation.status !== 'pending' && (
                    <>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleEditDonation(donation)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteDonation(donation.id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderSpending = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Reference Number</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {spendings.map((spend) => (
            <TableRow key={spend.id}>
              <TableCell>
                {new Date(spend.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </TableCell>
              <TableCell>₹{spend.amount.toLocaleString()}</TableCell>
              <TableCell>{spend.description}</TableCell>
              <TableCell>{spend.category}</TableCell>
              <TableCell>{spend.reference_number || '-'}</TableCell>
              <TableCell>{spend.created_by}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleInitEditSpending(spend)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteSpending(spend.id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {spendings.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">No spending records found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const handleCreateAnnouncement = () => {
    setFormData({
      title: '',
      content: '',
      visibility: 'all',
      core_members: []
    });
    setEditAnnouncement(null);
    setOpenDialog('announcement');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Financial Overview */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>Financial Overview</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
              <Typography variant="h6">Total Donations</Typography>
              <Typography variant="h4">₹{donationStats.totalDonated}</Typography>
              <Typography variant="body2">({donationStats.verifiedCount} verified donations)</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'white' }}>
              <Typography variant="h6">Pending Donations</Typography>
              <Typography variant="h4">₹{donationStats.totalPending}</Typography>
              <Typography variant="body2">({donationStats.pendingCount} pending donations)</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'white' }}>
              <Typography variant="h6">Total Expenses</Typography>
              <Typography variant="h4">₹{spendingStats.totalSpent}</Typography>
              <Typography variant="body2">Balance: ₹{donationStats.totalDonated - spendingStats.totalSpent}</Typography>
            </Paper>
          </Grid>

          {/* Monthly Donation Trends */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Monthly Donation Trends</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Total Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(donationStats.monthlyTotals)
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .map(([month, amount]) => (
                        <TableRow key={month}>
                          <TableCell>{new Date(month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</TableCell>
                          <TableCell align="right">₹{amount}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Spending Categories Summary */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Spending Summary</Typography>
                <Typography variant="h6" color="primary">
                  Total Spent: ₹{(spendingStats?.totalSpent || 0).toLocaleString()}
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Total Amount</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(spendingStats?.categoryTotals || {}).map(([category, amount]) => (
                      <TableRow key={category}>
                        <TableCell>{category}</TableCell>
                        <TableCell align="right">₹{amount.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          {((amount / (spendingStats?.totalSpent || 1)) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                    {Object.keys(spendingStats?.categoryTotals || {}).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No spending records found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Users</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setFormData({
                      username: '',
                      full_name: '',
                      email: '',
                      role: 'member'
                    });
                    setEditingUser(null);
                    setOpenDialog('user');
                  }}
                >
                  Add User
                </Button>
              </Box>
              {renderUsers()}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Events</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateEvent}
                >
                  Create Event
                </Button>
              </Box>
              {renderEvents()}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Announcements</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateAnnouncement}
                >
                  Create Announcement
                </Button>
              </Box>
              {renderAnnouncements()}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Donations</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setFormData({
                      amount: '',
                      reference_number: '',
                      status: 'pending',
                      notes: ''
                    });
                    setEditingDonation(null);
                    setOpenDialog('donation');
                  }}
                >
                  Add Donation
                </Button>
              </Box>
              {renderDonations()}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Spending Records</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setSpendingForm({
                      amount: '',
                      description: '',
                      category: '',
                      date: new Date().toISOString().split('T')[0],
                      reference_number: ''
                    });
                    setEditingSpending(null);
                    setOpenDialog('spending');
                  }}
                >
                  Add Spending
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Reference Number</TableCell>
                      <TableCell>Created By</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {spendings.map((spend) => (
                      <TableRow key={spend.id}>
                        <TableCell>
                          {new Date(spend.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>₹{spend.amount.toLocaleString()}</TableCell>
                        <TableCell>{spend.description}</TableCell>
                        <TableCell>{spend.category}</TableCell>
                        <TableCell>{spend.reference_number || '-'}</TableCell>
                        <TableCell>{spend.created_by}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => handleInitEditSpending(spend)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => handleDeleteSpending(spend.id)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    {spendings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">No spending records found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {renderEventDialog()}
      {renderCreateAnnouncementDialog()}
      {renderCreateDonationDialog()}
      {renderSpendingDialog()}

      <Dialog open={openDialog === 'user'} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="username"
            label="Username"
            type="text"
            fullWidth
            required
            value={formData.username || ''}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="full_name"
            label="Full Name"
            type="text"
            fullWidth
            required
            value={formData.full_name || ''}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            required
            value={formData.email || ''}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role || 'member'}
              onChange={handleInputChange}
              required
            >
              <MenuItem value="member">Member</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          {!editingUser && (
            <TextField
              margin="dense"
              name="password"
              label="Password"
              type="password"
              fullWidth
              required
              value={formData.password || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleUserSubmit}
            variant="contained" 
            color="primary"
            disabled={!isUserFormValid()}
          >
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Box>
  );
};

export default AdminDashboard;
