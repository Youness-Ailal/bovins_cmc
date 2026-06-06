const router = require('express').Router();
const c = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', c.summary);
router.get('/rentabilite', c.rentabilite);

module.exports = router;
