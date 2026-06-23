const router = require('express').Router();
const c = require('../controllers/stock.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { GESTION_FERME, SAISIE_STOCK_RATION } = require('../config/roles');

router.use(protect);

// Mouvements — operators can log entries/sorties without managing the catalogue
router.get('/mouvements', c.listMouvements);
router.post('/mouvements', restrictTo(...SAISIE_STOCK_RATION), c.createMouvement);

// Articles
router.get('/', c.listArticles);
router.post('/', restrictTo(...GESTION_FERME), c.createArticle);
router.get('/:id', c.getArticle);
router.put('/:id', restrictTo(...GESTION_FERME), c.updateArticle);
router.delete('/:id', restrictTo(...GESTION_FERME), c.removeArticle);

module.exports = router;
