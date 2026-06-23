const router = require('express').Router();
const c = require('../controllers/alerte.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { GESTION_ALERTES } = require('../config/roles');

router.use(protect);

router.get('/', c.list);
router.patch('/:id/traiter', restrictTo(...GESTION_ALERTES), c.traiter);
router.delete('/:id', restrictTo(...GESTION_ALERTES), c.remove);

module.exports = router;
