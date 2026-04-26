const Product = require('../models/Product');
const pool = require('../config/database');

const getProducts = async (req, res) => {
    try {
        const { min_price, max_price, min_flowers, max_flowers, flower_ids, color_ids, sort = 'popular', page = 1, limit = 12 } = req.query;
        
        const filters = {
            min_price: min_price ? parseFloat(min_price) : null,
            max_price: max_price ? parseFloat(max_price) : null,
            min_flowers: min_flowers ? parseInt(min_flowers) : null,
            max_flowers: max_flowers ? parseInt(max_flowers) : null,
            flower_ids: flower_ids?.split(',').map(Number),
            color_ids: color_ids?.split(',').map(Number)
        };
        
        let productsData = await Product.getAll(filters, sort, parseInt(limit), (page - 1) * limit);
        
        if (filters.min_price || filters.max_price) {
            const withPrice = [];
            for (const p of productsData) {
                const price = await Product.calculatePrice(p.product_id, p.total_flowers);
                if ((!filters.min_price || price >= filters.min_price) &&
                    (!filters.max_price || price <= filters.max_price)) {
                    withPrice.push({ ...p, calculatedPrice: price });
                }
            }
            productsData = withPrice;
        }
        
        const products = [];
        for (const p of productsData) {
            const price = await Product.calculatePrice(p.product_id, p.total_flowers);
            products.push({
                id: p.product_id,
                name: p.name,
                price: price,
                image: p.image_url,
                flowersCount: p.total_flowers,
                isMix: p.is_mix
            });
        }
        
        const total = await Product.getCount(filters);
        
        res.json({
            items: products,
            total: total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении товаров' });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.getById(parseInt(req.params.id));
        if (!product) return res.status(404).json({ error: 'Товар не найден' });
        
        const presetAmounts = await Product.getPresetAmounts(product.product_id);
        const maxFlowersInStock = await Product.getMaxFlowersInStock(product.product_id);
        const defaultPrice = await Product.calculatePrice(product.product_id, product.total_flowers);
        
        res.json({
            id: product.product_id,
            title: product.name,
            isMix: product.is_mix,
            discount: product.discount,
            total_flowers: product.total_flowers,
            image: product.image_url,
            pricePerFlower: product.flowers[0]?.price_per_flower || 0,
            inStock: maxFlowersInStock,
            maxBouquets: 1,
            presetAmounts: presetAmounts,
            composition: product.flowers.map(f => `${f.flower_name} - ${f.quantity_in_mix} шт`),
            packaging: product.packaging.map(p => p.packaging_name),
            decoration: product.decoration.map(d => d.decoration_name),
            defaultPrice: parseFloat(defaultPrice)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении товара' });
    }
};

const getFilterFlowers = async (req, res) => {
    try {
        const query = `
            SELECT 
                f.flower_id as id, 
                f.flower_name as name, 
                COUNT(DISTINCT pf.product_id) as count
            FROM Flowers f
            LEFT JOIN Product_Flowers pf ON f.flower_id = pf.flower_id
            GROUP BY f.flower_id, f.flower_name
            ORDER BY f.flower_name
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка в getFilterFlowers:', error);
        res.status(500).json({ error: 'Ошибка при получении фильтра цветов' });
    }
};

const getFilterColors = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.color_id as id, 
                c.color_name as name, 
                COUNT(DISTINCT pc.product_id) as count
            FROM Colors c
            LEFT JOIN Product_Colors pc ON c.color_id = pc.color_id
            GROUP BY c.color_id, c.color_name
            ORDER BY c.color_name
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка в getFilterColors:', error);
        res.status(500).json({ error: 'Ошибка при получении фильтра цветов' });
    }
};

module.exports = { getProducts, getProductById, getFilterFlowers, getFilterColors };