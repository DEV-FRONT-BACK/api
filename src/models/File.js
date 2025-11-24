import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, 'Nom du fichier requis'],
    },
    storagePath: {
      type: String,
      required: [true, 'Chemin de stockage requis'],
    },
    mimetype: {
      type: String,
      required: [true, 'Type MIME requis'],
      validate: {
        validator: function (v) {
          const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'application/pdf',
          ];
          return allowedTypes.includes(v);
        },
        message: 'Type de fichier non autorisé',
      },
    },
    size: {
      type: Number,
      required: [true, 'Taille du fichier requise'],
      validate: {
        validator: function (v) {
          if (this.mimetype.startsWith('image/')) {
            return v <= 10 * 1024 * 1024;
          }
          if (this.mimetype.startsWith('video/')) {
            return v <= 100 * 1024 * 1024;
          }
          if (this.mimetype === 'application/pdf') {
            return v <= 10 * 1024 * 1024;
          }
          return false;
        },
        message: 'Taille de fichier non autorisée (max: 10MB images/pdf, 100MB vidéos)',
      },
    },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ID du téléverseur requis'],
    },
    url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

fileSchema.index({ uploaderId: 1, createdAt: -1 });

fileSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    filename: this.filename,
    mimetype: this.mimetype,
    size: this.size,
    url: this.url,
    uploaderId: this.uploaderId,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('File', fileSchema);
