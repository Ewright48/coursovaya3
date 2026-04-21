const express = require('express');
const cors = require('cors');
const path = require('path');

// Импорт роутов
// const userRoutes = require('./routes/userRoutes');
// const productRoutes = require('./routes/productRoutes');
// const orderRoutes = require('./routes/orderRoutes');

// Импорт middleware
// const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware //////////////
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Роуты
// app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes); ///

// тест
app.get('/api/ok', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// // Обработка ошибок
// app.use(errorHandler); ///

module.exports = app;