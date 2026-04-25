const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { generateOrderNumber, validateDelivery } = require('../utils/helpers');

const createOrder = async (req, res) => {
    try {
        const { delivery_type, delivery_address } = req.body;
        const { deliveryPrice } = validateDelivery(delivery_type, delivery_address);
        
        const cart = await Cart.getByUserId(req.user.id);
        if (!cart) return res.status(400).json({ error: 'Корзина пуста' });
        
        const cartItems = await Cart.getItems(cart.cart_id);
        if (cartItems.length === 0) return res.status(400).json({ error: 'Корзина пуста' });
        
        let subtotal = 0;
        const orderItems = [];
        
        for (const item of cartItems) {
            const maxBouquets = await Product.getMaxAvailableBouquets(item.product_id, item.flowers_per_bouquet);
            if (item.bouquet_count > maxBouquets) {
                return res.status(400).json({ error: `Недостаточно "${item.name}". Доступно: ${maxBouquets}` });
            }
            const itemTotal = item.bouquet_count * parseFloat(item.price_at_time);
            subtotal += itemTotal;
            orderItems.push({
                product_id: item.product_id,
                product_name: item.name,
                price_per_bouquet: item.price_at_time,
                bouquet_count: item.bouquet_count,
                flowers_per_bouquet: item.flowers_per_bouquet,
                is_mix: item.is_mix
            });
        }
        
        const order = await Order.create({
            user_id: req.user.id,
            order_number: await generateOrderNumber(() => Order.getLastOrderNumber()),
            subtotal,
            delivery_type,
            delivery_price: deliveryPrice,
            total_price: subtotal + deliveryPrice,
            delivery_address: delivery_type === 'courier' ? delivery_address : null
        });
        
        for (const item of orderItems) {
            await Order.addItem(order.order_id, item);
        }
        
        await Cart.clear(cart.cart_id);
        res.status(201).json({ message: 'Заказ создан', order: await Order.getById(order.order_id, req.user.id) });
    } catch (error) {
        console.error(error);
        const status = error.message.includes('Укажите') ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.getByUserId(req.user.id);
        const ordersWithItems = await Promise.all(orders.map(o => Order.getById(o.order_id, req.user.id)));
        res.json(ordersWithItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении заказов' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.getById(parseInt(req.params.id), req.user.id);
        if (!order) return res.status(404).json({ error: 'Заказ не найден' });
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении заказа' });
    }
};

const repeatOrder = async (req, res) => {
    try {
        const order = await Order.getById(parseInt(req.params.id), req.user.id);
        if (!order) return res.status(404).json({ error: 'Заказ не найден' });
        
        const cart = await Cart.getOrCreate(req.user.id);
        
        for (const item of order.items) {
            const maxBouquets = await Product.getMaxAvailableBouquets(item.product_id, item.flowers_per_bouquet);
            if (maxBouquets > 0) {
                const priceAtTime = await Product.calculatePrice(item.product_id, item.flowers_per_bouquet);
                await Cart.addItem(cart.cart_id, item.product_id, Math.min(item.bouquet_count, maxBouquets), item.flowers_per_bouquet, priceAtTime);
            }
        }
        
        res.json({ message: 'Товары добавлены в корзину' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при повторении заказа' });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        if (!(await Order.isCancellable(orderId, req.user.id))) {
            return res.status(400).json({ error: 'Заказ нельзя отменить' });
        }
        const order = await Order.updateStatus(orderId, req.user.id, 'cancelled');
        res.json({ message: 'Заказ отменён', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при отмене заказа' });
    }
};

module.exports = { createOrder, getOrders, getOrderById, repeatOrder, cancelOrder };