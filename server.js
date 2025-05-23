const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './.env.local' });
const lostItemsController = require('./controllers/lostItemsController');
const foundItemsController = require('./controllers/foundItemsController');
const userController = require('./controllers/userController');
const adminController = require('./controllers/adminController');
const manageItemRoutes = require('./controllers/manageItemController');
require('./services/emailScheduler');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// const corsOptions = {
//     origin: [
//         'http://localhost:8100',  // Local development (Ionic frontend)
//         'https://tudlnf-serverv2-90ee51882713.herokuapp.com',  // Production URL for frontend
//         'http://10.0.2.2:8100',
//         'https://localhost:8100',
//         'https://10.0.2.2:8100',
//     ],
//     methods: 'GET,POST,PUT,DELETE',
//     allowedHeaders: 'Content-Type',
//     // credentials: true,
// };

app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

// Lost & Found Routes
app.post('/api/report_lost', lostItemsController.upload.single('image'), (req, res) => lostItemsController.addLostItem(req, res));
app.get('/api/lost_items', lostItemsController.getLostItems);
app.get('/api/lost_items/:id', lostItemsController.getLostItemById);

app.post('/api/report_found', foundItemsController.upload.single('image'), (req, res) => foundItemsController.addFoundItem(req, res));
app.get('/api/found_items', foundItemsController.getFoundItems);
app.get('/api/found_items/:id', foundItemsController.getFoundItemById);

app.post('/api/manage-item', manageItemRoutes.getItemFromToken);
app.post('/api/manage-item/prolong', manageItemRoutes.prolongItem);
app.post('/api/manage-item/remove', manageItemRoutes.removeItem);

app.get('/', (req,res) => res.send('Hello World!'));

// User Routes
app.use('/api/users', userController);

// **Admin Routes** (CRUD for users and items)
const adminRoutes = require('./controllers/adminController');
app.use('/api/admin', adminRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
