const router = require('express').Router();
const c = require('../controllers/parcelle.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/transfert', c.transfert);
router.get('/', c.list);
router.post('/', c.create);
router.get('/:id', c.getOne);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
