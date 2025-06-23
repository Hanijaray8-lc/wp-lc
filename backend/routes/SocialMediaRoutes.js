const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const Extraction = require('../models/SocialMedia');

// @route   POST api/extract
// @desc    Extract social media links from URL
router.post('/socialextract', async (req, res) => {
  try {
    const { url, companyName } = req.body; // <-- Get companyName

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Fetch the website content
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Social media link patterns
    const socialLinks = {
      facebook: '',
      instagram: '',
      linkedin: '',
      twitter: '',
      youtube: ''
    };

    // Find all links on the page
    $('a').each((i, link) => {
      const href = $(link).attr('href');
      if (!href) return;

      // Check for social media patterns
      if (href.includes('facebook.com')) socialLinks.facebook = href;
      if (href.includes('instagram.com')) socialLinks.instagram = href;
      if (href.includes('linkedin.com')) socialLinks.linkedin = href;
      if (href.includes('twitter.com') || href.includes('x.com')) socialLinks.twitter = href;
      if (href.includes('youtube.com')) socialLinks.youtube = href;
    });

    // Save to database
    const extraction = new Extraction({
      url,
      socialLinks,
      companyName // <-- Save companyName
    });
    await extraction.save();

    res.json({ success: true, socialLinks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to extract social links' });
  }
});

// @route   GET api/history
router.get('/history', async (req, res) => {
  try {
    const { companyName } = req.query;

    if (!companyName) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const extractions = await Extraction.find({ companyName })
      .sort({ date: -1 })
      .limit(10);

    res.json(extractions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});


module.exports = router;