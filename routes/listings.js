const express = require('express');
const router = express.Router();
const multer = require('multer');
const Listing = require('../models/Listing'); 
const User = require('../models/User');// Import the Listing model
const verifyToken = require('../middleware/verifyToken'); // Ensure correct path
const authMiddleware = require('../middleware/authMiddleware');
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' }); // Configuring destination folder for uploaded files

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// POST route for listing flats
// POST route for listing flats
router.post(
  '/',
  [verifyToken, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 2 }])],
  async (req, res) => {
    try {
      const {
        location,
        address,
        pinCode,
        nearbyInstitutions,
        rentMoney,
        description,
        contactDetails,
      } = req.body;

      const images = req.files['images'] ? req.files['images'].map(file => file.path) : [];
      const videos = req.files['videos'] ? req.files['videos'].map(file => file.path) : [];

      // Get the email and username from the authenticated user
      const email = req.user.email;
      const username = req.user.username;

      const newListing = new Listing({
        location,
        address,
        pinCode,
        nearbyInstitutions,
        rentMoney,
        description,
        contactDetails,
        images,
        videos,
        email, // Store the user's email
        username, // Store the user's username
      });

      await newListing.save();
      console.log('Listing saved to MongoDB:', newListing);
      res.status(201).json({ message: 'Flat listed successfully', listing: newListing });
    } catch (error) {
      console.error('Error listing flat:', error);
      res.status(500).json({ message: 'Failed to list flat' });
    }
  }
);

// router.post('/', upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 2 }]), async (req, res) => {
//   try {
//     const {
//       location,
//       address,
//       pinCode,
//       nearbyInstitutions,
//       rentMoney,
//       description,
//       contactDetails,
//     } = req.body;

//     const images = req.files['images'] ? req.files['images'].map(file => file.path) : [];
//     const videos = req.files['videos'] ? req.files['videos'].map(file => file.path) : [];

//     const newListing = new Listing({
//       location,
//       address,
//       pinCode,
//       nearbyInstitutions,
//       rentMoney,
//       description,
//       contactDetails,
//       images,
//       videos,
//     });

//     await newListing.save();
//     console.log('Listing saved to MongoDB:', newListing);
//     res.status(201).json({ message: 'Flat listed successfully', listing: newListing });
//   } catch (error) {
//     console.error('Error listing flat:', error);
//     res.status(500).json({ message: 'Failed to list flat' });
//   }
// });

// GET route to fetch all flat listings
router.get('/', async (req, res) => {
  try {
    // Fetch all listings from MongoDB
    const listings = await Listing.find({});
    
    // Return the listings in the response
    res.status(200).json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Failed to fetch listings' });
  }
});

// GET route for search functionality
router.get('/search', async (req, res) => {
  const { q } = req.query;  // Get the search query from the URL (e.g., ?q=baranagar)

  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // Case-insensitive search using regular expressions
    const regex = new RegExp(q, 'i');

    // Search listings by location, address, pinCode, or nearbyInstitutions
    const listings = await Listing.find({
      $or: [
        { location: regex },
        { address: regex },
        { pinCode: regex },
        { nearbyInstitutions: regex }
      ]
    });

    if (listings.length === 0) {
      return res.status(404).json({ message: 'No listings found' });
    }

    res.status(200).json(listings);
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ message: 'Failed to search listings' });
  }
});

