const router = require('express').Router();
const c = require('../controllers/parametres.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.get('/', c.get);
router.put('/', restrictTo('Admin'), c.update);

module.exports = router;
