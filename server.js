const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './.env.local' });
const lostItemsController = require('./controllers/lostItemsController');
const foundItemsController = require('./controllers/foundItemsController');
const userController = require('./controllers/userController');
const adminController = require('./controllers/adminController'); // Admin Controller
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: [
        'http://localhost:8100',  // Local development (Ionic frontend)
        'https://tudlnf-serverv2-90ee51882713.herokuapp.com',  // Production URL for frontend
    ],
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type',
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

// Lost & Found Routes
app.post('/api/report_lost', lostItemsController.upload.single('image'), (req, res) => lostItemsController.addLostItem(req, res));
app.get('/api/lost_items', lostItemsController.getLostItems);
app.get('/api/lost_items/:id', lostItemsController.getLostItemById);
app.delete('/api/lost_items/:id', lostItemsController.deleteLostItem);

app.post('/api/report_found', foundItemsController.upload.single('image'), (req, res) => foundItemsController.addFoundItem(req, res));
app.get('/api/found_items', foundItemsController.getFoundItems);
app.get('/api/found_items/:id', foundItemsController.getFoundItemById);
app.delete('/api/found_items/:id', foundItemsController.deleteFoundItem);

// User Routes
app.use('/api/users', userController);

// **Admin Routes** (CRUD for users and items)
const adminRoutes = require('./controllers/adminController');
app.use('/api/admin', adminRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
