import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import File from '../models/File.js';
import Message from '../models/Message.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { thumbnail } = req.query;

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        error: 'Fichier non trouvé',
      });
    }

    const message = await Message.findOne({ files: file._id });

    if (!message) {
      return res.status(404).json({
        error: 'Message associé non trouvé',
      });
    }

    const isAuthorized =
      message.sender.toString() === req.userId.toString() || message.recipient.toString() === req.userId.toString();

    if (!isAuthorized) {
      return res.status(403).json({
        error: 'Accès non autorisé',
      });
    }

    const filePath =
      thumbnail && file.thumbnail?.path
        ? path.resolve(__dirname, '../../', file.thumbnail.path)
        : path.resolve(__dirname, '../../', file.storagePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Fichier physique non trouvé',
      });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.setHeader('ETag', `"${file._id}-${stat.mtime.getTime()}"`);
    res.setHeader('Last-Modified', stat.mtime.toUTCString());

    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch === `"${file._id}-${stat.mtime.getTime()}"`) {
      return res.status(304).end();
    }

    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': file.mimetype,
      });

      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    }
  } catch (error) {
    console.error('Erreur getFile:', error);
    res.status(500).json({
      error: 'Erreur serveur',
    });
  }
};
