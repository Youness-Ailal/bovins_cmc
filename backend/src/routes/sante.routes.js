const router = require('express').Router();
const c = require('../controllers/sante.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/traitements/registre', c.registreTraitements);
router.get('/traitements', c.listTraitements);
router.post('/traitements', c.createTraitement);
router.put('/traitements/:id', c.updateTraitement);
router.delete('/traitements/:id', c.removeTraitement);

router.get('/etats', c.listEtats);
router.post('/etats', c.createEtat);

router.get('/plans', c.listPlans);
router.post('/plans', c.createPlan);
router.put('/plans/:id', c.updatePlan);
router.delete('/plans/:id', c.removePlan);

router.get('/animal/:id/carnet', c.carnet);

module.exports = router;
