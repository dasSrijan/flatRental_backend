// models/Flat.js

const mongoose = require('mongoose');

const FlatSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  pinCode: {
    type: String,
    required: true,
  },
  rent: {
    type: Number,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  videos: {
    type: [String],
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  contactDetails: {
    type: String,
    required: true,
  },
  // Additional fields
  userEmail: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Flat', FlatSchema);


// // models/Flat.js
// const mongoose = require('mongoose');

// const FlatSchema = new mongoose.Schema({
//   location: String,
//   address: String,
//   pinCode: String,
//   nearbyInstitutions: String,
//   rentMoney: Number,
//   images: [String],
//   videos: [String],
//   description: String,
//   contactDetails: String,
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Associate the flat with the user
// }, { timestamps: true });

// module.exports = mongoose.model('Flat', FlatSchema);
