const pool = require('../config/database');

// Вспомогательная функция для получения базовой информации
const getBasicInfo = async (productId) => {
    const query = `
        SELECT product_id, name, is_mix, discount, total_flowers, image_url
        FROM Products
        WHERE product_id = $1
    `;
    const result = await pool.query(query, [productId]);
    return result.rows[0] || null;
};

// Вспомогательная для расчёта базовой цены (цветы + упаковка + декор)
const calculateBasePrice = async (productId, flowersCount = null) => {
    const product = await getBasicInfo(productId);
    if (!product) return 0;
    
    let basePrice = 0;
    
    if (!product.is_mix) {
        const flowerQuery = `
            SELECT f.price_per_flower
            FROM Product_Flowers pf
            JOIN Flowers f ON pf.flower_id = f.flower_id
            WHERE pf.product_id = $1
            LIMIT 1
        `;
        const flowerResult = await pool.query(flowerQuery, [productId]);
        
        if (flowerResult.rows[0]) {
            const pricePerFlower = parseFloat(flowerResult.rows[0].price_per_flower);
            const count = flowersCount !== null ? flowersCount : product.total_flowers;
            basePrice = pricePerFlower * count;
        }
    } else {
        const flowersQuery = `
            SELECT SUM(f.price_per_flower * pf.quantity_in_mix) as total
            FROM Product_Flowers pf
            JOIN Flowers f ON pf.flower_id = f.flower_id
            WHERE pf.product_id = $1
        `;
        const flowersResult = await pool.query(flowersQuery, [productId]);
        basePrice = parseFloat(flowersResult.rows[0].total) || 0;
    }
    
    // Упаковка
    const packagingQuery = `
        SELECT COALESCE(SUM(p.price), 0) as total
        FROM Product_Packaging pp
        JOIN Packaging p ON pp.packaging_id = p.packaging_id
        WHERE pp.product_id = $1
    `;
    const packagingResult = await pool.query(packagingQuery, [productId]);
    basePrice += parseFloat(packagingResult.rows[0].total) || 0;
    
    // Декор
    const decorationQuery = `
        SELECT COALESCE(SUM(d.price * pd.quantity), 0) as total
        FROM Product_Decoration pd
        JOIN Decoration d ON pd.decoration_id = d.decoration_id
        WHERE pd.product_id = $1
    `;
    const decorationResult = await pool.query(decorationQuery, [productId]);
    basePrice += parseFloat(decorationResult.rows[0].total) || 0;
    
    return { basePrice, discount: product.discount };
};

// Вспомогательное для получения товаров с базовыми полями
const getProductsWithFields = async (orderBy, limit, filters = {}) => {
    let query = `
        SELECT 
            product_id, 
            name, 
            image_url, 
            total_flowers, 
            is_mix, 
            discount,
            was_ordered,
            created_at
        FROM Products
        WHERE 1=1
    `;
    const values = [];
    let index = 1;
    
    if (filters.min_flowers) {
        query += ` AND total_flowers >= $${index++}`;
        values.push(filters.min_flowers);
    }
    if (filters.max_flowers) {
        query += ` AND total_flowers <= $${index++}`;
        values.push(filters.max_flowers);
    }
    
    query += ` ORDER BY ${orderBy} DESC LIMIT $${index++}`;
    values.push(limit);
    
    const result = await pool.query(query, values);
    return result.rows;
};



