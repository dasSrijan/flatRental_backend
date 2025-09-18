const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/User');

// Add to favorites
router.post('/:listingId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const listingId = req.params.listingId;

    if (!user.favorites.includes(listingId)) {
      user.favorites.push(listingId);
      await user.save();
      return res.json({ message: 'Listing added to favorites' });
    }

    res.status(400).json({ message: 'Listing already in favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from favorites
router.delete('/:listingId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const listingId = req.params.listingId;

    user.favorites = user.favorites.filter(id => id.toString() !== listingId);
    await user.save();

    res.json({ message: 'Listing removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's favorites
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
