// controllers/userController.js
const express = require('express');
const router = express.Router();
const { connectDB } = require('../lib/mongodb'); // Verify this path is correct

// POST /api/users
// Create or update a user record upon login
router.post('/', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, message: "Email and name are required." });
    }
    const db = await connectDB();
    const collection = db.collection("users");

    // Check if the user already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      // Update the name if needed
      await collection.updateOne({ email }, { $set: { name } });
      const updatedUser = await collection.findOne({ email });
      console.log("User updated successfully:", updatedUser);
      return res.json({ success: true, user: updatedUser });
    } else {
      // Create a new user record with default empty values for phone and studentId
      const newUser = { email, name, phone: "", studentId: "", createdAt: new Date() };
      await collection.insertOne(newUser);
      console.log("New user created:", newUser);
      return res.json({ success: true, user: newUser });
    }
  } catch (error) {
    console.error("Error in POST /api/users:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT /api/users/:email
// Update additional user information (phone and studentId)
router.put('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { phone, studentId } = req.body;
    const db = await connectDB();
    const collection = db.collection("users");

    const updateResult = await collection.updateOne(
      { email },
      { $set: { phone, studentId } }
    );
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    const updatedUser = await collection.findOne({ email });
    console.log("User additional info updated:", updatedUser);
    return res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error in PUT /api/users/:email:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
