import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'blocked'],
      default: 'pending',
      required: true,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

contactSchema.index({ userId: 1, contactId: 1 }, { unique: true });
contactSchema.index({ status: 1 });

contactSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    userId: this.userId,
    contactId: this.contactId,
    status: this.status,
    initiatedBy: this.initiatedBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
