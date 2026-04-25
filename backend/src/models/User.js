const pool = require('../config/database');

const User = {
    async findByEmail(email) {
        const result = await pool.query(
            `SELECT user_id, email, phone, address, password_hash, status 
             FROM Users WHERE email = $1`,
            [email]
        );
        return result.rows[0] || null;
    },
    
    async findById(userId) {
        const result = await pool.query(
            `SELECT user_id, email, phone, address, status, created_at 
             FROM Users WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0] || null;
    },
    
    async create(data) {
        const { email, phone, password_hash, address = '' } = data;
        const result = await pool.query(
            `INSERT INTO Users (email, phone, password_hash, address, status)
             VALUES ($1, $2, $3, $4, 'active')
             RETURNING user_id, email, phone, address, status, created_at`,
            [email, phone, password_hash, address]
        );
        return result.rows[0];
    },
    
    async update(userId, fields) {
        const updates = [];
        const values = [];
        let idx = 1;
        
        if (fields.email) { updates.push(`email = $${idx++}`); values.push(fields.email); }
        if (fields.phone) { updates.push(`phone = $${idx++}`); values.push(fields.phone); }
        if (fields.address !== undefined) { updates.push(`address = $${idx++}`); values.push(fields.address); }
        if (fields.password_hash) { updates.push(`password_hash = $${idx++}`); values.push(fields.password_hash); }
        if (fields.status) { updates.push(`status = $${idx++}`); values.push(fields.status); }
        
        if (updates.length === 0) return null;
        
        values.push(userId);
        const result = await pool.query(
            `UPDATE Users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $${idx} RETURNING user_id, email, phone, address, status, created_at`,
            values
        );
        return result.rows[0] || null;
    },
    
    async emailExists(email) {
        const result = await pool.query(`SELECT EXISTS(SELECT 1 FROM Users WHERE email = $1)`, [email]);
        return result.rows[0].exists;
    }
};

module.exports = User;