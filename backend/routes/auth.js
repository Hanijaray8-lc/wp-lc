const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/signup', async (req, res) => {
  const { username, email, password, companyName } = req.body;

  if (!username || !email || !password || !companyName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newUser = new User({ username, email, password, companyName });
    await newUser.save();
    return res.status(201).json({ message: 'User created successfully' });

  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.username) {
        return res.status(400).json({ error: 'Username already exists. Please choose a different one.' });
      }
      if (err.keyPattern?.companyName) {
        return res.status(400).json({ error: 'Company name already exists. Please use another.' });
      }
    }
    return res.status(500).json({ error: 'Server error. Try again later.' });
  }
});

// Get all users (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password for security
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
// Get all users (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password for security
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username, password }); // In production, use hashed passwords

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // In real apps, generate a JWT token here
    res.status(200).json({ 
      message: 'Login successful',
      companyName: user.companyName, // Add this line
      username: user.username // Optional: return username
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
