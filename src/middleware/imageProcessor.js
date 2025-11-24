import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
const THUMBNAIL_DIR = path.join(__dirname, '../../public/uploads/thumbnails');

await fs.mkdir(THUMBNAIL_DIR, { recursive: true });

const IMAGE_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 85,
  thumbnailSize: 200,
  thumbnailQuality: 70,
};

const isImage = (mimetype) => {
  return mimetype && mimetype.startsWith('image/');
};

export const processImage = async (filePath, filename) => {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    const processedFilename = `processed_${filename}`;
    const processedPath = path.join(UPLOAD_DIR, processedFilename);

    await image
      .rotate()
      .resize(IMAGE_CONFIG.maxWidth, IMAGE_CONFIG.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: IMAGE_CONFIG.quality,
        mozjpeg: true,
      })
      .withMetadata({
        exif: {},
        icc: metadata.icc,
      })
      .toFile(processedPath);

    await fs.unlink(filePath);

    return {
      processedPath,
      processedFilename,
      originalWidth: metadata.width,
      originalHeight: metadata.height,
    };
  } catch (error) {
    console.error('Erreur processImage:', error);
    throw error;
  }
};

export const generateThumbnail = async (filePath, filename) => {
  try {
    const thumbnailFilename = `thumb_${filename}`;
    const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailFilename);

    await sharp(filePath)
      .resize(IMAGE_CONFIG.thumbnailSize, IMAGE_CONFIG.thumbnailSize, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({
        quality: IMAGE_CONFIG.thumbnailQuality,
        mozjpeg: true,
      })
      .toFile(thumbnailPath);

    return {
      thumbnailPath,
      thumbnailFilename,
      thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
    };
  } catch (error) {
    console.error('Erreur generateThumbnail:', error);
    throw error;
  }
};

export const processUploadedFiles = async (files) => {
  const processedFiles = [];

  for (const file of files) {
    const fileInfo = {
      originalname: file.originalname,
      mimetype: file.validatedMimetype || file.mimetype,
      size: file.size,
      path: file.path,
      filename: file.filename,
    };

    if (isImage(fileInfo.mimetype)) {
      try {
        const processed = await processImage(file.path, file.filename);

        fileInfo.path = processed.processedPath;
        fileInfo.filename = processed.processedFilename;
        fileInfo.url = `/uploads/${processed.processedFilename}`;

        const stat = await fs.stat(processed.processedPath);
        fileInfo.size = stat.size;

        const thumbnail = await generateThumbnail(processed.processedPath, processed.processedFilename);

        fileInfo.thumbnail = {
          path: thumbnail.thumbnailPath,
          filename: thumbnail.thumbnailFilename,
          url: thumbnail.thumbnailUrl,
        };

        fileInfo.dimensions = {
          width: processed.originalWidth,
          height: processed.originalHeight,
        };
      } catch (error) {
        console.error('Erreur traitement image:', error);
        if (file.path) {
          await fs.unlink(file.path).catch(() => {});
        }
        throw new Error(`Erreur lors du traitement de l'image: ${error.message}`);
      }
    } else {
      fileInfo.url = `/uploads/${file.filename}`;
    }

    processedFiles.push(fileInfo);
  }

  return processedFiles;
};

export const deleteFileWithThumbnail = async (filePath) => {
  try {
    await fs.unlink(filePath);

    const filename = path.basename(filePath);
    const thumbnailPath = path.join(THUMBNAIL_DIR, `thumb_${filename}`);

    await fs.unlink(thumbnailPath).catch(() => {});
  } catch (error) {
    console.error('Erreur deleteFileWithThumbnail:', error);
  }
};
