const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { bilanTroupeau, bilanAnimal, projection } = require('../controllers/finances.controller');

router.use(protect);

router.get('/troupeau',      bilanTroupeau);
router.get('/projection',    projection);
router.get('/animal/:id',    bilanAnimal);

module.exports = router;
