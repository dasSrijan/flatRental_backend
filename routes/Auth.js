const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

// JWT Token Generator (includes user info)
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },  // Add user data to token
    process.env.JWT_SECRET,
    { expiresIn: '1h' }  // Adjust token expiration as needed
  );
};

// Signup Route
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    // Generate JWT for new user
    const token = generateToken(user);

    // Return the token and success message
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    console.error('Error in signup:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Log incoming request (for debugging)
  console.log('Received login request:', { email });

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with user info
    const token = generateToken(user);
    console.log('Generated token:', token);  // Log token for debugging

    res.json({ token });
  } catch (error) {
    console.error('Error in login:', error.message);  // Log any errors
    res.status(500).json({ message: 'Server error' });
  }
});

// Get logged-in user's data (Protected Route)
router.get('/me', verifyToken, async (req, res) => {
  try {
    // Find the user by ID and exclude password from response
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user data:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const verifyToken = require('../middleware/verifyToken');

// // JWT Token Generator

// const generateToken = (userId) => {
//   return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//     expiresIn: '1h',  // Adjust token expiration as needed
//   });
// };

// // Signup Route
// router.post('/signup', async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new user
//     const user = new User({ username, email, password: hashedPassword });
//     await user.save();

//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (err) {
//     console.error('Error in signup:', err.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Login Route
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   console.log('Received login request:', email, password);  // Log incoming request

//   if (!email || !password) {
//     console.log('Missing fields');  // Log missing fields
//     return res.status(400).json({ message: 'Please provide email and password' });
//   }

//   try {
//     // Find the user by email
//     const user = await User.findOne({ email });
//     console.log('User found:', user);  // Log user data

//     if (!user) {
//       console.log('User not found');
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Compare passwords
//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log('Password match:', isMatch);  // Log password comparison result

//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Generate JWT token
//     const token = generateToken(user._id);
//     console.log('Generated token:', token);  // Log generated token

//     res.json({ token });
//   } catch (error) {
//     console.error('Error in login:', error.message);  // Log any errors
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get logged-in user's data
// router.get('/me', verifyToken, async (req, res) => {
//   try {
//     // Find the user by ID and exclude password from response
//     const user = await User.findById(req.user.id).select('-password');
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.json(user);
//   } catch (err) {
//     console.error('Error fetching user data:', err.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;
