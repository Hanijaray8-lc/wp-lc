const mongoose = require('mongoose');

const extractionSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  companyName: {
    type: String,
    default: ''
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('SocialMedia', extractionSchema);