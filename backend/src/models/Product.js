const pool = require('../config/database');

const Product = {
    async getPopular(limit = 6) {
        const query = `
            SELECT 
                product_id, 
                name, 
                image_url, 
                total_flowers, 
                is_mix, 
                discount
            FROM Products
            ORDER BY was_ordered DESC
            LIMIT $1
        `;
        const result = await pool.query(query, [limit]);
        return result.rows;
    },
    
    async getNew(limit = 4) {
        const query = `
            SELECT 
                product_id, 
                name, 
                image_url, 
                total_flowers, 
                is_mix, 
                discount
            FROM Products
            ORDER BY created_at DESC
            LIMIT $1
        `;
        const result = await pool.query(query, [limit]);
        return result.rows;
    },
    
    // Расчет цены одного букета
    async calculatePrice(productId, flowersCount = 9) {
        const productQuery = `
            SELECT is_mix, discount
            FROM Products
            WHERE product_id = $1
        `;
        const productResult = await pool.query(productQuery, [productId]);
        
        if (productResult.rows.length === 0) return 0;
        
        const product = productResult.rows[0];
        let basePrice = 0;
        
        if (!product.is_mix) {
            // Моно
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
                basePrice = pricePerFlower * flowersCount;
            }
        } else {
            // Микс
            const flowersQuery = `
                SELECT SUM(f.price_per_flower * pf.quantity_in_mix) as total
                FROM Product_Flowers pf
                JOIN Flowers f ON pf.flower_id = f.flower_id
                WHERE pf.product_id = $1
            `;
            const flowersResult = await pool.query(flowersQuery, [productId]);
            basePrice = parseFloat(flowersResult.rows[0].total) || 0;
        }
        
        const packagingQuery = `
            SELECT COALESCE(SUM(p.price), 0) as total
            FROM Product_Packaging pp
            JOIN Packaging p ON pp.packaging_id = p.packaging_id
            WHERE pp.product_id = $1
        `;
        const packagingResult = await pool.query(packagingQuery, [productId]);
        basePrice += parseFloat(packagingResult.rows[0].total) || 0;
        
        const decorationQuery = `
            SELECT COALESCE(SUM(d.price * pd.quantity), 0) as total
            FROM Product_Decoration pd
            JOIN Decoration d ON pd.decoration_id = d.decoration_id
            WHERE pd.product_id = $1
        `;
        const decorationResult = await pool.query(decorationQuery, [productId]);
        basePrice += parseFloat(decorationResult.rows[0].total) || 0;
        
        const finalPrice = basePrice * (1 - product.discount / 100);
        
        return Math.floor(finalPrice);
    }
};

module.exports = Product;