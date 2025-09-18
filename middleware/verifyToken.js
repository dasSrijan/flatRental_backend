const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if the authorization header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Token not provided' });
  }

  // Extract the token (after 'Bearer ')
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Assuming decoded token contains the user's ID
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = verifyToken;


// const jwt = require('jsonwebtoken');

// const verifyToken = (req, res, next) => {
//   const token = req.header('x-auth-token');
//   if (!token) {
//     return res.status(401).json({ message: 'No token, authorization denied' });
//   }

//   try {
//     // Verify and decode the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;  // Attach decoded token data (id, username, email)
//     console.log('Token decoded:', decoded);  // Log decoded token for debugging
//     next();
//   } catch (err) {
//     console.error('Token verification failed:', err.message);  // Log error
//     res.status(401).json({ message: 'Token is not valid' });
//   }
// };

// module.exports = verifyToken;


// const jwt = require('jsonwebtoken');

// const verifyToken = (req, res, next) => {
//   // Get token from Authorization header
//   const token = req.header('Authorization')?.replace('Bearer ', '');

//   if (!token) {
//     return res.status(401).json({ msg: 'No token, authorization denied' });
//   }

//   try {
//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     // Attach user to request object
//     req.user = decoded;
//     // req.user = decoded.id; // Adjust this if your token payload contains different data
//     next();
//   } catch (err) {
//     res.status(401).json({ msg: 'Token is not valid' });
//   }
// };

// module.exports = verifyToken;
