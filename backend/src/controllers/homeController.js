const Product = require('../models/Product');

const getPopularProducts = async (req, res) => {
    try {
        const productsData = await Product.getPopular(4);
        
        const products = [];
        for (const product of productsData) {
            const price = await Product.calculatePrice(product.product_id, product.total_flowers);
            products.push({
                id: product.product_id,
                name: product.name,
                price: price,
                image: product.image_url,
                flowersCount: product.total_flowers,
                isMix: product.is_mix
            });
        }
        
        res.json(products);
    } catch (error) {
        console.error('Ошибка в getPopularProducts:', error);
        res.status(500).json({ error: 'Ошибка при получении популярных товаров' });
    }
};

const getNewProducts = async (req, res) => {
    try {
        const productsData = await Product.getNew(4);
        
        const products = [];
        for (const product of productsData) {
            const price = await Product.calculatePrice(product.product_id, product.total_flowers);
            products.push({
                id: product.product_id,
                name: product.name,
                price: price,
                image: product.image_url,
                flowersCount: product.total_flowers,
                isMix: product.is_mix
            });
        }
        
        res.json(products);
    } catch (error) {
        console.error('Ошибка в getNewProducts:', error);
        res.status(500).json({ error: 'Ошибка при получении новинок' });
    }
};

module.exports = { getPopularProducts, getNewProducts };