const Product = {
    // Расчет цены одного букета
    async calculatePrice(productId, flowersCount = 9) {
        const { basePrice, discount } = await calculateBasePrice(productId, flowersCount);
        return Math.floor(basePrice * (1 - discount / 100));
    },
    
    // Популярные товары
    async getPopular(limit = 6) {
        return getProductsWithFields('was_ordered', limit);
    },
    
    // Новинки
    async getNew(limit = 4) {
        return getProductsWithFields('created_at', limit);
    },
    
    // Получить все товары с фильтрацией и сортировкой
    async getAll(filters = {}, sort = 'popular', limit = 12, offset = 0) {
        let query = `
            SELECT 
                p.product_id, 
                p.name, 
                p.image_url, 
                p.total_flowers, 
                p.is_mix, 
                p.discount,
                p.was_ordered,
                p.created_at
            FROM Products p
            WHERE 1=1
        `;
        const values = [];
        let index = 1;
        
        if (filters.min_flowers) {
            query += ` AND p.total_flowers >= $${index++}`;
            values.push(filters.min_flowers);
        }
        if (filters.max_flowers) {
            query += ` AND p.total_flowers <= $${index++}`;
            values.push(filters.max_flowers);
        }
        
        if (filters.flower_ids && filters.flower_ids.length > 0) {
            query += ` AND EXISTS (
                SELECT 1 FROM Product_Flowers pf 
                WHERE pf.product_id = p.product_id 
                AND pf.flower_id = ANY($${index++}::int[])
            )`;
            values.push(filters.flower_ids);
        }
        
        if (filters.color_ids && filters.color_ids.length > 0) {
            query += ` AND EXISTS (
                SELECT 1 FROM Product_Colors pc 
                WHERE pc.product_id = p.product_id 
                AND pc.color_id = ANY($${index++}::int[])
            )`;
            values.push(filters.color_ids);
        }
        
        // Сортировка
        const sortMap = {
            'popular': 'p.was_ordered DESC',
            'new': 'p.created_at DESC',
            'price_asc': 'p.price_per_bouquet ASC',
            'price_desc': 'p.price_per_bouquet DESC'
        };
        query += ` ORDER BY ${sortMap[sort] || 'p.was_ordered DESC'}`;
        
        query += ` LIMIT $${index++} OFFSET $${index++}`;
        values.push(limit, offset);
        
        const result = await pool.query(query, values);
        return result.rows;
    },
    
    // Получить количество товаров для пагинации
    async getCount(filters = {}) {
        let query = `SELECT COUNT(*) as total FROM Products p WHERE 1=1`;
        const values = [];
        let index = 1;
        
        if (filters.min_flowers) {
            query += ` AND p.total_flowers >= $${index++}`;
            values.push(filters.min_flowers);
        }
        if (filters.max_flowers) {
            query += ` AND p.total_flowers <= $${index++}`;
            values.push(filters.max_flowers);
        }
        
        if (filters.flower_ids && filters.flower_ids.length > 0) {
            query += ` AND EXISTS (
                SELECT 1 FROM Product_Flowers pf 
                WHERE pf.product_id = p.product_id 
                AND pf.flower_id = ANY($${index++}::int[])
            )`;
            values.push(filters.flower_ids);
        }
        
        if (filters.color_ids && filters.color_ids.length > 0) {
            query += ` AND EXISTS (
                SELECT 1 FROM Product_Colors pc 
                WHERE pc.product_id = p.product_id 
                AND pc.color_id = ANY($${index++}::int[])
            )`;
            values.push(filters.color_ids);
        }
        
        const result = await pool.query(query, values);
        return parseInt(result.rows[0].total);
    },
    
    // Получить товар по ID со всеми связями
    async getById(productId) {
        const product = await getBasicInfo(productId);
        if (!product) return null;
        
        // Получение цветов
        const flowersQuery = `
            SELECT 
                f.flower_id, 
                f.flower_name, 
                f.price_per_flower, 
                f.in_stock, 
                pf.quantity_in_mix
            FROM Product_Flowers pf
            JOIN Flowers f ON pf.flower_id = f.flower_id
            WHERE pf.product_id = $1
        `;
        const flowersResult = await pool.query(flowersQuery, [productId]);
        product.flowers = flowersResult.rows;
        
        // Получение упаковки
        const packagingQuery = `
            SELECT 
                p.packaging_id, 
                p.packaging_name, 
                p.price
            FROM Product_Packaging pp
            JOIN Packaging p ON pp.packaging_id = p.packaging_id
            WHERE pp.product_id = $1
        `;
        const packagingResult = await pool.query(packagingQuery, [productId]);
        product.packaging = packagingResult.rows;
        
        // Получение декора
        const decorationQuery = `
            SELECT 
                d.decoration_id, 
                d.decoration_name, 
                d.price, 
                d.in_stock, 
                pd.quantity
            FROM Product_Decoration pd
            JOIN Decoration d ON pd.decoration_id = d.decoration_id
            WHERE pd.product_id = $1
        `;
        const decorationResult = await pool.query(decorationQuery, [productId]);
        product.decoration = decorationResult.rows;
        
        return product;
    },
    
    // Получить базовую информацию о товаре
    async getBasicInfo(productId) {
        return getBasicInfo(productId);
    },
    
    // Предустановленные количества цветов
    async getPresetAmounts(productId) {
        const product = await getBasicInfo(productId);
        if (!product) return [5, 9, 11, 15, 21, 25, 35];
        
        const allPresets = [3, 5, 7, 9, 11, 15, 21, 25, 35, 51];
        
        if (!product.is_mix) {
            const nextPreset = allPresets.find(p => p > product.total_flowers);
            const presets = allPresets.filter(p => p <= product.total_flowers);
            if (nextPreset) presets.push(nextPreset);
            return presets;
        }
        
        return [product.total_flowers];
    },
    
    // Максимальное количество букетов на складе
    async getMaxAvailableBouquets(productId, flowersPerBouquet = null) {
        const product = await getBasicInfo(productId);
        if (!product) return 0;
        
        const flowersQuery = `
            SELECT f.in_stock, pf.quantity_in_mix
            FROM Product_Flowers pf
            JOIN Flowers f ON pf.flower_id = f.flower_id
            WHERE pf.product_id = $1
        `;
        const flowersResult = await pool.query(flowersQuery, [productId]);
        
        if (flowersResult.rows.length === 0) return 0;
        
        if (!product.is_mix) {
            const { in_stock, quantity_in_mix } = flowersResult.rows[0];
            const needed = flowersPerBouquet || quantity_in_mix;
            return needed === 0 ? in_stock : Math.floor(in_stock / needed);
        }
        
        // Микс - минимальное значение по всем цветам
        let maxBouquets = Infinity;
        for (const row of flowersResult.rows) {
            const possible = Math.floor(row.in_stock / row.quantity_in_mix);
            if (possible < maxBouquets) maxBouquets = possible;
        }
        
        return maxBouquets === Infinity ? 0 : maxBouquets;
    },
    
    // Максимальное количество цветов на складе
    async getMaxFlowersInStock(productId) {
        const product = await getBasicInfo(productId);
        if (!product) return 0;
        
        if (!product.is_mix) {
            const flowerQuery = `
                SELECT f.in_stock
                FROM Product_Flowers pf
                JOIN Flowers f ON pf.flower_id = f.flower_id
                WHERE pf.product_id = $1
                LIMIT 1
            `;
            const flowerResult = await pool.query(flowerQuery, [productId]);
            return flowerResult.rows[0]?.in_stock || 0;
        }
        
        const maxBouquets = await Product.getMaxAvailableBouquets(productId);
        return maxBouquets * product.total_flowers;
    }
};

module.exports = Product;