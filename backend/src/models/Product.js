const pool = require('../config/database');

const Product = {
    async findAll(filters = {}) {
        let query = 'SELECT * FROM products WHERE 1=1';
        const values = [];
        let index = 1;
        
        if (filters.minPrice) {
            query += ` AND price >= $${index++}`;
            values.push(filters.minPrice);
        }
        if (filters.maxPrice) {
            query += ` AND price <= $${index++}`;
            values.push(filters.maxPrice);
        }
        if (filters.minFlowers) {
            query += ` AND total_flowers >= $${index++}`;
            values.push(filters.minFlowers);
        }
        if (filters.maxFlowers) {
            query += ` AND total_flowers <= $${index++}`;
            values.push(filters.maxFlowers);
        }
        if (filters.isMix !== undefined) {
            query += ` AND is_mix = $${index++}`;
            values.push(filters.isMix);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const result = await pool.query(query, values);
        return result.rows;
    },
    
    async findById(id) {
        const result = await pool.query('SELECT * FROM products WHERE product_id = $1', [id]);
        return result.rows[0];
    },
    
    async getComposition(id) {
        const result = await pool.query(`
            SELECT f.flower_name, pf.quantity_in_mix, f.price_per_flower
            FROM product_flowers pf
            JOIN flowers f ON pf.flower_id = f.flower_id
            WHERE pf.product_id = $1
        `, [id]);
        return result.rows;
    }
};

module.exports = Product;