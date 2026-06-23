const router = require('express').Router();
const c = require('../controllers/sante.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { GESTION_SANTE } = require('../config/roles');

router.use(protect);

// Traitements
router.get('/traitements', c.listTraitements);
router.post('/traitements', restrictTo(...GESTION_SANTE), c.createTraitement);
router.put('/traitements/:id', restrictTo(...GESTION_SANTE), c.updateTraitement);
router.delete('/traitements/:id', restrictTo(...GESTION_SANTE), c.removeTraitement);

// États de santé
router.get('/etats', c.listEtats);
router.post('/etats', restrictTo(...GESTION_SANTE), c.createEtat);

// Planification
router.get('/plans', c.listPlans);
router.post('/plans', restrictTo(...GESTION_SANTE), c.createPlan);
router.put('/plans/:id', restrictTo(...GESTION_SANTE), c.updatePlan);
router.delete('/plans/:id', restrictTo(...GESTION_SANTE), c.removePlan);

module.exports = router;
