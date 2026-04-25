const User = require('../models/User');
const { generateToken, hashPassword, comparePassword } = require('../utils/helpers');

const sendUserResponse = (res, user, token) => {
    res.json({
        token,
        user: {
            id: user.user_id,
            email: user.email,
            phone: user.phone,
            address: user.address,
            status: user.status
        }
    });
};

const register = async (req, res) => {
    try {
        const { email, phone, password, address } = req.body;
        
        if (!email || !phone || !password) {
            return res.status(400).json({ error: 'Заполните все обязательные поля' });
        }
        
        if (await User.emailExists(email)) {
            return res.status(400).json({ error: 'Email уже используется' });
        }
        
        const user = await User.create({
            email,
            phone,
            password_hash: await hashPassword(password),
            address: address || ''
        });
        
        sendUserResponse(res, user, generateToken(user.user_id, user.email));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при регистрации' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Введите email и пароль' });
        }
        
        const user = await User.findByEmail(email);
        
        if (!user || user.status === 'deleted' || !(await comparePassword(password, user.password_hash))) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        sendUserResponse(res, user, generateToken(user.user_id, user.email));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при входе' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении данных' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, phone, address, password } = req.body;
        
        const updateData = {};
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (password) updateData.password_hash = await hashPassword(password);
        
        if (email && email !== (await User.findById(userId)).email) {
            if (await User.emailExists(email)) {
                return res.status(400).json({ error: 'Email уже используется' });
            }
        }
        
        const user = await User.update(userId, updateData);
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
        
        res.json({ message: 'Профиль обновлён', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при обновлении профиля' });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const user = await User.update(req.user.id, { status: 'deleted' });
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
        res.json({ message: 'Аккаунт удалён' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при удалении аккаунта' });
    }
};

module.exports = { register, login, getMe, updateProfile, deleteAccount };