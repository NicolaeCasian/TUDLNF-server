const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define the user schema and model inline (no separate model file)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  studentId: { type: String, default: '' }
});

const User = mongoose.model('User', userSchema);

// POST /api/users
// Create or update a user record upon login
router.post('/', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required.' });
    }
    let user = await User.findOne({ email });
    if (user) {
      // Optionally update the name if needed
      user.name = name;
      await user.save();
    } else {
      user = new User({ email, name });
      await user.save();
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:email
// Update additional user information (phone and studentId)
router.put('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { phone, studentId } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { phone, studentId },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in PUT /api/users/:email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
