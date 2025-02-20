const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './.env.local' });
const lostItemsController = require('./controllers/lostItemsController');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use('/images', express.static(path.join(__dirname, 'images')));

// Route to handle report lost item (delegated to controller)
app.post('/api/report_lost', lostItemsController.upload.single('image'), (req, res) => {
    lostItemsController.addLostItem(req, res); // Call the controller to handle the logic
});

app.get('/api/lost_items', lostItemsController.getLostItems);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
