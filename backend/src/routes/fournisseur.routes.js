const router = require('express').Router();
const c = require('../controllers/fournisseur.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/commandes', c.listCommandes);
router.post('/commandes', c.createCommande);
router.get('/commandes/:id', c.getCommande);
router.put('/commandes/:id', c.updateCommande);
router.delete('/commandes/:id', c.deleteCommande);

router.get('/', c.listFournisseurs);
router.post('/', c.createFournisseur);
router.get('/:id', c.getFournisseur);
router.put('/:id', c.updateFournisseur);
router.delete('/:id', c.deleteFournisseur);

module.exports = router;
