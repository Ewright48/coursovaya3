const Product = require('../models/Product');

// GET /api/home/popular
const getPopularProducts = async (req, res) => {
    try {
        const productsData = await Product.getPopular(6);
        
        const products = await Promise.all(
            productsData.map(async (product) => {
                const price = await Product.calculatePrice(product.product_id, 9);
                return {
                    id: product.product_id,
                    name: product.name,
                    price: price,
                    image: product.image_url,
                    flowersCount: product.total_flowers,
                    isMix: product.is_mix
                };
            })
        );
        
        res.json(products);
    } catch (error) {
        console.error('Ошибка в getPopularProducts:', error);
        res.status(500).json({ error: 'Ошибка при получении популярных товаров' });
    }
};

// GET /api/home/new
const getNewProducts = async (req, res) => {
    try {
        const productsData = await Product.getNew(4);
        
        // Цена по умолчанию за 9 цветов
        const products = await Promise.all(
            productsData.map(async (product) => {
                const price = await Product.calculatePrice(product.product_id, 9);
                return {
                    id: product.product_id,
                    name: product.name,
                    price: price,
                    image: product.image_url,
                    flowersCount: product.total_flowers,
                    isMix: product.is_mix
                };
            })
        );
        
        res.json(products);
    } catch (error) {
        console.error('Ошибка в getNewProducts:', error);
        res.status(500).json({ error: 'Ошибка при получении новинок' });
    }
};

module.exports = {
    getPopularProducts,
    getNewProducts
};