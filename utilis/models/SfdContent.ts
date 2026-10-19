import mongoose, { Schema, models } from 'mongoose';

const sfdContentSchema = new Schema(
  {
    editionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SfdEdition',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      // The specific day this reading is meant for
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    subStatement: {
      type: String,
      required: true,
      trim: true,
      // Used for the memory verse or brief intro text
    },
    content: {
      type: String,
      required: true,
      // Will likely store rich text (HTML or Markdown) from the admin dashboard editor
    },
    prayer: {
      type: String,
      required: true,
      trim: true,
    }
  },
  { timestamps: true }
);

// Prevent adding two different devotions for the exact same date within the same edition
sfdContentSchema.index({ editionId: 1, date: 1 }, { unique: true });

// Index the date field alone to make the mobile app's "Fetch Today's Reading" query lightning fast
sfdContentSchema.index({ date: 1 });

const SfdContent = models.SfdContent || mongoose.model('SfdContent', sfdContentSchema);

export default SfdContent;