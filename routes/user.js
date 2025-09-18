// In your backend route (e.g., /api/auth/profile):
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/User');

router.get('/me', verifyToken, async (req, res) => {
  try {
    console.log(req.user.id);
    const user = await User.findById(req.user.id); // Assuming you're using JWT to get user id
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send back user details (exclude sensitive information)
    res.json({
      username: user.username,
      email: user.email,
      // Add other fields like firstName, lastName, etc., if needed
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's favorites
router.get('/favorites', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;



// In routes/user.js or similar

// const express = require('express');
// const User = require('../models/User'); // Assuming you have a User model
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware'); // Middleware to authenticate user

// // GET route to fetch the logged-in user's profile
// router.get('/me', authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id); // assuming req.user.id is populated by the auth middleware
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;


// // routes/user.js
// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');

// // Get user profile
// router.get('/:id', async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select('-password'); // Exclude password
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     // res.status(200).json(user);
//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Update user profile
// router.put('/:id', async (req, res) => {
//   try {
//     const { username, email } = req.body; // Add more fields as needed
//     const updatedUser = await User.findByIdAndUpdate(req.params.id, { username, email }, { new: true }).select('-password');
//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.status(200).json(updatedUser);
//   } catch (error) {
//     console.error('Error updating user profile:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;
