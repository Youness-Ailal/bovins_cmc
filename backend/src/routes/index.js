const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.json({ title: 'Express API', version: '1.0.0' });
});

module.exports = router;
