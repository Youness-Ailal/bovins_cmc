const router = require('express').Router();
const c = require('../controllers/ration.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { GESTION_FERME, SAISIE_STOCK_RATION } = require('../config/roles');

router.use(protect);

// Distributions — operators can log a distribution without editing rations
router.get('/distributions', c.listDistributions);
router.post('/distributions', restrictTo(...SAISIE_STOCK_RATION), c.createDistribution);

// Rations
router.get('/', c.list);
router.post('/', restrictTo(...GESTION_FERME), c.create);
router.get('/:id', c.getOne);
router.put('/:id', restrictTo(...GESTION_FERME), c.update);
router.delete('/:id', restrictTo(...GESTION_FERME), c.remove);

module.exports = router;
