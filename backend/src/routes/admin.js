const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { db, auth } = require('../config/firebase');
const { isAdmin } = require('../middleware/auth');

// Middleware to ensure admin access
router.use(isAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.orderBy('created_at', 'desc').get();
    
    const users = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        username: userData.username,
        role: userData.role,
        full_name: userData.full_name,
        email: userData.email,
        created_at: userData.created_at
      });
    });

    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate Ikshana ID
const generateIkshanaId = async () => {
  try {
    // Get the current year's last two digits (24)
    const year = new Date().getFullYear().toString().slice(-2);
    // Add 25 for the department code
    const deptCode = '25';
    
    // Get the latest user count to generate the sequence
    const usersRef = db.collection('users');
    const snapshot = await usersRef
      .orderBy('ikshana_id', 'desc')
      .limit(1)
      .get();

    let sequence = '0001';
    if (!snapshot.empty) {
      const latestId = snapshot.docs[0].data().ikshana_id;
      // Extract the sequence number (last 4 digits before the last character)
      const currentSequence = parseInt(latestId.slice(-5, -1));
      sequence = (currentSequence + 1).toString().padStart(4, '0');
    }

    // Generate a random letter (A-Z) for the last character
    const lastChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));

    // Combine all parts to create the Ikshana ID
    return `${year}${deptCode}${sequence}${lastChar}`;
  } catch (error) {
    console.error('Error generating Ikshana ID:', error);
    throw error;
  }
};

