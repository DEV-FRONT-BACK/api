const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/auth');

router.get('/conversations', authMiddleware, messageController.getConversations);

router.post('/', authMiddleware, messageController.createMessage);

router.get('/:user_id', authMiddleware, messageController.getMessagesWith);

router.put('/:id', authMiddleware, messageController.updateMessage);

router.delete('/:id', authMiddleware, messageController.deleteMessage);

router.post('/:id/read', authMiddleware, messageController.markAsRead);

module.exports = router;
