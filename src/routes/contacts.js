import express from 'express';
import {
  acceptContact,
  blockContact,
  deleteContact,
  getBlockedContacts,
  getContacts,
  getPendingContacts,
  requestContact,
  unblockContact,
} from '../controllers/contactController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/request', authMiddleware, requestContact);
router.put('/:id/accept', authMiddleware, acceptContact);
router.delete('/:id', authMiddleware, deleteContact);
router.get('/', authMiddleware, getContacts);
router.get('/pending', authMiddleware, getPendingContacts);
router.post('/:id/block', authMiddleware, blockContact);
router.post('/:id/unblock', authMiddleware, unblockContact);
router.get('/blocked', authMiddleware, getBlockedContacts);

export default router;
