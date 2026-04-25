const pool = require('../config/database');

const Cart = {
    async getByUserId(userId) {
        const result = await pool.query(`SELECT * FROM Carts WHERE user_id = $1`, [userId]);
        return result.rows[0] || null;
    },
    
    async create(userId) {
        const result = await pool.query(`INSERT INTO Carts (user_id) VALUES ($1) RETURNING *`, [userId]);
        return result.rows[0];
    },
    
    async getOrCreate(userId) {
        let cart = await Cart.getByUserId(userId);
        if (!cart) cart = await Cart.create(userId);
        return cart;
    },
    
    async getItems(cartId) {
        const result = await pool.query(
            `SELECT ci.*, p.name, p.image_url, p.is_mix
             FROM Cart_Items ci 
             JOIN Products p ON ci.product_id = p.product_id
             WHERE ci.cart_id = $1 
             ORDER BY ci.created_at DESC`,
            [cartId]
        );
        return result.rows;
    },
    
    async addItem(cartId, productId, bouquetCount, flowersPerBouquet, priceAtTime) {
        const existing = await pool.query(
            `SELECT * FROM Cart_Items 
             WHERE cart_id = $1 AND product_id = $2 AND flowers_per_bouquet = $3`,
            [cartId, productId, flowersPerBouquet]
        );
        
        if (existing.rows.length) {
            const result = await pool.query(
                `UPDATE Cart_Items SET bouquet_count = bouquet_count + $1
                 WHERE cart_item_id = $2 RETURNING *`,
                [bouquetCount, existing.rows[0].cart_item_id]
            );
            return result.rows[0];
        }
        
        const result = await pool.query(
            `INSERT INTO Cart_Items (cart_id, product_id, bouquet_count, flowers_per_bouquet, price_at_time)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [cartId, productId, bouquetCount, flowersPerBouquet, priceAtTime]
        );
        return result.rows[0];
    },
    
    async updateItemQuantity(cartItemId, bouquetCount) {
        const result = await pool.query(
            `UPDATE Cart_Items SET bouquet_count = $1 WHERE cart_item_id = $2 RETURNING *`,
            [bouquetCount, cartItemId]
        );
        return result.rows[0] || null;
    },
    
    async removeItem(cartItemId) {
        const result = await pool.query(`DELETE FROM Cart_Items WHERE cart_item_id = $1 RETURNING *`, [cartItemId]);
        return result.rows[0] || null;
    },
    
    async clear(cartId) {
        await pool.query(`DELETE FROM Cart_Items WHERE cart_id = $1`, [cartId]);
        return true;
    },
    
    async getTotalPrice(cartId) {
        const result = await pool.query(
            `SELECT COALESCE(SUM(bouquet_count * price_at_time), 0) as total 
             FROM Cart_Items WHERE cart_id = $1`,
            [cartId]
        );
        return parseFloat(result.rows[0].total);
    }
};

module.exports = Cart;