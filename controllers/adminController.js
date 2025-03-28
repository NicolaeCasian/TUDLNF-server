const express = require('express');
const { ObjectId } = require('mongodb');
const { connectDB } = require('../lib/mongodb'); // Ensure this path is correct

const router = express.Router();

// GET /api/admin/users - Get all users
async function getAllUsers(req, res) {
  try {
    const db = await connectDB();
    const users = await db.collection("users").find().toArray();
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  getAllUsers, // Add this to exports
  updateUserRole,
  deleteUser,
  updateLostItem,
  updateFoundItem,
};


// PUT /api/admin/users/:email - Update user role (e.g., promote to admin)
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

// PUT /api/admin/lost_items/:id - Update a lost item
router.put('/lost_items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = await connectDB();
    
    const updateResult = await db.collection("lostItems").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Lost item not found." });
    }

    const updatedItem = await db.collection("lostItems").findOne({ _id: new ObjectId(id) });
    res.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("Error updating lost item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT /api/admin/found_items/:id - Update a found item
router.put('/found_items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = await connectDB();
    
    const updateResult = await db.collection("foundItems").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Found item not found." });
    }

    const updatedItem = await db.collection("foundItems").findOne({ _id: new ObjectId(id) });
    res.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("Error updating found item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
