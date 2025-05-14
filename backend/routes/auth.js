const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Seller = require('../models/Seller');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Unified signup
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const Model = role === 'seller' ? Seller : User;
    const newUser = new Model({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    res.status(400).json({ error: 'Signup failed' });
  }
});

// Unified login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  const Model = role === 'seller' ? Seller : User;
  const user = await Model.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, role });
});

module.exports = router;
