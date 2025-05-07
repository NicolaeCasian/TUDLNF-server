const jwt = require('jsonwebtoken');
const {connectDB} = require("../lib/mongodb");
const {ObjectId} = require('mongodb');
const {GetObjectCommand} = require("@aws-sdk/client-s3");
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");
const {S3Client} = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const findItemByIdAndEmail = require("../lib/findItemByIdAndEmail");

dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

exports.getItemFromToken = async (req, res) => {
    const {token} = req.body;
    if (!token) return res.status(400).json({success: false, message: "No token provided"});

    try {
        const db = await connectDB();

        const usedToken = await db.collection("used_tokens").findOne({ token });
        if (usedToken) {
            return res.status(401).json({ success: false, message: "Token has already been used" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await findItemByIdAndEmail(db, decoded.itemId, decoded.email);
        if (!result) return res.status(404).json({success: false, message: "Item not found"});

        const item = result.item;

        if (item.image) {
            const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: item.image,
            });

            item.image = await getSignedUrl(s3, command, { expiresIn: 3600 });
        }

        res.json({success: true, item: result.item});
    } catch (err) {
        console.error("Error getting item from token:", err);
        res.status(401).json({success: false, message: "Invalid or expired token"});
    }
};

// PROLONG ITEM
exports.prolongItem = async (req, res) => {
    const {token} = req.body;
    if (!token) return res.status(400).json({success: false, message: "No token provided"});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const db = await connectDB();

        const result = await findItemByIdAndEmail(db, decoded.itemId, decoded.email);
        if (!result) return res.status(404).json({success: false, message: "Item not found"});

        const newDate = new Date();
        newDate.setDate(newDate.getDate() + 7);

        const update = await result.collection.updateOne(
            {_id: new ObjectId(decoded.itemId), email: decoded.email},
            {
                $set: {
                    next_notification: newDate,
                    userNotified: false,
                }
            }
        );

        const usedTokensCollection = db.collection("used_tokens");
        await usedTokensCollection.insertOne({
           token,
           itemId: decoded.itemId,
           email: decoded.email,
           usedAt: new Date(),
           action: 'prolong',
        });

        res.json({success: true, message: "Item prolonged by 1 week"});
    } catch (err) {
        res.status(401).json({success: false, message: "Invalid or expired token"});
    }
};

// REMOVE ITEM
exports.removeItem = async (req, res) => {
    const {token} = req.body;
    if (!token) return res.status(400).json({success: false, message: "No token provided"});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const db = await connectDB();

        const result = await findItemByIdAndEmail(db, decoded.itemId, decoded.email);
        if (!result) return res.status(404).json({success: false, message: "Item not found"});

        const update = await result.collection.updateOne(
            {_id: new ObjectId(decoded.itemId), email: decoded.email},
            {
                $set: {
                    status: 'removed'
                }
            }
        );

        const usedTokensCollection = db.collection("used_tokens");
        await usedTokensCollection.insertOne({
            token,
            itemId: decoded.itemId,
            email: decoded.email,
            usedAt: new Date(),
            action: 'prolong',
        });

        res.json({success: true, message: "Item successfully marked as inactive"});
    } catch (err) {
        res.status(401).json({success: false, message: "Invalid or expired token"});
    }
};
