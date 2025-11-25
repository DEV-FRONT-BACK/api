import express from 'express';
import { getFile } from '../controllers/fileController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', authMiddleware, getFile);

export default router;
