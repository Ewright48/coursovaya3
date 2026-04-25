const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_secret_key';

// Генерация JWT токена
const generateToken = (userId, email) => {
    return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

// Хеширование пароля
const hashPassword = async (password) => {
    return bcrypt.hash(password, 10);
};

// Сравнение паролей
const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

// Форматирование цены
const formatPrice = (price) => Math.floor(price);

// Генерация номера заказа
const generateOrderNumber = async (getLastOrderNumberFn) => {
    const last = await getLastOrderNumberFn();
    const date = new Date();
    const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const counter = last ? parseInt(last.split('-')[3]) + 1 : 1;
    return `ORD-${ymd}-${String(counter).padStart(3, '0')}`;
};

// Валидация доставки
const validateDelivery = (delivery_type, delivery_address) => {
    if (!delivery_type || !['courier', 'pickup'].includes(delivery_type)) {
        throw new Error('Укажите корректный тип доставки');
    }
    if (delivery_type === 'courier' && !delivery_address) {
        throw new Error('Укажите адрес доставки');
    }
    return { deliveryPrice: delivery_type === 'courier' ? 400 : 0 };
};

module.exports = {
    generateToken,
    hashPassword,
    comparePassword,
    formatPrice,
    generateOrderNumber,
    validateDelivery
};