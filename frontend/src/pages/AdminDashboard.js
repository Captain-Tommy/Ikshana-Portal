import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
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
  Chip,
  Menu,
  IconButton,
  Card,
  CardContent,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText as MuiListItemText
} from '@mui/material';
import {
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  MonetizationOn as MonetizationOnIcon,
  Event as EventIcon,
  Announcement as AnnouncementIcon,
  Receipt as ReceiptIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [openDateRangeDialog, setOpenDateRangeDialog] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');

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
      marginLeft: '260px',
      flex: 1,
      padding: '24px 32px',
      width: 'calc(100% - 260px)',
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
  };

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
      role: user.role,
      ikshana_id: user.ikshana_id,
      department: user.department,
      section: user.section,
      dob: user.dob,
      college_roll_number: user.college_roll_number
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
    const requiredFields = [
      'username',
      'full_name',
      'email',
      'role',
      'ikshana_id',
      'department',
      'section',
      'dob',
      'college_roll_number'
    ];
    
    if (!editingUser) {
      requiredFields.push('password');
    }

    return requiredFields.every(field => formData[field] && formData[field].trim() !== '');
  };

  const isAnnouncementFormValid = () => {
    return (
      formData.title?.trim() &&
      formData.content?.trim() &&
      formData.visibility
    );
  };

  const handleGenerateReport = (reportType) => {
    setSelectedReportType(reportType);
    setDateRange({ start: '', end: '' });
    setOpenDateRangeDialog(true);
  };

  const handleDateRangeSubmit = () => {
    if (selectedReportType === 'donations') {
      generateDonationsPDF(dateRange);
    } else {
      generateSpendingsPDF(dateRange);
    }
    setOpenDateRangeDialog(false);
  };

  const generateDonationsPDF = (dateRange) => {
    setDownloadingReport(true);
    try {
      const doc = new jsPDF();
      
      // Filter donations based on date range
      const filteredDonations = donations.filter(donation => {
        const donationDate = new Date(donation.created_at);
        return donationDate >= new Date(dateRange.start) && donationDate <= new Date(dateRange.end);
      });

      // Calculate filtered statistics
      const filteredStats = {
        totalDonated: filteredDonations.reduce((sum, d) => sum + d.amount, 0),
        verifiedCount: filteredDonations.filter(d => d.status === 'verified').length,
        pendingCount: filteredDonations.filter(d => d.status === 'pending').length
      };
      
      // Add title
      doc.setFontSize(20);
      doc.text('Ikshana Foundation - Donations Report', 14, 22);
      doc.setFontSize(12);
      doc.text(`Period: ${new Date(dateRange.start).toLocaleDateString()} to ${new Date(dateRange.end).toLocaleDateString()}`, 14, 32);

      // Add statistics
      doc.setFontSize(14);
      doc.text('Donation Statistics', 14, 45);
      doc.setFontSize(12);
      const stats = [
        ['Total Donations:', `₹${filteredStats.totalDonated}`],
        ['Verified Donations:', filteredStats.verifiedCount],
        ['Pending Donations:', filteredStats.pendingCount],
        ['Average Donation:', `₹${(filteredStats.totalDonated / (filteredStats.verifiedCount + filteredStats.pendingCount) || 0).toFixed(2)}`]
      ];
      doc.autoTable({
        startY: 50,
        head: [['Metric', 'Value']],
        body: stats,
        theme: 'grid',
        headStyles: { fillColor: [63, 81, 181] }
      });

      // Add donations table
      if (filteredDonations.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Detailed Donations List', 14, 22);
        
        const donationsData = filteredDonations.map(donation => [
          new Date(donation.created_at).toLocaleDateString(),
          donation.user_name || 'N/A',
          `₹${donation.amount}`,
          donation.payment_method,
          donation.reference_number,
          donation.status,
          donation.description || 'N/A'
        ]);

        doc.autoTable({
          startY: 30,
          head: [['Date', 'Donor', 'Amount', 'Payment Method', 'Reference', 'Status', 'Description']],
          body: donationsData,
          theme: 'grid',
          headStyles: { fillColor: [63, 81, 181] },
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 25 },
            2: { cellWidth: 20 },
            3: { cellWidth: 25 },
            5: { cellWidth: 20 }
          }
        });
      }

      doc.save(`ikshana-donations-report-${dateRange.start}-to-${dateRange.end}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report');
    }
    setDownloadingReport(false);
    setDownloadMenuAnchor(null);
  };

  const generateSpendingsPDF = (dateRange) => {
    setDownloadingReport(true);
    try {
      const doc = new jsPDF();
      
      // Filter spendings based on date range
      const filteredSpendings = spendings.filter(spending => {
        const spendingDate = new Date(spending.date);
        return spendingDate >= new Date(dateRange.start) && spendingDate <= new Date(dateRange.end);
      });

      // Calculate filtered statistics
      const filteredStats = {
        totalSpent: filteredSpendings.reduce((sum, s) => sum + s.amount, 0),
        categoryTotals: filteredSpendings.reduce((acc, s) => {
          acc[s.category] = (acc[s.category] || 0) + s.amount;
          return acc;
        }, {})
      };
      
      // Add title
      doc.setFontSize(20);
      doc.text('Ikshana Foundation - Spendings Report', 14, 22);
      doc.setFontSize(12);
      doc.text(`Period: ${new Date(dateRange.start).toLocaleDateString()} to ${new Date(dateRange.end).toLocaleDateString()}`, 14, 32);

      // Add statistics
      doc.setFontSize(14);
      doc.text('Spending Statistics', 14, 45);
      doc.setFontSize(12);
      
      const categoryStats = Object.entries(filteredStats.categoryTotals).map(([category, amount]) => [
        category,
        `₹${amount}`
      ]);

      doc.autoTable({
        startY: 50,
        head: [['Category', 'Total Amount']],
        body: [
          ['Total Spent:', `₹${filteredStats.totalSpent}`],
          ...categoryStats
        ],
        theme: 'grid',
        headStyles: { fillColor: [63, 81, 181] }
      });

      // Add spendings table
      if (filteredSpendings.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Detailed Spendings List', 14, 22);
        
        const spendingsData = filteredSpendings.map(spending => [
          new Date(spending.date).toLocaleDateString(),
          spending.category,
          `₹${spending.amount}`,
          spending.description || 'N/A',
          spending.approved_by || 'N/A'
        ]);

        doc.autoTable({
          startY: 30,
          head: [['Date', 'Category', 'Amount', 'Description', 'Approved By']],
          body: spendingsData,
          theme: 'grid',
          headStyles: { fillColor: [63, 81, 181] },
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 25 },
            2: { cellWidth: 20 }
          }
        });
      }

      doc.save(`ikshana-spendings-report-${dateRange.start}-to-${dateRange.end}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report');
    }
    setDownloadingReport(false);
    setDownloadMenuAnchor(null);
  };

  const renderDashboardContent = () => (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#1a237e' }}>
        Admin Dashboard Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ ...styles.statCard, background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)' }}>
            <CardContent>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{users.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ ...styles.statCard, background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)' }}>
            <CardContent>
              <Typography variant="h6">Total Donations</Typography>
              <Typography variant="h4">{donationStats.totalDonated}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ ...styles.statCard, background: 'linear-gradient(135deg, #c62828 0%, #ef5350 100%)' }}>
            <CardContent>
              <Typography variant="h6">Total Spendings</Typography>
              <Typography variant="h4">{spendingStats.totalSpent}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ ...styles.statCard, background: 'linear-gradient(135deg, #f57c00 0%, #ffa726 100%)' }}>
            <CardContent>
              <Typography variant="h6">Pending Donations</Typography>
              <Typography variant="h4">{donationStats.pendingCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Recent Activities Section */}
      <Box sx={styles.section}>
        <Typography variant="h5" gutterBottom>Recent Activities</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={styles.card}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Latest Donations</Typography>
                <TableContainer>
                  <Table sx={styles.table} size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Donor</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {donations.slice(0, 2).map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell>{donation.user?.ikshana_id || 'Anonymous'}</TableCell>
                          <TableCell>₹{donation.amount}</TableCell>
                          <TableCell>
                            <Chip
                              label={donation.status}
                              color={donation.status === 'verified' ? 'success' : 
                                    donation.status === 'pending' ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{...styles.card, height: '100%'}}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Events</Typography>
                <TableContainer>
                  <Table sx={styles.table} size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Event</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {events.slice(0, 2).map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>{event.title}</TableCell>
                          <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Chip
                              label={new Date(event.date) > new Date() ? 'Upcoming' : 'Past'}
                              color={new Date(event.date) > new Date() ? 'primary' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

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
                        role: user.role,
                        ikshana_id: user.ikshana_id,
                        department: user.department,
                        section: user.section,
                        dob: user.dob,
                        college_roll_number: user.college_roll_number
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

  const renderDonationsSection = () => (
    <Box sx={styles.section}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Donations List</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={(e) => setDownloadMenuAnchor(e.currentTarget)}
          >
            Download Report
          </Button>
        </Stack>
      </Box>
      {renderDonations()}

      {/* Download Report Menu */}
      <Menu
        anchorEl={downloadMenuAnchor}
        open={Boolean(downloadMenuAnchor)}
        onClose={() => setDownloadMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleGenerateReport('donations')}>
          <PdfIcon sx={{ mr: 1 }} /> All Donations
        </MenuItem>
        <MenuItem onClick={() => {
          setSelectedReportType('date_range');
          setOpenDateRangeDialog(true);
          setDownloadMenuAnchor(null);
        }}>
          <PdfIcon sx={{ mr: 1 }} /> Custom Date Range
        </MenuItem>
      </Menu>

      {/* Date Range Dialog */}
      <Dialog open={openDateRangeDialog} onClose={() => setOpenDateRangeDialog(false)}>
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="End Date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDateRangeDialog(false)}>Cancel</Button>
          <Button onClick={() => {
            handleDateRangeSubmit();
            setOpenDateRangeDialog(false);
          }} variant="contained">
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const renderSpendingsSection = () => (
    <Box sx={styles.section}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Spending Records</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadSpendingReport()}
          >
            Download Report
          </Button>
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
            startIcon={<ReceiptIcon />}
          >
            Add Spending
          </Button>
        </Stack>
      </Box>
      {renderSpending()}
    </Box>
  );

  const renderUsersSection = () => (
    <Box sx={styles.section}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Users List</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setFormData({
              username: '',
              full_name: '',
              email: '',
              role: 'member',
              password: '',
              ikshana_id: '',
              department: '',
              section: '',
              dob: '',
              college_roll_number: ''
            });
            setEditingUser(null);
            setOpenDialog('user');
          }}
          startIcon={<PeopleIcon />}
        >
          Create User
        </Button>
      </Box>
      {renderUsers()}

      {/* User Creation/Edit Dialog */}
      <Dialog 
        open={openDialog === 'user'} 
        onClose={() => {
          setOpenDialog('');
          setError('');
        }}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Full Name"
                name="full_name"
                value={formData.full_name || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Username"
                name="username"
                value={formData.username || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role || 'member'}
                  onChange={handleInputChange}
                  label="Role"
                >
                  <MenuItem value="member">Member</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Ikshana ID"
                name="ikshana_id"
                value={formData.ikshana_id || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="College Roll Number"
                name="college_roll_number"
                value={formData.college_roll_number || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Department"
                name="department"
                value={formData.department || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Section"
                name="section"
                value={formData.section || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob || ''}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            {!editingUser && (
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password || ''}
                  onChange={handleInputChange}
                  helperText="Minimum 8 characters"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenDialog('');
              setError('');
            }}
          >
            Cancel
          </Button>
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
    </Box>
  );

  const renderEventsSection = () => (
    <Box sx={styles.section}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Events List</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateEvent}
          startIcon={<EventIcon />}
        >
          Create Event
        </Button>
      </Box>
      {renderEvents()}
    </Box>
  );

  const renderAnnouncementsSection = () => (
    <Box sx={styles.section}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Announcements List</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateAnnouncement}
          startIcon={<AnnouncementIcon />}
        >
          Create Announcement
        </Button>
      </Box>
      {renderAnnouncements()}
    </Box>
  );

  const handleDownloadSpendingReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/spending/report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `spending_report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage('Spending report downloaded successfully');
    } catch (error) {
      console.error('Error downloading spending report:', error);
      setError('Failed to download spending report');
    }
  };

  return (
    <Box sx={styles.container}>
      {/* Sidebar */}
      <Box sx={styles.sidebar}>
        <Typography variant="h5" sx={{ mb: 4, color: '#1a237e', fontWeight: 'bold' }}>
          Admin Panel
        </Typography>
        <List>
          <ListItem
            button
            onClick={() => setActiveSection('dashboard')}
            sx={{
              ...styles.sidebarItem,
              backgroundColor: activeSection === 'dashboard' ? 'rgba(26, 35, 126, 0.05)' : 'transparent'
            }}
          >
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <MuiListItemText primary="Dashboard" />
          </ListItem>
          <ListItem
            button
            onClick={() => setActiveSection('users')}
            sx={{
              ...styles.sidebarItem,
              backgroundColor: activeSection === 'users' ? 'rgba(26, 35, 126, 0.05)' : 'transparent'
            }}
          >
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <MuiListItemText primary="Users" />
          </ListItem>
          <ListItem
            button
            onClick={() => setActiveSection('donations')}
            sx={{
              ...styles.sidebarItem,
              backgroundColor: activeSection === 'donations' ? 'rgba(26, 35, 126, 0.05)' : 'transparent'
            }}
          >
            <ListItemIcon><MonetizationOnIcon /></ListItemIcon>
            <MuiListItemText primary="Donations" />
          </ListItem>
          <ListItem
            button
            onClick={() => setActiveSection('spendings')}
            sx={{
              ...styles.sidebarItem,
              backgroundColor: activeSection === 'spendings' ? 'rgba(26, 35, 126, 0.05)' : 'transparent'
            }}
          >
            <ListItemIcon><ReceiptIcon /></ListItemIcon>
            <MuiListItemText primary="Spendings" />
          </ListItem>
          <ListItem
            button
            onClick={() => setActiveSection('events')}
            sx={{
              ...styles.sidebarItem,
              backgroundColor: activeSection === 'events' ? 'rgba(26, 35, 126, 0.05)' : 'transparent'
            }}
          >
            <ListItemIcon><EventIcon /></ListItemIcon>
            <MuiListItemText primary="Events" />
          </ListItem>
          <ListItem
            button
            onClick={() => setActiveSection('announcements')}
            sx={{
              ...styles.sidebarItem,
              backgroundColor: activeSection === 'announcements' ? 'rgba(26, 35, 126, 0.05)' : 'transparent'
            }}
          >
            <ListItemIcon><AnnouncementIcon /></ListItemIcon>
            <MuiListItemText primary="Announcements" />
          </ListItem>
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              ...styles.sidebarItem,
              marginTop: 'auto',
              color: '#d32f2f'
            }}
          >
            <ListItemIcon><LogoutIcon sx={{ color: '#d32f2f' }} /></ListItemIcon>
            <MuiListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={styles.mainContent}>
        <Box sx={styles.header}>
          <Typography variant="h5" sx={{ color: '#1a237e' }}>
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </Typography>
        </Box>

        {/* Render content based on active section */}
        {activeSection === 'dashboard' && renderDashboardContent()}
        {activeSection === 'users' && renderUsersSection()}
        {activeSection === 'donations' && renderDonationsSection()}
        {activeSection === 'spendings' && renderSpendingsSection()}
        {activeSection === 'events' && renderEventsSection()}
        {activeSection === 'announcements' && renderAnnouncementsSection()}

        {/* Keep existing dialogs and menus */}
        {renderCreateAnnouncementDialog()}
        {renderCreateDonationDialog()}
        {renderSpendingDialog()}
        {renderEventDialog()}

        {/* Snackbar for messages */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert onClose={() => setSuccessMessage('')} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
