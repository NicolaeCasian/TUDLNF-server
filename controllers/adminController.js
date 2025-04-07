const express = require('express');
const { ObjectId } = require('mongodb');
const { connectDB } = require('../lib/mongodb'); // Ensure this path is correct

const router = express.Router();

// GET /api/admin/users - Retrieve all users with their lost and found items
router.get('/users', async (req, res) => {
  try {
    const db = await connectDB();
    const users = await db.collection("users").find().toArray();
    const lostItems = await db.collection("lost").find().toArray();
    const foundItems = await db.collection("found").find().toArray();

    // Attach lost and found items to their corresponding user
    const usersWithItems = users.map(user => {
      const userLostItems = lostItems.filter(item => item.email === user.email);
      const userFoundItems = foundItems.filter(item => item.email === user.email);
      return {
        ...user,
        lostItems: userLostItems,
        foundItems: userFoundItems
      };
    });

    res.json({ success: true, users: usersWithItems });
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

// DELETE /api/lost/:id - Delete a lost item by ID
router.delete('/lost/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();
    const result = await db.collection("lost").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Lost item not found." });
    }

    res.json({ success: true, message: "Lost item deleted successfully." });
  } catch (error) {
    console.error("Error deleting lost item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE /api/found/:id - Delete a found item by ID
router.delete('/found/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();
    const result = await db.collection("found").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Found item not found." });
    }

    res.json({ success: true, message: "Found item deleted successfully." });
  } catch (error) {
    console.error("Error deleting found item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
