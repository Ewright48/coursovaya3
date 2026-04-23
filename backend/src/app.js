const express = require('express');
const cors = require('cors');
const homeRoutes = require('./routes/homeRoutes');
const productRoutes = require('./routes/productRoutes');
const filterRoutes = require('./routes/filterRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Роуты
app.use('/api/home', homeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/filters', filterRoutes);

// Тест
app.get('/api/ok', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

module.exports = app;