const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));

router.get('/health', (req, res) => res.json({ success: true, message: 'OK', data: { uptime: process.uptime() } }));

module.exports = router;
