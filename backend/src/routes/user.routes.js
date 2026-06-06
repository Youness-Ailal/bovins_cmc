const router = require('express').Router();
const c = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('Admin'));

router.get('/', c.list);
router.post('/', c.create);
router.get('/:id', c.getOne);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
