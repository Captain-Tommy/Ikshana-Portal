const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { authenticateToken } = require('../middleware/auth');

// Create a new spending (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { amount, description, category, date, reference_number } = req.body;
    const spendingData = {
      amount: parseFloat(amount),
      description,
      category,
      date: date || new Date().toISOString(),
      reference_number,
      created_by: req.user.username,
      created_at: new Date().toISOString()
    };

    const docRef = await db.collection('spendings').add(spendingData);
    res.status(201).json({ id: docRef.id, ...spendingData });
  } catch (err) {
    console.error('Error creating spending:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all spendings (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const spendingsSnapshot = await db.collection('spendings').get();
    const spendings = [];
    spendingsSnapshot.forEach(doc => {
      spendings.push({ id: doc.id, ...doc.data() });
    });

    // Sort by date
    spendings.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(spendings);
  } catch (err) {
    console.error('Error fetching spendings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get spending statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const spendingsSnapshot = await db.collection('spendings').get();
    let totalSpent = 0;
    const categoryTotals = {};

    spendingsSnapshot.forEach(doc => {
      const spending = doc.data();
      totalSpent += spending.amount;
      if (spending.category) {
        categoryTotals[spending.category] = (categoryTotals[spending.category] || 0) + spending.amount;
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

module.exports = router;
