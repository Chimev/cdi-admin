import mongoose, { Schema, models } from 'mongoose';

const testimonySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      default: 'Anonymous',
      trim: true,
    },
    body: {
      type: String,
      required: true,
    }
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt
);

const Testimony = models.Testimony || mongoose.model('Testimony', testimonySchema);

export default Testimony;