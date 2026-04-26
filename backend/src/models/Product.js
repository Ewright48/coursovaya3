const pool = require('../config/database');

// Вспомогательные функции

const getBasicInfo = async (productId) => {
    const result = await pool.query(
        `SELECT product_id, name, is_mix, discount, total_flowers, image_url, default_price
         FROM Products WHERE product_id = $1`,
        [productId]
    );
    return result.rows[0] || null;
};

const getRelatedData = async (productId, table, joinTable, joinField, selectFields) => {
    const result = await pool.query(
        `SELECT ${selectFields}
         FROM ${joinTable} jt
         JOIN ${table} t ON jt.${joinField} = t.${joinField}
         WHERE jt.product_id = $1`,
        [productId]
    );
    return result.rows;
};

const getFlowersCost = async (productId, isMix, flowersCount) => {
    if (!isMix) {
        const result = await pool.query(
            `SELECT f.price_per_flower
             FROM Product_Flowers pf JOIN Flowers f ON pf.flower_id = f.flower_id
             WHERE pf.product_id = $1 LIMIT 1`,
            [productId]
        );
        return result.rows[0] ? result.rows[0].price_per_flower * (flowersCount || 0) : 0;
    }
    
    const result = await pool.query(
        `SELECT COALESCE(SUM(f.price_per_flower * pf.quantity_in_mix), 0) as total
         FROM Product_Flowers pf JOIN Flowers f ON pf.flower_id = f.flower_id
         WHERE pf.product_id = $1`,
        [productId]
    );
    return parseFloat(result.rows[0].total);
};


