const router = require('express').Router();
const c = require('../controllers/boviAI.controller');
const { protect } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

router.use(protect);

// 20 requests / minute / user (Plan 06 security requirement)
router.post('/chat', rateLimit({ windowMs: 60000, max: 20 }), c.chat);

// Conversation history (persisted per user)
router.get('/conversations', c.listConversations);
router.get('/conversations/:id', c.getConversation);
router.delete('/conversations/:id', c.deleteConversation);

module.exports = router;
