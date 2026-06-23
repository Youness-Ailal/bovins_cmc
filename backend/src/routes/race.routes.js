const router = require('express').Router();
const c = require('../controllers/race.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { ADMIN } = require('../config/roles');

router.use(protect);

router.get('/', c.list);
router.post('/', restrictTo(ADMIN), c.create);
router.get('/:id', c.getOne);
router.put('/:id', restrictTo(ADMIN), c.update);
router.delete('/:id', restrictTo(ADMIN), c.remove);

module.exports = router;
