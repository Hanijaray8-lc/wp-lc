const express = require('express');
const router = express.Router();
const { extractPhoneNumbers } = require('../utils/extractor');

// @route   POST api/extractor/extract
// @desc    Extract phone numbers from social media content
// @access  Public
router.post('/extract', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const phoneNumbers = extractPhoneNumbers(content);
    
    res.json({
      success: true,
      count: phoneNumbers.length,
      phoneNumbers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;