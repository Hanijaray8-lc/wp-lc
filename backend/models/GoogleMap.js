
const mongoose = require('mongoose');

const GoogleMapSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'No Name'
  },
  address: {
    type: String,
    default: 'N/A'
  },
  phone: {
    type: String,
    default: 'N/A'
  },
  website: {
    type: String,
    default: 'N/A'
  },
  mapLink: {
    type: String,
    required: true,
    unique: true
  },
  companyName: { 
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GoogleMap', GoogleMapSchema);