const { MongoClient } = require("mongodb");

const mongoURI = process.env.MONGODB_URI;
let client;
let db;

const connectDB = async () => {
    if (!db) {
        try {
            client = await MongoClient.connect(mongoURI);
            db = client.db("TUD-LOST-FOUND");
            console.log("✅ Connected to MongoDB");
        } catch (err) {
            console.error("Error connecting to MongoDB:", err);
            throw err;
        }
    }
    return db;
};

module.exports = { connectDB };
