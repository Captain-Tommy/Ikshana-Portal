const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { db } = require('../config/firebase');
const { isAdmin } = require('../middleware/auth');

// Get all announcements (accessible to all authenticated users)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all announcements');
    const announcementsRef = db.collection('announcements');
    const snapshot = await announcementsRef.orderBy('created_at', 'desc').get();

    const announcements = [];
    for (const doc of snapshot.docs) {
      const announcementData = doc.data();
      // Get creator details
      const creatorDoc = await db.collection('users').doc(announcementData.created_by).get();
      const creatorData = creatorDoc.data();

      announcements.push({
        id: doc.id,
        ...announcementData,
        created_by_name: creatorData ? creatorData.full_name : 'Unknown'
      });
    }

    console.log(`Found ${announcements.length} announcements`);
    res.json(announcements);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ message: 'Error fetching announcements' });
  }
});

// Create announcement (admin only)
router.post('/', isAdmin, [
  body('title').notEmpty().trim(),
  body('content').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content } = req.body;
    const announcementData = {
      title: title.trim(),
      content: content.trim(),
      created_by: req.user.id,
      created_at: new Date().toISOString()
    };

    console.log('Creating announcement:', announcementData);
    const docRef = await db.collection('announcements').add(announcementData);
    
    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: {
        id: docRef.id,
        ...announcementData
      }
    });
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ message: 'Error creating announcement' });
  }
});

module.exports = router;
