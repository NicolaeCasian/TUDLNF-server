const path = require('path');
const multer = require('multer');
const { connectDB } = require("../lib/mongodb");
const multerS3 = require("multer-s3");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {ObjectId} = require("mongodb");

dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        key: (req, file, cb) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const fileName = `uploads/${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
            cb(null, fileName);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

// Add found item
const addFoundItem = async (req, res) => {
    // Extract dateFound rather than dateLost for a found item
    const { type, name, category, description, location, dateFound, email } = req.body;
    const image = req.file ? req.file.key : null;

    const createdAt = new Date();
    const next_notification = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    const foundItem = {
        type: 'Found',
        name,
        category,
        description,
        location,
        dateFound,
        email,
        image,
        createdAt,
        next_notification,
        status: 'active',
        userNotified: false,
    };

    try {
        const db = await connectDB();
        const collection = db.collection('found_items');

        const result = await collection.insertOne(foundItem);
        console.log('Data inserted successfully:', result);

        res.json({
            success: true,
            message: 'Data uploaded and stored successfully!',
            receivedData: {
                type,
                name,
                category,
                description,
                location,
                dateFound,
                email,
            },
            image: image || "No Image",
            next_notification

        });
    } catch (error) {
        console.error('Error inserting document into MongoDB:', error);
        res.status(500).json({
            success: false,
            message: 'Error inserting data into MongoDB',
        });
    }
};

// Get found items
const getFoundItems = async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection("found_items");
        const items = await collection.find({ status: 'active' }).toArray();

        for (let item of items) {
            if (item.image) {
                const command = new GetObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: item.image,
                });
                item.image = await getSignedUrl(s3, command, { expiresIn: 3600 });
            }
        }

        console.log("Fetched found items:", items);

        res.json({
            success: true,
            items,
        });
    } catch (err) {
        console.error("Error fetching found items:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching found items",
        });
    }
};

const getFoundItemById = async (req, res) => {
    try {
        const {id} = req.params;
        const db = await connectDB();
        const collection = db.collection("found_items");

        const item = await collection.findOne({_id: new ObjectId(id)});

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found',
            });
        }

        if (item.image) {
            const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: item.image,
            });
            item.image = await getSignedUrl(s3, command, {expiresIn: 3600});
        }

        console.log("Fetched found item:", item);

        res.json({
            success: true,
            item,
        });
    } catch (err) {
        console.error("Error fetching found item:", err);
        res.status(500).json({
            success: false,
            message: 'Error fetching v item',
        });
    }
};

module.exports = {
    addFoundItem,  // Corrected export: now exporting addFoundItem
    upload,
    getFoundItemById,
    getFoundItems, // Renamed for clarity
};
