import express from 'express';
import {
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.put('/:id/read', authMiddleware, markAsRead);
router.put('/read-all', authMiddleware, markAllAsRead);
router.delete('/:id', authMiddleware, deleteNotification);

export default router;
