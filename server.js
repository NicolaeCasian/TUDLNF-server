const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './.env.local' });
const path = require('path');

// Existing controllers
const lostItemsController = require('./controllers/lostItemsController');
const foundItemsController = require('./controllers/foundItemsController');

// New user controller
const userController = require('./controllers/userController');

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

app.use(cors(corsOptions)); // CORS middleware with the specified options
app.use(express.json());    // Parse JSON request bodies
app.use('/images', express.static(path.join(__dirname, 'images')));

// Existing routes for lost and found items
app.post('/api/report_lost', lostItemsController.upload.single('image'), (req, res) => {
  lostItemsController.addLostItem(req, res);
});
app.get('/api/lost_items', lostItemsController.getLostItems);
app.post('/api/report_found', foundItemsController.upload.single('image'), (req, res) => {
  foundItemsController.addFoundItem(req, res);
});
app.get('/api/found_items', foundItemsController.getFoundItems);
app.get('/api/lost_items/:id', lostItemsController.getLostItemById);

// New user endpoints
app.use('/api/users', userController);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
