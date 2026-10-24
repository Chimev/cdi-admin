import mongoose, { Schema, models } from 'mongoose';

const notificationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['General Broadcast', 'Event Reminder', 'SFD Update', 'Testimony'],
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'no-recipients', 'failed'],
      default: 'sent',
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    data: {
      type: Schema.Types.Mixed, // where the app opens on tap, e.g. { type: "event", id }
      default: {},
    },
  },
  { timestamps: true } 
);

const Notification = models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;