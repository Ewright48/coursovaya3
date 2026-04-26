const express = require('express');
const cors = require('cors');
const path = require('path')
require('dotenv').config();

const homeRoutes = require('./routes/homeRoutes');
const productRoutes = require('./routes/productRoutes');
const filterRoutes = require('./routes/filterRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/home', homeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Загрузка картинок товаров
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/api/ok', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

module.exports = app;