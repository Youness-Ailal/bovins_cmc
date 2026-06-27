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

router.get('/:id/pesees', c.listPesees);
router.post('/:id/pesees', c.addPesee);

router.patch('/:id/phase', c.changePhase);
router.patch('/:id/sante', c.changeEtatSante);
router.post('/:id/sortie', c.sortie);

router.get('/:id/passeport', c.passeport);
router.get('/:id/laissez-passer', c.laissezPasser);
router.get('/:id/qrcode-card', c.getQrCodeCard);

module.exports = router;
