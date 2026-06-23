const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({ title: 'BOVITRACK API', version: '1.0.0', status: 'ok' });
});

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/races', require('./race.routes'));
router.use('/parcelles', require('./parcelle.routes'));
router.use('/animaux', require('./animal.routes'));
router.use('/stocks', require('./stock.routes'));
router.use('/rations', require('./ration.routes'));
router.use('/sante', require('./sante.routes'));
router.use('/alertes', require('./alerte.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/parametres', require('./parametres.routes'));
router.use('/finances',      require('./finances.routes'));
router.use('/fournisseurs',  require('./fournisseur.routes'));

module.exports = router;
