const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_secret_key';

const generateToken = (userId, email) => jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
const hashPassword = (password) => bcrypt.hash(password, 10);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);
const formatPrice = (price) => Math.floor(price);

const generateOrderNumber = async (getLastNumber = null) => {
    const date = new Date();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${timestamp}-${random}`;
};

const validateDelivery = (delivery_type, delivery_address) => {
    if (!delivery_type || !['courier', 'pickup'].includes(delivery_type)) {
        throw new Error('Укажите корректный тип доставки');
    }
    if (delivery_type === 'courier' && !delivery_address) {
        throw new Error('Укажите адрес доставки');
    }
    return { deliveryPrice: delivery_type === 'courier' ? 400 : 0 };
};

module.exports = { generateToken, hashPassword, comparePassword, formatPrice, generateOrderNumber, validateDelivery };