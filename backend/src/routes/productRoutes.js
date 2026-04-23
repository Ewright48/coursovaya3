const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products - список товаров
router.get('/', productController.getProducts);

// GET /api/products/:id - для карточки товаров
router.get('/:id', productController.getProductById);

module.exports = router;