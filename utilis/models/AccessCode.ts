import mongoose, { Schema, models } from 'mongoose';

const accessCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    editionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SfdEdition',
      required: true,
    },
    status: {
    type: String,
    enum: ['active', 'used', 'revoked'],
    default: 'active',
    },
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    expiredAt: {
      type: Date,
      required: true, // Forces the system to assign an expiration date upon creation
    }
  },
  { timestamps: true }
);

// Indexing for faster lookups when a user submits a code
accessCodeSchema.index({ code: 1 });
accessCodeSchema.index({ editionId: 1, status: 1 });

const AccessCode = models.AccessCode || mongoose.model('AccessCode', accessCodeSchema);
export default AccessCode;