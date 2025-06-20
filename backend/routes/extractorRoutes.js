const express = require('express');
const axios = require('axios');
const router = express.Router();
const Contact = require('../models/Extractor');

// Regex to find raw emails and phone numbers
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const phoneRegex = /\+?91[\s-]?\d{5}[\s-]?\d{5}|\b\d{10}\b/g;

// ✅ Normalize and validate Indian numbers
const normalizeIndianNumber = (raw) => {
  const digits = raw.replace(/\D/g, '');

  // Format: 10-digit starting with 6–9 (e.g., 8220914691)
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`;
  }

  // Format: 0-prefixed (e.g., 08220914691)
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.slice(1)}`;
  }

  // Format: 91XXXXXXXXXX (e.g., 918220914691)
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  // Format: +91XXXXXXXXXX already formatted
  if (digits.length === 13 && raw.startsWith('+91')) {
    return `+${digits.slice(digits.length - 12)}`; // ensures only 91xxxxxxxxxx
  }

  return null; // Invalid
};

router.post('/', async (req, res) => {
  const { url, companyName } = req.body; 

  try {
    const response = await axios.get(url);
    const html = response.data;

    // Extract emails
    const emails = Array.from(new Set(html.match(emailRegex) || []));

    // Extract and normalize phones
    const matchedPhones = html.match(phoneRegex) || [];
    const normalizedPhones = matchedPhones
      .map(normalizeIndianNumber)
      .filter(Boolean); // Remove invalids

    const phones = Array.from(new Set(normalizedPhones)); // Remove duplicates

   // ✅ Save to DB with company name
    await Contact.create({ url, emails, phones, companyName });

    res.json({ emails, phones });
  } catch (error) {
    console.error('❌ Extraction failed:', error.message);
    res.status(500).json({ message: 'Failed to fetch or parse the website.' });
  }
});

module.exports = router;
