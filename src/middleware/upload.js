import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');

await fs.mkdir(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIMETYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  videos: ['video/mp4', 'video/webm', 'video/quicktime'],
  documents: ['application/pdf'],
};

const ALL_ALLOWED_TYPES = [...ALLOWED_MIMETYPES.images, ...ALLOWED_MIMETYPES.videos, ...ALLOWED_MIMETYPES.documents];

const MAX_FILE_SIZES = {
  images: 10 * 1024 * 1024,
  videos: 100 * 1024 * 1024,
  documents: 10 * 1024 * 1024,
};

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALL_ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

const validateFileType = async (req, _res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const buffer = await fs.readFile(req.file.path);
    const fileTypeResult = await fileTypeFromBuffer(buffer);

    if (!fileTypeResult) {
      await fs.unlink(req.file.path);
      return next(new Error('Impossible de déterminer le type de fichier'));
    }

    if (!ALL_ALLOWED_TYPES.includes(fileTypeResult.mime)) {
      await fs.unlink(req.file.path);
      return next(new Error(`Type de fichier réel non autorisé: ${fileTypeResult.mime}`));
    }

    if (fileTypeResult.mime !== req.file.mimetype) {
      await fs.unlink(req.file.path);
      return next(new Error('Le type MIME déclaré ne correspond pas au contenu réel du fichier'));
    }

    let maxSize;
    if (ALLOWED_MIMETYPES.images.includes(fileTypeResult.mime)) {
      maxSize = MAX_FILE_SIZES.images;
    } else if (ALLOWED_MIMETYPES.videos.includes(fileTypeResult.mime)) {
      maxSize = MAX_FILE_SIZES.videos;
    } else if (ALLOWED_MIMETYPES.documents.includes(fileTypeResult.mime)) {
      maxSize = MAX_FILE_SIZES.documents;
    }

    if (req.file.size > maxSize) {
      await fs.unlink(req.file.path);
      return next(new Error(`Fichier trop volumineux. Maximum: ${maxSize / 1024 / 1024}MB`));
    }

    req.file.validatedMimetype = fileTypeResult.mime;
    next();
  } catch (error) {
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

const validateMultipleFiles = async (req, _res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    for (const file of req.files) {
      const buffer = await fs.readFile(file.path);
      const fileTypeResult = await fileTypeFromBuffer(buffer);

      if (!fileTypeResult) {
        for (const f of req.files) {
          await fs.unlink(f.path).catch(() => {});
        }
        return next(new Error('Impossible de déterminer le type de fichier'));
      }

      if (!ALL_ALLOWED_TYPES.includes(fileTypeResult.mime)) {
        for (const f of req.files) {
          await fs.unlink(f.path).catch(() => {});
        }
        return next(new Error(`Type de fichier réel non autorisé: ${fileTypeResult.mime}`));
      }

      if (fileTypeResult.mime !== file.mimetype) {
        for (const f of req.files) {
          await fs.unlink(f.path).catch(() => {});
        }
        return next(new Error('Le type MIME déclaré ne correspond pas au contenu réel du fichier'));
      }

      let maxSize;
      if (ALLOWED_MIMETYPES.images.includes(fileTypeResult.mime)) {
        maxSize = MAX_FILE_SIZES.images;
      } else if (ALLOWED_MIMETYPES.videos.includes(fileTypeResult.mime)) {
        maxSize = MAX_FILE_SIZES.videos;
      } else if (ALLOWED_MIMETYPES.documents.includes(fileTypeResult.mime)) {
        maxSize = MAX_FILE_SIZES.documents;
      }

      if (file.size > maxSize) {
        for (const f of req.files) {
          await fs.unlink(f.path).catch(() => {});
        }
        return next(new Error(`Fichier trop volumineux. Maximum: ${maxSize / 1024 / 1024}MB`));
      }

      file.validatedMimetype = fileTypeResult.mime;
    }

    next();
  } catch (error) {
    if (req.files) {
      for (const file of req.files) {
        await fs.unlink(file.path).catch(() => {});
      }
    }
    next(error);
  }
};

export { upload, UPLOAD_DIR, validateFileType, validateMultipleFiles };
