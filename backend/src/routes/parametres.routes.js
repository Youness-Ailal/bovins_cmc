const router = require('express').Router();
const c = require('../controllers/parametres.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', c.get);
router.put('/', c.update);

module.exports = router;
