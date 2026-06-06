const router = require('express').Router();
const c = require('../controllers/animal.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/prets-a-vendre', c.pretsAVendre);
router.get('/', c.list);
router.post('/', c.create);
router.get('/:id', c.getOne);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

// Pesées
router.get('/:id/pesees', c.listPesees);
router.post('/:id/pesees', c.addPesee);

// Phase & sortie
router.patch('/:id/phase', c.changePhase);
router.post('/:id/sortie', c.sortie);

module.exports = router;