// Основные
const Product = {
    async calculatePrice(productId, flowersCount) {
        const product = await getBasicInfo(productId);
        if (!product) return 0;
        
        const flowersCost = await getFlowersCost(productId, product.is_mix, flowersCount);
        
        const [packagingCost, decorationCost] = await Promise.all([
            pool.query(`SELECT COALESCE(SUM(price), 0) as total
                FROM Product_Packaging pp JOIN Packaging p ON pp.packaging_id = p.packaging_id
                WHERE pp.product_id = $1`, [productId]),
            pool.query(`SELECT COALESCE(SUM(price * quantity), 0) as total
                FROM Product_Decoration pd JOIN Decoration d ON pd.decoration_id = d.decoration_id
                WHERE pd.product_id = $1`, [productId])
        ]);
        
        const total = flowersCost + parseFloat(packagingCost.rows[0].total) + parseFloat(decorationCost.rows[0].total);
        return Math.floor(total * (1 - product.discount / 100));
    },
    
    async getPopular(limit = 6) {
        const result = await pool.query(
            `SELECT product_id, name, image_url, total_flowers, is_mix, discount, was_ordered, created_at
             FROM Products ORDER BY was_ordered DESC LIMIT $1`,
            [limit]
        );
        return result.rows;
    },
    
    async getNew(limit = 4) {
        const result = await pool.query(
            `SELECT product_id, name, image_url, total_flowers, is_mix, discount, was_ordered, created_at
             FROM Products ORDER BY created_at DESC LIMIT $1`,
            [limit]
        );
        return result.rows;
    },
    
    async getAll(filters = {}, sort = 'popular', limit = 12, offset = 0) {
        const conditions = [];
        const values = [];
        let idx = 1;
        
        if (filters.min_flowers) { conditions.push(`p.total_flowers >= $${idx++}`); values.push(filters.min_flowers); }
        if (filters.max_flowers) { conditions.push(`p.total_flowers <= $${idx++}`); values.push(filters.max_flowers); }
        if (filters.flower_ids?.length) {
            conditions.push(`EXISTS (SELECT 1 FROM Product_Flowers pf WHERE pf.product_id = p.product_id AND pf.flower_id = ANY($${idx++}::int[]))`);
            values.push(filters.flower_ids);
        }
        if (filters.color_ids?.length) {
            conditions.push(`EXISTS (SELECT 1 FROM Product_Colors pc WHERE pc.product_id = p.product_id AND pc.color_id = ANY($${idx++}::int[]))`);
            values.push(filters.color_ids);
        }
        
        const sortMap = { popular: 'p.was_ordered DESC', new: 'p.created_at DESC', price_asc: 'p.default_price ASC', price_desc: 'p.default_price DESC' };
        
        const query = `
            SELECT p.product_id, p.name, p.image_url, p.total_flowers, p.is_mix, p.discount, p.was_ordered, p.created_at, p.default_price
            FROM Products p WHERE ${conditions.join(' AND ') || '1=1'}
            ORDER BY ${sortMap[sort] || 'p.was_ordered DESC'}
            LIMIT $${idx++} OFFSET $${idx++}
        `;
        values.push(limit, offset);
        
        const result = await pool.query(query, values);
        return result.rows;
    },
    
    async getCount(filters = {}) {
        const conditions = [];
        const values = [];
        let idx = 1;
        
        if (filters.min_flowers) { conditions.push(`total_flowers >= $${idx++}`); values.push(filters.min_flowers); }
        if (filters.max_flowers) { conditions.push(`total_flowers <= $${idx++}`); values.push(filters.max_flowers); }
        if (filters.flower_ids?.length) {
            conditions.push(`EXISTS (SELECT 1 FROM Product_Flowers pf WHERE pf.product_id = product_id AND pf.flower_id = ANY($${idx++}::int[]))`);
            values.push(filters.flower_ids);
        }
        if (filters.color_ids?.length) {
            conditions.push(`EXISTS (SELECT 1 FROM Product_Colors pc WHERE pc.product_id = product_id AND pc.color_id = ANY($${idx++}::int[]))`);
            values.push(filters.color_ids);
        }
        
        const result = await pool.query(
            `SELECT COUNT(*) as total FROM Products WHERE ${conditions.join(' AND ') || '1=1'}`,
            values
        );
        return parseInt(result.rows[0].total);
    },
    
    async getById(productId) {
        const query = `
            SELECT product_id, name, is_mix, discount, total_flowers, image_url, default_price
            FROM Products
            WHERE product_id = $1
        `;
        const productResult = await pool.query(query, [productId]);
        
        if (productResult.rows.length === 0) return null;
        
        const product = productResult.rows[0];
        
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
    
    async getBasicInfo(productId) { return getBasicInfo(productId); },
    
    async getPresetAmounts(productId) {
        const product = await getBasicInfo(productId);
        if (!product) return [5, 9, 11, 15, 21, 25, 35];
        
        const allPresets = [3, 5, 7, 9, 11, 15, 21, 25, 35, 51];
        if (product.is_mix) return [product.total_flowers];
        
        const presets = allPresets.filter(p => p <= product.total_flowers);
        const nextPreset = allPresets.find(p => p > product.total_flowers);
        if (nextPreset) presets.push(nextPreset);
        return presets;
    },
    
    async getMaxAvailableBouquets(productId, flowersPerBouquet = null) {
        const product = await getBasicInfo(productId);
        if (!product) return 0;
        
        const result = await pool.query(
            `SELECT f.in_stock, pf.quantity_in_mix
             FROM Product_Flowers pf JOIN Flowers f ON pf.flower_id = f.flower_id
             WHERE pf.product_id = $1`,
            [productId]
        );
        if (result.rows.length === 0) return 0;
        
        if (!product.is_mix) {
            const { in_stock, quantity_in_mix } = result.rows[0];
            const needed = flowersPerBouquet || quantity_in_mix;
            return needed === 0 ? in_stock : Math.floor(in_stock / needed);
        }
        
        return Math.min(...result.rows.map(row => Math.floor(row.in_stock / row.quantity_in_mix)));
    },
    
    async getMaxFlowersInStock(productId) {
        const product = await getBasicInfo(productId);
        if (!product) return 0;
        
        if (!product.is_mix) {
            const result = await pool.query(
                `SELECT f.in_stock FROM Product_Flowers pf JOIN Flowers f ON pf.flower_id = f.flower_id
                 WHERE pf.product_id = $1 LIMIT 1`,
                [productId]
            );
            return result.rows[0]?.in_stock || 0;
        }
        
        const maxBouquets = await Product.getMaxAvailableBouquets(productId);
        return maxBouquets * product.total_flowers;
    }
};

module.exports = Product;