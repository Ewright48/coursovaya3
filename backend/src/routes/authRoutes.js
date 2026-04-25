const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, deleteAccount } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/me', auth, updateProfile);
router.delete('/me', auth, deleteAccount);

module.exports = router