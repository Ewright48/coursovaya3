const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/filters/flowers - список цветов для фильтра
router.get('/flowers', productController.getFilterFlowers);

// GET /api/filters/colors - список цветов букета для фильтра
router.get('/colors', productController.getFilterColors);

module.exports = router;