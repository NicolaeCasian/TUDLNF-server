const express = require('express');
const { ObjectId } = require('mongodb');
const { connectDB } = require('../lib/mongodb'); // Ensure this path is correct

const router = express.Router();

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const db = await connectDB();
    const users = await db.collection("users").find().toArray();
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT /api/admin/users/:email - Update user role
router.put('/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ success: false, message: "Role is required." });

    const db = await connectDB();
    const updateResult = await db.collection("users").updateOne({ email }, { $set: { role } });

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const updatedUser = await db.collection("users").findOne({ email });
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE /api/admin/users/:email - Delete a user
router.delete('/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const db = await connectDB();
    const deleteResult = await db.collection("users").deleteOne({ email });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
