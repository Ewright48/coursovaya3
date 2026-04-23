const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/popular', homeController.getPopularProducts);
router.get('/new', homeController.getNewProducts);

module.exports = router;