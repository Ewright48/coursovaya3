const pool = require('../config/database');
const Product = require('../models/Product');

// GET /api/products - список товаров с фильтрацией
const getProducts = async (req, res) => {
    try {
        const {
            min_price,
            max_price,
            min_flowers,
            max_flowers,
            flower_ids,
            color_ids,
            sort = 'popular',
            page = 1,
            limit = 12
        } = req.query;
        
        // Парсинг фильтров
        const filters = {
            min_price: min_price ? parseFloat(min_price) : null,
            max_price: max_price ? parseFloat(max_price) : null,
            min_flowers: min_flowers ? parseInt(min_flowers) : null,
            max_flowers: max_flowers ? parseInt(max_flowers) : null,
            flower_ids: flower_ids ? flower_ids.split(',').map(Number) : null,
            color_ids: color_ids ? color_ids.split(',').map(Number) : null
        };
        
        const offset = (page - 1) * limit;
        
        let productsData = await Product.getAll(filters, sort, parseInt(limit), offset);
        
        // Фильтр по цене
        if (filters.min_price || filters.max_price) {
            const productsWithPrice = await Promise.all(
                productsData.map(async (product) => {
                    const price = await Product.calculatePrice(product.product_id, 9);
                    return { ...product, calculatedPrice: price };
                })
            );
            
            productsData = productsWithPrice.filter(product => {
                if (filters.min_price && product.calculatedPrice < filters.min_price) return false;
                if (filters.max_price && product.calculatedPrice > filters.max_price) return false;
                return true;
            });
        }
        
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
        
        const total = await Product.getCount(filters);
        
        res.json({
            items: products,
            total: total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Ошибка в getProducts:', error);
        res.status(500).json({ error: 'Ошибка при получении товаров' });
    }
};

// GET /api/products/:id - для карточки товара
const getProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        
        const product = await Product.getById(productId);
        
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        
        const defaultPrice = await Product.calculatePrice(productId, 9);
        const presetAmounts = await Product.getPresetAmounts(productId);
        const maxFlowersInStock = await Product.getMaxFlowersInStock(productId);
        
        const response = {
            id: product.product_id,
            title: product.name,
            isMix: product.is_mix,
            discount: product.discount,
            total_flowers: product.total_flowers,
            image: product.image_url,
            pricePerFlower: product.flowers.length > 0 ? product.flowers[0].price_per_flower : 0,
            inStock: maxFlowersInStock,
            maxBouquets: 1,
            presetAmounts: presetAmounts,
            composition: product.flowers.map(f => `${f.flower_name} - ${f.quantity_in_mix} шт`),
            packaging: product.packaging.map(p => p.packaging_name),
            decoration: product.decoration.map(d => d.decoration_name),
            defaultPrice: defaultPrice
        };
        
        res.json(response);
    } catch (error) {
        console.error('Ошибка в getProductById:', error);
        res.status(500).json({ error: 'Ошибка при получении товара' });
    }
};

// GET /api/filters/flowers - список цветов для фильтра
const getFilterFlowers = async (req, res) => {
    try {
        const query = `
            SELECT 
                f.flower_id,
                f.flower_name,
                COUNT(DISTINCT pf.product_id) as product_count
            FROM Flowers f
            LEFT JOIN Product_Flowers pf ON f.flower_id = pf.flower_id
            GROUP BY f.flower_id, f.flower_name
            ORDER BY f.flower_name
        `;
        const result = await pool.query(query);
        
        const flowers = {};
        result.rows.forEach(row => {
            flowers[row.flower_name] = parseInt(row.product_count);
        });
        
        res.json(flowers);
    } catch (error) {
        console.error('Ошибка в getFilterFlowers:', error);
        res.status(500).json({ error: 'Ошибка при получении фильтра цветов' });
    }
};

// GET /api/filters/colors - список цветов букета для фильтра
const getFilterColors = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.color_id,
                c.color_name,
                COUNT(DISTINCT pc.product_id) as product_count
            FROM Colors c
            LEFT JOIN Product_Colors pc ON c.color_id = pc.color_id
            GROUP BY c.color_id, c.color_name
            ORDER BY c.color_name
        `;
        const result = await pool.query(query);
        
        const colors = {};
        result.rows.forEach(row => {
            colors[row.color_name] = parseInt(row.product_count);
        });
        
        res.json(colors);
    } catch (error) {
        console.error('Ошибка в getFilterColors:', error);
        res.status(500).json({ error: 'Ошибка при получении фильтра цветов' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    getFilterFlowers,
    getFilterColors
};