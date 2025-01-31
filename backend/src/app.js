require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const memberRoutes = require('./routes/member');
const announcementsRoutes = require('./routes/announcements');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/member', authenticateToken, memberRoutes);
app.use('/api/announcements', authenticateToken, announcementsRoutes);

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- POST /api/auth/login');
  console.log('- GET  /api/member/events');
  console.log('- GET  /api/member/announcements');
  console.log('- GET  /api/member/attendance');
  console.log('- GET  /api/member/profile');
});

module.exports = app;
