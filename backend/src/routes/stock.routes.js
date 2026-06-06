const router = require('express').Router();
const c = require('../controllers/stock.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

// Mouvements
router.get('/mouvements', c.listMouvements);
router.post('/mouvements', c.createMouvement);

// Articles
router.get('/', c.listArticles);
router.post('/', c.createArticle);
router.get('/:id', c.getArticle);
router.put('/:id', c.updateArticle);
router.delete('/:id', c.removeArticle);

module.exports = router;