// Route to get all listings by logged-in user
router.get('/my-lists', verifyToken, async (req, res) => {
  try {
    const { username, email } = req.user; // Assuming you save username & email in the token payload

    // Find listings where the username and email match the logged-in user
    const listings = await Listing.find({ username, email });
    
    if (!listings.length) {
      return res.status(404).json({ message: 'No listings found for this user' });
    }

    res.json(listings);
  } catch (error) {
    console.error('Error fetching user listings:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    console.log('User ID from token:', req.user.id); // Log the user ID

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found in DB');
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the found user details to ensure they exist
    console.log('User found:', user);

    // Send back user details (exclude sensitive info)
    res.json({
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error); // Log full error details
    res.status(500).json({ message: 'Server error', error: error.message }); // Return error message
  }
});
// router.get('/profile', verifyToken, async (req, res) => {
//   try {
//     console.log(req.user.id);
//     const user = await User.findById(req.user.id); // Assuming you're using JWT to get user id
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     console.log(user.email);

//     // Send back user details (exclude sensitive information)
//     res.json({
//       username: user.username,
//       email: user.email,
//       // Add other fields like firstName, lastName, etc., if needed
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// GET route to fetch a single listing by its ID
router.get('/:id', async (req, res) => {
  // console.log('Fetching listing with ID:', req.params.id);
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.status(200).json(listing);
  } catch (error) {
    console.error('Error fetching listing by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a flat listing by ID
// routes/flats.js
// Modify your PUT route to use Multer
router.put('/:id', upload.fields([{ name: 'images' }, { name: 'videos' }]), async (req, res) => {
  const listingId = req.params.id;

  try {
      // Log the files and fields to confirm Multer is working
      console.log('Files:', req.files); // req.files will contain the uploaded files
      console.log('Body:', req.body);   // req.body will contain the text fields

      // Prepare the update data
      const updateData = {
          ...req.body,
          images: req.files.images ? req.files.images.map(file => file.path) : req.body.images,
          videos: req.files.videos ? req.files.videos.map(file => file.path) : req.body.videos
      };

      console.log('Update data:', updateData);

      // Update the listing in MongoDB
      const updatedListing = await Listing.findByIdAndUpdate(
          listingId, 
          { $set: updateData },  // Use the update data
          { new: true }
      );

      if (!updatedListing) {
          return res.status(404).json({ message: 'Listing not found' });
      }

      res.json(updatedListing);
  } catch (error) {
      console.error('Error updating listing:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

// router.put('/:id', async (req, res) => {
//   const listingId = req.params.id;

//   try {
//       // Log request data to confirm it is received correctly
//       console.log('Incoming update request body:', req.body);

//       // Find and update the listing
//       const updatedListing = await Listing.findByIdAndUpdate(
//           listingId, 
//           { $set: req.body },  // Using $set to explicitly update fields
//           { new: true }        // Return the updated document
//       );

//       // Log the updated listing or error if it's not found
//       if (!updatedListing) {
//           console.log('Listing not found');
//           return res.status(404).json({ message: 'Listing not found' });
//       }

//       console.log('Updated listing:', updatedListing);
//       res.json(updatedListing);
//   } catch (error) {
//       console.error('Error updating listing:', error);
//       res.status(500).json({ message: 'Server error' });
//   }
// });

// router.put('/:id', async (req, res) => {
//   const listingId = req.params.id;
  
//   try {
//     // Ensure that the request body contains the correct data
//     console.log('Update data:', req.body);
//       const updatedListing = await Listing.findByIdAndUpdate(listingId, req.body, { new: true });

//       if (!updatedListing) {
//           return res.status(404).json({ message: 'Listing not found' });
//       }

//       res.json(updatedListing);
//   } catch (error) {
//       console.error('Error updating listing:', error);
//       res.status(500).json({ message: 'Server error' });
//   }
// });

// // GET route to fetch listings by user ID
// router.get('/user/:userId', async (req, res) => {
//   try {
//     const listings = await Listing.findById(req.params.id); // Assuming you have userId in your Listing model
//     res.status(200).json(listings);
//   } catch (error) {
//     console.error('Error fetching user listings:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// GET route to fetch user favorites
router.get('/:id/favorites', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('favorites'); // Assuming you have a favorites field in your User model
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user.favorites);
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Route to get all listings by logged-in user
// router.get('/my-lists', verifyToken, async (req, res) => {
//   try {
//     const { username, email } = req.user; // Assuming you save username & email in the token payload

//     // Find listings where the username and email match the logged-in user
//     const listings = await Listing.find({ username, email });
    
//     if (!listings.length) {
//       return res.status(404).json({ message: 'No listings found for this user' });
//     }

//     res.json(listings);
//   } catch (error) {
//     console.error('Error fetching user listings:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// GET /api/listings/my-listings
// router.get('/my-listings', authMiddleware, async (req, res) => {
//   try {
//     // const userId = req.params.id; // the user id from the token (authMiddleware should attach it)
//     // const listings = await Listing.findById(req.params.id);
//     const query = {contactDetails:contactDetails};
//     const listings = await Listing.find(query).toArray();
//     if (!listings) {
//       return res.status(404).json({ msg: "No listings found" });
//     }
//     res.json(listings);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// GET /api/listings/:id
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/listings/:id
router.put("/:id", authMiddleware, async (req, res) => {
  const { title, description, rent } = req.body;
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    
    // Update fields
    listing.title = title;
    listing.description = description;
    listing.rent = rent;
    await listing.save();
    res.json({ message: "Listing updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/listings/:id
// DELETE route for deleting a listing by ID
router.delete('/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// router.delete("/:id", authMiddleware, async (req, res) => {
//   try {
//     const listing = await Listing.findById(req.params.id);
//     if (!listing) return res.status(404).json({ error: "Listing not found" });
    
//     await listing.remove();
//     res.json({ message: "Listing deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

module.exports = router;




// // POST set to set the flat listing the user and the gmail
// router.post('/', authMiddleware, async (req, res) => {
//   try {
//     const { location, address, pinCode, rent, images, videos, description, contactDetails } = req.body;

//     // Ensure that user details from authMiddleware are present
//     const userEmail = req.user.email;
//     const userName = req.user.username;

//     // Create a new flat with user details
//     const newFlat = new Flat({
//       location,
//       address,
//       pinCode,
//       rent,
//       images,
//       videos,
//       description,
//       contactDetails,
//       userEmail, // Add user's email
//       userName,  // Add user's username
//     });

//     // Save the new listing to MongoDB
//     await newFlat.save();

//     res.json(newFlat);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });




// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const Listing = require('../models/Listing'); // Import the Listing model

// // Multer setup for handling file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// // POST route for listing flats
// router.post('/', upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 2 }]), async (req, res) => {
//   try {
//     const {
//       location,
//       address,
//       pinCode,
//       nearbyInstitutions,
//       rentMoney,
//       description,
//       contactDetails,
//     } = req.body;

//     const images = req.files['images'] ? req.files['images'].map(file => file.path) : [];
//     const videos = req.files['videos'] ? req.files['videos'].map(file => file.path) : [];

//     const newListing = new Listing({
//       location,
//       address,
//       pinCode,
//       nearbyInstitutions,
//       rentMoney,
//       description,
//       contactDetails,
//       images,
//       videos,
//     });

//     await newListing.save();
//     console.log('Listing saved to MongoDB:', newListing);
//     res.status(201).json({ message: 'Flat listed successfully', listing: newListing });
//   } catch (error) {
//     console.error('Error listing flat:', error);
//     res.status(500).json({ message: 'Failed to list flat' });
//   }
// });

// // GET route to fetch all flat listings
// router.get('/', async (req, res) => {
//   try {
//     // Fetch all listings from MongoDB
//     const listings = await Listing.find({});
    
//     // Return the listings in the response
//     res.status(200).json(listings);
//   } catch (error) {
//     console.error('Error fetching listings:', error);
//     res.status(500).json({ message: 'Failed to fetch listings' });
//   }
// });

// // search 
// router.get('/search', async (req, res) => {
//   const { q } = req.query;
  
//   if (!q) {
//     return res.status(400).json({ message: 'Query parameter is missing' });
//   }

//   try {
//     // Use case-insensitive matching to allow flexibility in search
//     const regex = new RegExp(q, 'i'); 
    
//     // Search by location, address, pinCode, or nearbyInstitutions
//     const listings = await Listing.find({
//       $or: [
//         { location: regex },
//         { address: regex },
//         { pinCode: regex },
//         { nearbyInstitutions: regex }
//       ]
//     });

//     if (listings.length === 0) {
//       return res.status(404).json({ message: 'No listings found' });
//     }

//     res.json(listings);
//   } catch (error) {
//     console.error('Error during search:', error);
//     res.status(500).json({ message: 'Failed to search listings' });
//   }
// });

// module.exports = router;
