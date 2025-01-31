const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { isMember } = require('../middleware/auth');

// Middleware to ensure member access
// router.use(isMember);

// Get member's attendance
router.get('/attendance', isMember, async (req, res) => {
  try {
    console.log('Fetching attendance for user:', req.user.id);
    const attendanceRef = db.collection('attendance');
    const snapshot = await attendanceRef
      .where('user_id', '==', req.user.id)
      .orderBy('date', 'desc')
      .get();

    const attendance = [];
    snapshot.forEach(doc => {
      attendance.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`Found ${attendance.length} attendance records`);
    res.json(attendance);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

// Get all events
router.get('/events', isMember, async (req, res) => {
  try {
    console.log('Fetching all events');
    const eventsRef = db.collection('events');
    const snapshot = await eventsRef
      .orderBy('date', 'desc')
      .get();

    const events = [];
    for (const doc of snapshot.docs) {
      const eventData = doc.data();
      // Get creator details
      let creatorName = 'Unknown';
      if (eventData.created_by) {
        const creatorDoc = await db.collection('users').doc(eventData.created_by).get();
        if (creatorDoc.exists) {
          const creatorData = creatorDoc.data();
          creatorName = creatorData.full_name;
        }
      }

      events.push({
        id: doc.id,
        ...eventData,
        created_by_name: creatorName
      });
    }

    console.log(`Found ${events.length} events`);
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get all announcements
router.get('/announcements', isMember, async (req, res) => {
  try {
    console.log('Fetching all announcements');
    const announcementsRef = db.collection('announcements');
    const snapshot = await announcementsRef
      .orderBy('created_at', 'desc')
      .get();

    const announcements = [];
    for (const doc of snapshot.docs) {
      const announcementData = doc.data();
      // Get creator details
      let creatorName = 'Unknown';
      if (announcementData.created_by) {
        const creatorDoc = await db.collection('users').doc(announcementData.created_by).get();
        if (creatorDoc.exists) {
          const creatorData = creatorDoc.data();
          creatorName = creatorData.full_name;
        }
      }

      announcements.push({
        id: doc.id,
        ...announcementData,
        created_by_name: creatorName
      });
    }

    console.log(`Found ${announcements.length} announcements`);
    res.json(announcements);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ message: 'Error fetching announcements' });
  }
});

// Get member's profile
router.get('/profile', isMember, async (req, res) => {
  try {
    console.log('Fetching profile for user:', req.user.id);
    const userDoc = await db.collection('users').doc(req.user.id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    delete userData.password; // Don't send password

    res.json({
      id: userDoc.id,
      ...userData
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

module.exports = router;
