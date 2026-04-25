const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/flowers', productController.getFilterFlowers);
router.get('/colors', productController.getFilterColors);

module.exports = router;