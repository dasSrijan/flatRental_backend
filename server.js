const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/Auth'));
app.use('/api/flats', require('./routes/Flat'));
app.use('/api/listings', require('./routes/listings')); // Ensure this is correct
// app.use('/uploads', express.static('uploads'));
const userRoutes = require('./routes/user'); // Import user routes
app.use('/api/users', userRoutes); // Mount user routes
const favoriteRoutes = require('./routes/favorites');
app.use('/api/favorites', favoriteRoutes);



// Serve static files from the uploads folder
app.use('/uploads', express.static('uploads'));

// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected', mongoose.connection.name,conn.connection.host);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

connectDB();

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Basic Route
app.get('/', (req, res) => {
  res.send('Welcome to the backend server!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();
// const listings = require('./routes/listings');

// const app = express();

// // Middleware
// app.use(express.json()); // Built-in body parser
// app.use(cors());
// app.use(express.urlencoded({extended:true}));

// // Routes
// app.use('/api/auth', require('./routes/Auth')); // Lowercase 'auth' for consistency
// app.use('/api/flats', require('./routes/Flat'));
// app.use('/api/listings', listings); // Register listings route
// // Serve static files from the uploads folder
// app.use('/uploads', express.static('uploads'));


// // Database Connection
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('MongoDB connected');
//   } catch (err) {
//     console.error('Error connecting to MongoDB:', err.message);
//     process.exit(1); // Exit process with failure
//   }
// };

// connectDB();

// // Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// // Basic Route
// app.get('/', (req, res) => {
//   res.send('Welcome to the backend server!');
// });
// // Listing route
// app.post('/api/listings', (req, res) => {
//   res.redirect("/routes/listings");
// });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
