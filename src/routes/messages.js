import express from 'express';
import * as messageController from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkBlocked } from '../middleware/checkBlocked.js';
import { upload, validateMultipleFiles } from '../middleware/upload.js';

const router = express.Router();

router.get('/conversations', authMiddleware, messageController.getConversations);

router.get('/search', authMiddleware, messageController.searchMessages);

router.post(
  '/',
  authMiddleware,
  checkBlocked,
  upload.array('files', 10),
  validateMultipleFiles,
  messageController.createMessage
);

router.get('/:user_id', authMiddleware, messageController.getMessagesWith);

router.put('/:id', authMiddleware, messageController.updateMessage);

router.delete('/:id', authMiddleware, messageController.deleteMessage);

router.post('/:id/read', authMiddleware, messageController.markAsRead);

export default router;
