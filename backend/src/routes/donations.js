const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { authenticateToken } = require('../middleware/auth');

// Create a new donation request (for members)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { amount, description, payment_method, reference_number } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    const donationData = {
      user_id: userId,
      created_by: username, // Changed from username to created_by to match admin dashboard
      amount: parseFloat(amount),
      description,
      payment_method,
      reference_number,
      status: 'pending', // pending, verified, rejected
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      verified_at: null,
      verified_by: null
    };

    const docRef = await db.collection('donations').add(donationData);
    res.status(201).json({ id: docRef.id, ...donationData });
  } catch (err) {
    console.error('Error creating donation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's donations (for members)
router.get('/my-donations', authenticateToken, async (req, res) => {
  try {
    const donationsSnapshot = await db.collection('donations')
      .where('user_id', '==', req.user.id)
      .get();

    const donations = [];
    let totalDonated = 0;
    let verifiedDonations = 0;

    donationsSnapshot.forEach(doc => {
      const donation = { id: doc.id, ...doc.data() };
      donations.push(donation);
      if (donation.status === 'verified') {
        totalDonated += donation.amount;
        verifiedDonations++;
      }
    });

    donations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json({
      donations,
      statistics: {
        totalDonated,
        verifiedDonations,
        pendingDonations: donations.filter(d => d.status === 'pending').length,
        rejectedDonations: donations.filter(d => d.status === 'rejected').length
      }
    });
  } catch (err) {
    console.error('Error fetching donations:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all donations (for admin)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const donationsSnapshot = await db.collection('donations').get();
    const donations = [];
    let totalDonated = 0;
    let totalPending = 0;
    const userTotals = {};
    const monthlyTotals = {};

    donationsSnapshot.forEach(doc => {
      const donation = { id: doc.id, ...doc.data() };
      donations.push(donation);

      if (donation.status === 'verified') {
        totalDonated += donation.amount;
        
        // Track user totals
        userTotals[donation.created_by] = (userTotals[donation.created_by] || 0) + donation.amount;
        
        // Track monthly totals
        const monthYear = new Date(donation.created_at).toISOString().slice(0, 7);
        monthlyTotals[monthYear] = (monthlyTotals[monthYear] || 0) + donation.amount;
      } else if (donation.status === 'pending') {
        totalPending += donation.amount;
      }
    });

    donations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      donations,
      statistics: {
        totalDonated,
        totalPending,
        verifiedCount: donations.filter(d => d.status === 'verified').length,
        pendingCount: donations.filter(d => d.status === 'pending').length,
        rejectedCount: donations.filter(d => d.status === 'rejected').length,
        userTotals,
        monthlyTotals
      }
    });
  } catch (err) {
    console.error('Error fetching all donations:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify or reject donation (for admin)
router.put('/:id/verify', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const donationRef = db.collection('donations').doc(req.params.id);
    await donationRef.update({
      status,
      verified_at: new Date().toISOString(),
      verified_by: req.user.username
    });

    const updatedDonation = await donationRef.get();
    res.json({ id: updatedDonation.id, ...updatedDonation.data() });
  } catch (err) {
    console.error('Error verifying donation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
