const express = require('express');
const router = express.Router();
const { db, storage } = require('../config/firebase');
const { authenticateToken } = require('../middleware/auth');

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({
      id: userDoc.id,
      username: userData.username,
      email: userData.email,
      full_name: userData.full_name,
      dob: userData.dob,
      college_roll_number: userData.college_roll_number,
      ikshana_id: userData.ikshana_id,
      designation: userData.designation,
      department: userData.department,
      section: userData.section,
      profile_picture: userData.profile_picture,
      role: userData.role,
      created_at: userData.created_at,
      updated_at: userData.updated_at
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      dob,
      college_roll_number,
      designation,
      department,
      section,
      profile_picture
    } = req.body;

    console.log('Updating profile for user:', userId, 'with data:', req.body);

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    const currentData = userDoc.data();
    const updateData = {};

    // Only include fields that are present in the request and not undefined
    if (full_name !== undefined) updateData.full_name = full_name;
    if (dob !== undefined) updateData.dob = dob || null; // Convert empty string to null
    if (college_roll_number !== undefined) updateData.college_roll_number = college_roll_number;
    if (designation !== undefined) updateData.designation = designation;
    if (department !== undefined) updateData.department = department;
    if (section !== undefined) updateData.section = section;
    if (profile_picture !== undefined) updateData.profile_picture = profile_picture;

    // Always update the timestamp
    updateData.updated_at = new Date().toISOString();

    console.log('Updating user with data:', updateData);

    await userRef.update(updateData);
    
    // Get the updated user data
    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data();
    
    console.log('Profile updated successfully for user:', userId);

    res.json({ 
      message: 'Profile updated successfully', 
      data: { 
        ...currentData,
        ...updateData,
        password: undefined // Don't send password back to client
      } 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile: ' + error.message });
  }
});

// Upload profile picture
router.post('/profile/picture', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { image_data } = req.body; // Base64 encoded image

    if (!image_data) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // Store the image in Firebase Storage and get the URL
    const imageBuffer = Buffer.from(image_data.split(',')[1], 'base64');
    const filename = `profile_pictures/${userId}_${Date.now()}.jpg`;
    const file = storage.file(filename);
    
    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/jpeg',
      },
    });

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Long expiration
    });

    // Update user profile with new picture URL
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      profile_picture: url,
      updated_at: new Date().toISOString()
    });

    res.json({ message: 'Profile picture updated', url });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
});

// Get user attendance
router.get('/attendance', async (req, res) => {
  try {
    const attendanceSnapshot = await db.collection('attendance')
      .where('user_id', '==', req.user.id)
      .get();

    const attendance = [];
    attendanceSnapshot.forEach(doc => {
      attendance.push({ id: doc.id, ...doc.data() });
    });

    // Sort on the client side for now
    attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get events
router.get('/events', async (req, res) => {
  try {
    const eventsSnapshot = await db.collection('events')
      .get();

    const events = [];
    eventsSnapshot.forEach(doc => {
      events.push({ id: doc.id, ...doc.data() });
    });

    // Sort on the client side for now
    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get announcements for member
router.get('/announcements', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const username = req.user.username;

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const announcementsRef = db.collection('announcements');
    const snapshot = await announcementsRef.orderBy('created_at', 'desc').get();
    
    const announcements = [];
    snapshot.forEach(doc => {
      const announcement = doc.data();
      // Include announcement if it's for everyone or if user is in core_members
      const visibility = announcement.visibility || 'all';
      const core_members = announcement.core_members || [];
      
      if (visibility === 'all' || 
         (visibility === 'core' && core_members.includes(username))) {
        announcements.push({
          id: doc.id,
          ...announcement,
          visibility: visibility,
          core_members: core_members
        });
      }
    });

    res.json(announcements);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