// Create new user
router.post('/users', [
  body('username').notEmpty().trim(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'member']),
  body('full_name').notEmpty().trim(),
  body('email').isEmail()
], async (req, res) => {
  try {
    console.log('Creating user with data:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, role, full_name, email } = req.body;

    // Check if username exists
    const userSnapshot = await db.collection('users')
      .where('username', '==', username)
      .get();

    if (!userSnapshot.empty) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email exists
    const emailSnapshot = await db.collection('users')
      .where('email', '==', email)
      .get();

    if (!emailSnapshot.empty) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const timestamp = new Date().toISOString();

    const userData = {
      username,
      password: hashedPassword,
      role,
      full_name,
      email,
      created_at: timestamp,
      updated_at: timestamp,
      college_roll_number: '',
      ikshana_id: username, // Set Ikshana ID same as username
      designation: '',
      department: '',
      section: '',
      profile_picture: '',
      dob: ''
    };

    const userRef = await db.collection('users').add(userData);
    console.log('User created successfully:', userRef.id, 'with Ikshana ID:', username);

    res.status(201).json({ 
      message: 'User created successfully', 
      id: userRef.id,
      user: { ...userData, id: userRef.id, password: undefined }
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Update user
router.put('/users/:id', [
  body('username').notEmpty().trim(),
  body('full_name').notEmpty().trim(),
  body('email').isEmail(),
  body('role').isIn(['admin', 'member'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { username, full_name, email, role, password } = req.body;
    const timestamp = new Date().toISOString();

    const userRef = db.collection('users').doc(id);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is being changed and if it's unique
    if (username !== doc.data().username) {
      const usernameCheck = await db.collection('users')
        .where('username', '==', username)
        .get();
      if (!usernameCheck.empty) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    const updateData = {
      username: username.trim(),
      full_name: full_name.trim(),
      email: email.trim(),
      role,
      updated_at: timestamp
    };

    // Only update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await userRef.update(updateData);
    
    const updatedDoc = await userRef.get();
    const userData = updatedDoc.data();
    delete userData.password; // Don't send password back
    
    res.json({ 
      id: updatedDoc.id, 
      ...userData
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await db.collection('users').doc(id).delete();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark attendance
router.post('/attendance', [
  body('user_id').notEmpty(),
  body('date').notEmpty(),
  body('status').isIn(['present', 'absent', 'late'])
], async (req, res) => {
  try {
    console.log('Received attendance data:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, date, status } = req.body;

    // Format the date to YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    // Create a unique ID for the attendance record
    const attendanceId = `${user_id}_${formattedDate}`;
    
    const attendanceData = {
      user_id,
      date: formattedDate,
      status,
      marked_by: req.user.id,
      updated_at: new Date().toISOString()
    };

    console.log('Creating/updating attendance with data:', attendanceData);
    
    // Use set with merge to either create or update the attendance record
    await db.collection('attendance').doc(attendanceId).set(attendanceData, { merge: true });
    
    console.log('Attendance marked successfully');
    res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ message: 'Error marking attendance: ' + err.message });
  }
});

// Get attendance
router.get('/attendance', async (req, res) => {
  try {
    const { date } = req.query;
    const attendanceRef = db.collection('attendance');
    let query = attendanceRef;

    if (date) {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      query = query.where('date', '==', formattedDate);
    }

    const snapshot = await query.get();
    const attendance = [];

    for (const doc of snapshot.docs) {
      const attendanceData = doc.data();
      // Get user details
      const userDoc = await db.collection('users').doc(attendanceData.user_id).get();
      const userData = userDoc.data();

      if (userData) {
        attendance.push({
          id: doc.id,
          ...attendanceData,
          user_name: userData.full_name,
          username: userData.username
        });
      }
    }

    res.json(attendance);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ message: 'Error fetching attendance: ' + err.message });
  }
});

// Create announcement
router.post('/announcements', [
  body('title').notEmpty().trim(),
  body('content').notEmpty().trim(),
  body('visibility').isIn(['all', 'core']),
  body('core_members').optional().isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, content, visibility, core_members = [] } = req.body;
    const timestamp = new Date().toISOString();

    const announcementData = {
      title: title.trim(),
      content: content.trim(),
      created_at: timestamp,
      created_by: req.user.username,
      updated_at: timestamp,
      visibility,
      core_members: visibility === 'core' ? core_members : []
    };

    const docRef = await db.collection('announcements').add(announcementData);
    res.status(201).json({ id: docRef.id, ...announcementData });
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all announcements
router.get('/announcements', async (req, res) => {
  try {
    const announcementsRef = db.collection('announcements');
    const snapshot = await announcementsRef.orderBy('created_at', 'desc').get();
    
    const announcements = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      announcements.push({
        id: doc.id,
        ...data,
        visibility: data.visibility || 'all',
        core_members: data.core_members || []
      });
    });

    res.json(announcements);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete announcement
router.delete('/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('announcements').doc(id).delete();
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update announcement
router.put('/announcements/:id', [
  body('title').notEmpty().trim(),
  body('content').notEmpty().trim(),
  body('visibility').isIn(['all', 'core']),
  body('core_members').optional().isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { title, content, visibility, core_members = [] } = req.body;
    const timestamp = new Date().toISOString();

    const announcementRef = db.collection('announcements').doc(id);
    const doc = await announcementRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    const updateData = {
      title: title.trim(),
      content: content.trim(),
      updated_at: timestamp,
      visibility,
      core_members: visibility === 'core' ? core_members : []
    };

    await announcementRef.update(updateData);
    
    const updatedDoc = await announcementRef.get();
    res.json({ 
      id: updatedDoc.id, 
      ...updatedDoc.data() 
    });
  } catch (err) {
    console.error('Error updating announcement:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event
router.post('/events', [
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('date').notEmpty().isISO8601(),
  body('time').notEmpty().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('location').notEmpty().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, date, time, location } = req.body;
    const timestamp = new Date().toISOString();

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      location: location.trim(),
      created_at: timestamp,
      updated_at: timestamp,
      created_by: req.user.username
    };

    const docRef = await db.collection('events').add(eventData);
    res.status(201).json({ id: docRef.id, ...eventData });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events
router.get('/events', async (req, res) => {
  try {
    const eventsRef = db.collection('events');
    const snapshot = await eventsRef.orderBy('date', 'asc').get();
    const events = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      events.push({
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        time: data.time || '',
        location: data.location || '',
        additional_info: data.additional_info || '',
        created_by: data.created_by || '',
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      });
    });

    console.log('Events data:', events);
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/events/:id', [
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('date').notEmpty().isISO8601(),
  body('time').notEmpty().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('location').notEmpty().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { title, description, date, time, location } = req.body;
    const timestamp = new Date().toISOString();

    const eventRef = db.collection('events').doc(id);
    const doc = await eventRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updateData = {
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      location: location.trim(),
      updated_at: timestamp
    };

    await eventRef.update(updateData);
    
    const updatedDoc = await eventRef.get();
    res.json({ 
      id: updatedDoc.id, 
      ...updatedDoc.data() 
    });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('events').doc(id).delete();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donation
router.put('/donations/:id', [
  body('amount').isNumeric(),
  body('reference_number').notEmpty().trim(),
  body('status').isIn(['pending', 'approved', 'rejected']),
  body('notes').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { amount, reference_number, status, notes } = req.body;
    const timestamp = new Date().toISOString();

    const donationRef = db.collection('donations').doc(id);
    const doc = await donationRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const updateData = {
      amount: Number(amount),
      reference_number: reference_number.trim(),
      status,
      notes: notes ? notes.trim() : doc.data().notes || '',
      updated_at: timestamp,
      updated_by: req.user.username
    };

    await donationRef.update(updateData);
    
    const updatedDoc = await donationRef.get();
    res.json({ 
      id: updatedDoc.id, 
      ...updatedDoc.data() 
    });
  } catch (err) {
    console.error('Error updating donation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete donation
router.delete('/donations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const donationRef = db.collection('donations').doc(id);
    const doc = await donationRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    await donationRef.delete();
    res.json({ message: 'Donation deleted successfully' });
  } catch (err) {
    console.error('Error deleting donation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donation
router.put('/donations/:id', [
  body('amount').isNumeric(),
  body('reference_number').notEmpty().trim(),
  body('status').isIn(['pending', 'verified', 'rejected']),
  body('notes').optional().trim(),
  body('username').notEmpty().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { amount, reference_number, status, notes, username } = req.body;
    const timestamp = new Date().toISOString();

    const donationRef = db.collection('donations').doc(id);
    const doc = await donationRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const updateData = {
      amount: Number(amount),
      reference_number: reference_number.trim(),
      status,
      notes: notes ? notes.trim() : '',
      updated_at: timestamp,
      created_by: username
    };

    await donationRef.update(updateData);
    
    const updatedDoc = await donationRef.get();
    res.json({ 
      id: updatedDoc.id, 
      ...updatedDoc.data() 
    });
  } catch (err) {
    console.error('Error updating donation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create spending
router.post('/spending', [
  body('amount').isNumeric(),
  body('description').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('date').notEmpty(),
  body('reference_number').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, description, category, date, reference_number } = req.body;
    const timestamp = new Date().toISOString();

    const spendingData = {
      amount: Number(amount),
      description: description.trim(),
      category: category.trim(),
      date,
      reference_number: reference_number ? reference_number.trim() : '',
      created_at: timestamp,
      created_by: req.user.username,
      updated_at: timestamp
    };

    console.log('Creating spending record:', spendingData);

    const docRef = await db.collection('spending').add(spendingData);
    const newSpending = { id: docRef.id, ...spendingData };
    
    console.log('Created spending record:', newSpending);
    
    res.status(201).json(newSpending);
  } catch (err) {
    console.error('Error creating spending:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all spending
router.get('/spending', async (req, res) => {
  try {
    const spendingRef = db.collection('spending');
    const snapshot = await spendingRef.orderBy('created_at', 'desc').get();
    
    const spending = [];
    let totalSpent = 0;
    const categoryTotals = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const amount = Number(data.amount) || 0;
      totalSpent += amount;

      if (data.category) {
        categoryTotals[data.category] = (categoryTotals[data.category] || 0) + amount;
      }

      spending.push({
        id: doc.id,
        amount: amount,
        description: data.description || '',
        category: data.category || '',
        date: data.date || '',
        reference_number: data.reference_number || '',
        created_by: data.created_by || '',
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      });
    });

    console.log('Spending data:', { spending, statistics: { totalSpent, categoryTotals } });

    res.json({
      spending,
      statistics: {
        totalSpent,
        categoryTotals
      }
    });
  } catch (err) {
    console.error('Error fetching spending:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get spending statistics
router.get('/spending/statistics', async (req, res) => {
  try {
    const spendingRef = db.collection('spending');
    const snapshot = await spendingRef.get();
    
    let totalSpent = 0;
    const categoryTotals = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const amount = Number(data.amount) || 0;
      totalSpent += amount;

      if (data.category) {
        categoryTotals[data.category] = (categoryTotals[data.category] || 0) + amount;
      }
    });

    res.json({
      totalSpent,
      categoryTotals
    });
  } catch (err) {
    console.error('Error fetching spending statistics:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update spending
router.put('/spending/:id', [
  body('amount').isNumeric(),
  body('description').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('date').notEmpty().isISO8601(),
  body('reference_number').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { amount, description, category, date, reference_number } = req.body;
    const timestamp = new Date().toISOString();

    const spendingRef = db.collection('spending').doc(id);
    const doc = await spendingRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Spending record not found' });
    }

    const updateData = {
      amount: Number(amount),
      description: description.trim(),
      category: category.trim(),
      date,
      reference_number: reference_number ? reference_number.trim() : '',
      updated_at: timestamp
    };

    await spendingRef.update(updateData);
    
    const updatedDoc = await spendingRef.get();
    res.json({ 
      id: updatedDoc.id, 
      ...updatedDoc.data() 
    });
  } catch (err) {
    console.error('Error updating spending:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete spending
router.delete('/spending/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('spending').doc(id).delete();
    res.json({ message: 'Spending record deleted successfully' });
  } catch (err) {
    console.error('Error deleting spending:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create donation
router.post('/donations', [
  body('amount').isNumeric(),
  body('reference_number').notEmpty().trim(),
  body('status').isIn(['pending', 'verified', 'rejected']),
  body('notes').optional().trim(),
  body('username').notEmpty().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { amount, reference_number, status, notes, username } = req.body;
    const timestamp = new Date().toISOString();

    const donationData = {
      amount: Number(amount),
      reference_number: reference_number.trim(),
      status,
      notes: notes ? notes.trim() : '',
      created_at: timestamp,
      updated_at: timestamp,
      created_by: username, // Username of the donor
      created_by_admin: req.user.username // Admin who created it
    };

    const docRef = await db.collection('donations').add(donationData);
    res.status(201).json({ id: docRef.id, ...donationData });
  } catch (err) {
    console.error('Error creating donation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all donations
router.get('/donations', async (req, res) => {
  try {
    const donationsRef = db.collection('donations');
    const snapshot = await donationsRef.orderBy('created_at', 'desc').get();
    
    const donations = [];
    snapshot.forEach(doc => {
      const donationData = doc.data();
      donations.push({
        id: doc.id,
        amount: donationData.amount,
        reference_number: donationData.reference_number,
        status: donationData.status,
        notes: donationData.notes,
        created_at: donationData.created_at,
        created_by: donationData.created_by || 'Unknown', // Username of the donor
        created_by_admin: donationData.created_by_admin || 'System', // Admin who created it
        updated_at: donationData.updated_at,
        verified_by: donationData.verified_by,
        verified_at: donationData.verified_at
      });
    });

    res.json(donations);
  } catch (err) {
    console.error('Error fetching donations:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify donation (approve/reject)
router.put('/donations/:id/verify', [
  body('status').isIn(['verified', 'rejected']),
  body('notes').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const timestamp = new Date().toISOString();

    const donationRef = db.collection('donations').doc(id);
    const doc = await donationRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const updateData = {
      status,
      notes: notes ? notes.trim() : doc.data().notes || '',
      updated_at: timestamp,
      verified_at: timestamp,
      verified_by: req.user.username
    };

    await donationRef.update(updateData);
    
    const updatedDoc = await donationRef.get();
    res.json({ 
      id: updatedDoc.id, 
      ...updatedDoc.data() 
    });
  } catch (err) {
    console.error('Error verifying donation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
