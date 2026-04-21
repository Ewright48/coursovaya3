const pool = require('../config/database');

const User = {
    async findAll() {
        const result = await pool.query('SELECT * FROM users');
        return result.rows;
    },
    
    async findById(id) {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
        return result.rows[0];
    },
    
    async create(userData) {
        const { email, phone, password_hash } = userData;
        const result = await pool.query(
            'INSERT INTO users (email, phone, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [email, phone, password_hash]
        );
        return result.rows[0];
    }
};

module.exports = User;