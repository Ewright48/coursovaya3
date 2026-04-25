const Cart = require('../models/Cart');
const Product = require('../models/Product');

const formatCartItem = (item, maxBouquets, totalPrice) => ({
    cart_item_id: item.cart_item_id,
    product_id: item.product_id,
    name: item.name,
    image: item.image_url,
    bouquet_count: item.bouquet_count,
    flowers_per_bouquet: item.flowers_per_bouquet,
    price_at_time: parseFloat(item.price_at_time),
    total_price: totalPrice,
    max_bouquets: maxBouquets,
    is_mix: item.is_mix
});

const getCartResponse = async (cartId) => {
    const items = await Cart.getItems(cartId);
    const itemsWithMax = await Promise.all(items.map(async (item) => {
        const maxBouquets = await Product.getMaxAvailableBouquets(item.product_id, item.flowers_per_bouquet);
        return formatCartItem(item, maxBouquets, item.bouquet_count * parseFloat(item.price_at_time));
    }));
    const totalPrice = await Cart.getTotalPrice(cartId);
    return { items: itemsWithMax, total_price: totalPrice, items_count: itemsWithMax.length };
};

const getCart = async (req, res) => {
    try {
        const cart = await Cart.getOrCreate(req.user.id);
        res.json(await getCartResponse(cart.cart_id));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении корзины' });
    }
};

const addToCart = async (req, res) => {
    try {
        const { product_id, flowers_per_bouquet, bouquet_count = 1 } = req.body;
        
        if (!product_id || !flowers_per_bouquet) {
            return res.status(400).json({ error: 'Не указаны обязательные поля' });
        }
        
        const product = await Product.getBasicInfo(product_id);
        if (!product) return res.status(404).json({ error: 'Товар не найден' });
        
        const maxBouquets = await Product.getMaxAvailableBouquets(product_id, flowers_per_bouquet);
        if (bouquet_count > maxBouquets) {
            return res.status(400).json({ error: `Доступно ${maxBouquets} букетов` });
        }
        
        const priceAtTime = await Product.calculatePrice(product_id, flowers_per_bouquet);
        const cart = await Cart.getOrCreate(req.user.id);
        await Cart.addItem(cart.cart_id, product_id, bouquet_count, flowers_per_bouquet, priceAtTime);
        
        res.status(201).json(await getCartResponse(cart.cart_id));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при добавлении в корзину' });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { bouquet_count } = req.body;
        const itemId = parseInt(req.params.itemId);
        
        if (!bouquet_count || bouquet_count < 1) {
            return res.status(400).json({ error: 'Некорректное количество' });
        }
        
        const cart = await Cart.getByUserId(req.user.id);
        if (!cart) return res.status(404).json({ error: 'Корзина не найдена' });
        
        const items = await Cart.getItems(cart.cart_id);
        const item = items.find(i => i.cart_item_id === itemId);
        if (!item) return res.status(404).json({ error: 'Позиция не найдена' });
        
        const maxBouquets = await Product.getMaxAvailableBouquets(item.product_id, item.flowers_per_bouquet);
        if (bouquet_count > maxBouquets) {
            return res.status(400).json({ error: `Доступно только ${maxBouquets} букетов` });
        }
        
        await Cart.updateItemQuantity(itemId, bouquet_count);
        res.json(await getCartResponse(cart.cart_id));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при обновлении корзины' });
    }
};

const removeCartItem = async (req, res) => {
    try {
        const itemId = parseInt(req.params.itemId);
        const cart = await Cart.getByUserId(req.user.id);
        if (!cart) return res.status(404).json({ error: 'Корзина не найдена' });
        
        await Cart.removeItem(itemId);
        res.json(await getCartResponse(cart.cart_id));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при удалении из корзины' });
    }
};

const clearCart = async (req, res) => {
    try {
        const cart = await Cart.getByUserId(req.user.id);
        if (cart) await Cart.clear(cart.cart_id);
        res.json({ items: [], total_price: 0, items_count: 0, message: 'Корзина очищена' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при очистке корзины' });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };