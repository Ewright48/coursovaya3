const express = require('express');
const cors = require('cors');
const homeRoutes = require('./routes/homeRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Роуты
app.use('/api/home', homeRoutes);

// Тест
app.get('/api/ok', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

module.exports = app;