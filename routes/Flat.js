const express = require('express');
const router = express.Router();
const Flat = require('../models/Flat');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure user is authenticated

// POST: List a flat
router.post('/list', authMiddleware, async (req, res) => {
  try {
    const { title, location, pinCode, description, price, images, videos } = req.body;

    // Create a new flat listing
    const flat = new Flat({
      userId: req.user.id, // The ID of the logged-in user
      title,
      location,
      pinCode,
      description,
      price,
      images, // Assume images and videos come in as arrays of URLs
      videos
    });

    await flat.save();
    res.status(201).json({ message: 'Flat listed successfully!', flat });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
