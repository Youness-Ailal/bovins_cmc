const router = require('express').Router();
const c = require('../controllers/sante.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

// Traitements
router.get('/traitements', c.listTraitements);
router.post('/traitements', c.createTraitement);
router.put('/traitements/:id', c.updateTraitement);
router.delete('/traitements/:id', c.removeTraitement);

// États de santé
router.get('/etats', c.listEtats);
router.post('/etats', c.createEtat);

// Planification
router.get('/plans', c.listPlans);
router.post('/plans', c.createPlan);
router.put('/plans/:id', c.updatePlan);
router.delete('/plans/:id', c.removePlan);

module.exports = router;
