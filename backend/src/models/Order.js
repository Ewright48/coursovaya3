const pool = require('../config/database');

const Order = {
    async create(data) {
        const { user_id, order_number, subtotal, delivery_type, delivery_price, total_price, delivery_address } = data;
        const result = await pool.query(
            `INSERT INTO Orders (user_id, order_number, status, subtotal, delivery_type, delivery_price, total_price, delivery_address)
             VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7) RETURNING *`,
            [user_id, order_number, subtotal, delivery_type, delivery_price, total_price, delivery_address]
        );
        return result.rows[0];
    },
    
    async addItem(orderId, item) {
        const { product_id, product_name, price_per_bouquet, bouquet_count, flowers_per_bouquet, is_mix } = item;
        const result = await pool.query(
            `INSERT INTO Order_Items (order_id, product_id, product_name, price_per_bouquet, bouquet_count, flowers_per_bouquet, is_mix)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [orderId, product_id, product_name, price_per_bouquet, bouquet_count, flowers_per_bouquet, is_mix]
        );
        return result.rows[0];
    },
    
    async getByUserId(userId) {
        const result = await pool.query(
            `SELECT * FROM Orders WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    },
    
    async getById(orderId, userId) {
        const orderResult = await pool.query(
            `SELECT * FROM Orders WHERE order_id = $1 AND user_id = $2`,
            [orderId, userId]
        );
        if (!orderResult.rows.length) return null;
        
        const itemsResult = await pool.query(
            `SELECT order_item_id, product_id, product_name, price_per_bouquet, bouquet_count, flowers_per_bouquet, is_mix
             FROM Order_Items WHERE order_id = $1`,
            [orderId]
        );
        return { ...orderResult.rows[0], items: itemsResult.rows };
    },
    
    async updateStatus(orderId, userId, status) {
        const result = await pool.query(
            `UPDATE Orders SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE order_id = $2 AND user_id = $3 RETURNING *`,
            [status, orderId, userId]
        );
        return result.rows[0] || null;
    },
    
    async getLastOrderNumber() {
        const result = await pool.query(`SELECT order_number FROM Orders ORDER BY order_id DESC LIMIT 1`);
        return result.rows[0]?.order_number || null;
    },
    
    async isCancellable(orderId, userId) {
        const result = await pool.query(`SELECT status FROM Orders WHERE order_id = $1 AND user_id = $2`, [orderId, userId]);
        return result.rows.length && ['pending', 'confirmed'].includes(result.rows[0].status);
    }
};

module.exports = Order;