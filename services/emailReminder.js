const {connectDB} = require("../lib/mongodb");
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const baseUrl = process.env.BASE_URL || "http://localhost:8100";
let manageUrl = `${baseUrl}/manage-item`;

const sendReminderEmail = async (item) => {
    const mailOptions = {
        from: `"Lost & Found" <${process.env.EMAIL_USER}>`,
        to: item.email,
        subject: `Reminder about your ${item.type.toLowerCase()} item: ${item.name}`,
        html: `
      <p>Hi,</p>
      <p>This is a reminder that your <strong>${item.type}</strong> item <strong>"${item.name}"</strong> is still listed.</p>
      <p>If you've recovered or returned the item, please mark it as completed.</p>
      <p><a href="${manageUrl}" style="padding: 10px 15px; background: #4caf50; color: white; text-decoration: none; border-radius: 5px;">Manage My Items</a></p>
      <p style="font-size: 0.9em; color: #777;">This is an automated message from the Lost & Found system.</p>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${item.email} for item ${item.name}`);
    } catch (err) {
        console.error('❌ Error sending email:', err);
    }
};

const checkAndSendReminders = async () => {
    const db = await connectDB();
    const collections = ['lost_items', 'found_items'];

    const today = new Date();

    for (const collectionName of collections) {
        const collection = db.collection(collectionName);

        const itemsToNotify = await collection.find({
            next_notification: { $exists: true }
        }).toArray();

        for (const item of itemsToNotify) {

            const token = jwt.sign(
                {
                    email: item.email,
                    itemId: item._id
                },
                process.env.JWT_SECRET,
                { expiresIn: "3d" }
            );
            manageUrl = manageUrl + "?token=" + token;

            await sendReminderEmail(item);

            const nextNotification = new Date(today);
            nextNotification.setDate(today.getDate() + 7);

            await collection.updateOne(
                { _id: item._id },
                { $set: { notificationDate: nextNotification } }
            );
        }
    }
};

module.exports = checkAndSendReminders;