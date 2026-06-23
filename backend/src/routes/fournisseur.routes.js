const router = require('express').Router();
const c = require('../controllers/fournisseur.controller');
const { protect, restrictTo } = require('../middleware/auth');
const { GESTION_FERME } = require('../config/roles');

router.use(protect);

// Commandes — specific routes before /:id to avoid conflicts
router.get('/commandes', c.listCommandes);
router.post('/commandes', restrictTo(...GESTION_FERME), c.createCommande);
router.put('/commandes/:id', restrictTo(...GESTION_FERME), c.updateCommande);
router.delete('/commandes/:id', restrictTo(...GESTION_FERME), c.deleteCommande);

// Fournisseurs CRUD
router.get('/', c.listFournisseurs);
router.post('/', restrictTo(...GESTION_FERME), c.createFournisseur);
router.get('/:id', c.getFournisseur);
router.put('/:id', restrictTo(...GESTION_FERME), c.updateFournisseur);
router.delete('/:id', restrictTo(...GESTION_FERME), c.deleteFournisseur);

module.exports = router;
