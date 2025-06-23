const cheerio = require('cheerio');
const axios = require('axios');

// Function to extract phone numbers from text
function extractPhoneNumbers(text) {
  // Regular expression to match phone numbers
  const phoneRegex = /(\+\d{1,3}\s?)?(\(\d{1,3}\)\s?)?[\d\s-]{7,}/g;
  
  // Find all matches
  const matches = text.match(phoneRegex) || [];
  
  // Clean and validate matches
  const validNumbers = matches.map(num => {
    // Remove all non-digit characters except leading +
    const cleaned = num.replace(/[^\d+]/g, '');
    
    // Simple validation - at least 7 digits (international numbers can be longer)
    if (cleaned.replace(/\D/g, '').length >= 7) {
      return cleaned;
    }
    return null;
  }).filter(num => num !== null);
  
  // Remove duplicates
  return [...new Set(validNumbers)];
}

// Function to scrape a webpage for phone numbers
async function scrapePageForNumbers(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Get all text content from the page
    const pageText = $('body').text();
    
    // Extract phone numbers
    return extractPhoneNumbers(pageText);
  } catch (err) {
    console.error('Error scraping page:', err);
    return [];
  }
}

module.exports = {
  extractPhoneNumbers,
  scrapePageForNumbers
};