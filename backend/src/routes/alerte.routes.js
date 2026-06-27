const router = require('express').Router();
const c = require('../controllers/alerte.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', c.list);
router.patch('/:id/traiter', c.traiter);
router.delete('/:id', c.remove);

module.exports = router;
