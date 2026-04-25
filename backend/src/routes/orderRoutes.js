const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, repeatOrder, cancelOrder } = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/:id/repeat', repeatOrder);
router.put('/:id/cancel', cancelOrder);

module.exports = router;