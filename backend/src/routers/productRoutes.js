const express = require('express');
const router = express.Router();

//заглушка
router.get('/', (req, res) => {
    res.json({ message: 'Products route working' });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Get product with id ${req.params.id}` });
});

module.exports = router;