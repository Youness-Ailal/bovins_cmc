const router = require('express').Router();
const c = require('../controllers/animal.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { GESTION_FERME, SAISIE_TERRAIN, SAISIE_SORTIE } = require('../config/roles');

router.use(protect);

router.get('/prets-a-vendre', c.pretsAVendre);
router.get('/', c.list);
router.post('/', restrictTo(...GESTION_FERME), c.create);
router.get('/:id', c.getOne);
router.put('/:id', restrictTo(...GESTION_FERME), c.update);
router.delete('/:id', restrictTo(...GESTION_FERME), c.remove);

// Pesées — any active role can log a weighing
router.get('/:id/pesees', c.listPesees);
router.post('/:id/pesees', restrictTo(...SAISIE_TERRAIN), c.addPesee);

// Phase, santé & sortie
router.patch('/:id/phase', restrictTo(...GESTION_FERME), c.changePhase);
router.patch('/:id/sante', restrictTo(...SAISIE_TERRAIN), c.changeEtatSante);
router.post('/:id/sortie', restrictTo(...SAISIE_SORTIE), c.sortie);

// Documents PDF (Plan 05) — any authenticated user can download
router.get('/:id/passeport', c.passeport);
router.get('/:id/laissez-passer', c.laissezPasser);

module.exports = router;
