const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { db, auth } = require('../config/firebase');

// Login route
// Test endpoint to verify Firebase connection
router.get('/test', async (req, res) => {
  try {
    console.log('Firebase Config:', {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key_exists: !!process.env.FIREBASE_PRIVATE_KEY
    });

    // Try to list users to verify Firebase connection
    const userList = await db.collection('users').limit(1).get();
    console.log('Found users:', userList.size);

    res.json({
      message: 'Auth route is working',
      firebase_connected: true,
      users_found: userList.size
    });
  } catch (error) {
    console.error('Firebase test error:', error);
    res.status(500).json({
      message: 'Firebase connection failed',
      error: error.message,
      code: error.code
    });
  }
});

// Enable CORS middleware for this route
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

router.post('/login', [
  body('username').notEmpty().trim(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    console.log('Login request received:', {
      body: req.body,
      headers: req.headers
    });
    console.log('Received login request with body:', req.body);
    console.log('Headers:', req.headers);
    const errors = validationResult(req);
    console.log('Validation result:', errors.array());
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    console.log('Login attempt:', username);
    
    // Get user from Firestore
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).get();

    console.log('User query result:', snapshot.empty ? 'User not found' : 'User found');

    if (snapshot.empty) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password validation:', validPassword ? 'Valid' : 'Invalid');
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', username);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      body: req.body
    });
    console.error('Detailed login error:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
