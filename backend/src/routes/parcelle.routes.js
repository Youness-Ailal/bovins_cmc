const router = require('express').Router();
const c = require('../controllers/parcelle.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { GESTION_FERME } = require('../config/roles');

router.use(protect);

router.post('/transfert', restrictTo(...GESTION_FERME), c.transfert);
router.get('/', c.list);
router.post('/', restrictTo(...GESTION_FERME), c.create);
router.get('/:id', c.getOne);
router.put('/:id', restrictTo(...GESTION_FERME), c.update);
router.delete('/:id', restrictTo(...GESTION_FERME), c.remove);

module.exports = router;
