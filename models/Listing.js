// const mongoose = require('mongoose');

// const ListingSchema = new mongoose.Schema({
//   location: { type: String, required: true },
//   address: { type: String, required: true },
//   pinCode: { type: String, required: true },
//   nearbyInstitutions: { type: String, required: true },
//   rentMoney: { type: Number, required: true },
//   description: { type: String, required: true },
//   contactDetails: { type: String, required: true },
//   images: [String],
//   videos: [String],
//   email: { type: String, required: true }, // Added email
//   username: { type: String, required: true }, // Added username
// });

// module.exports = mongoose.model('Listing', ListingSchema);

const mongoose = require('mongoose');

// Define the schema for a flat listing
const listingSchema = new mongoose.Schema({
  location: { type: String, required: true },
  address: { type: String, required: true },
  pinCode: { type: String, required: true },
  nearbyInstitutions: { type: String, required: true },
  rentMoney: { type: Number, required: true },
  description: { type: String, required: true },
  contactDetails: { type: String, required: true },
  images: [String], // Array of image paths
  videos: [String], // Array of video paths
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  date: { type: Date, default: Date.now },
});

// Create a model from the schema
const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
