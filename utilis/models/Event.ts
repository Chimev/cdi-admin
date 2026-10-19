import mongoose, { Schema, models } from 'mongoose';

const eventSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }
    },
    externalLink: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    }
  },
  { timestamps: true }
);

const Event = models.Event || mongoose.model('Event', eventSchema);

export default Event;