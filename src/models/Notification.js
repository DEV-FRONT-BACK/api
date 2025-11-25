import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['message', 'contact_request', 'contact_accepted', 'mention'],
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    relatedModel: {
      type: String,
      enum: ['Message', 'Contact', 'User'],
      required: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    content: {
      type: String,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

notificationSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    type: this.type,
    relatedId: this.relatedId,
    fromUser: this.fromUser,
    read: this.read,
    content: this.content,
    createdAt: this.createdAt,
  };
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
