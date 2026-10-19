import mongoose, { Schema, models } from 'mongoose';

const sfdEditionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      // e.g., "September - October 2026 Edition"
    },
    theme: {
      type: String,
      trim: true,
      // e.g., "Walking in Grace"
    },
    startMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    endMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    // UPDATED: Now an object containing both URL and Public ID
    coverImage: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      }
    },
    price: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false, 
    },
  },
  { timestamps: true }
);

// Ensures you cannot accidentally create duplicate overlapping editions
sfdEditionSchema.index({ startMonth: 1, endMonth: 1, year: 1 }, { unique: true });

const SfdEdition = models.SfdEdition || mongoose.model('SfdEdition', sfdEditionSchema);

export default SfdEdition;