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
      enum: ['General Broadcast', 'Event Reminder', 'SFD Update'],
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'no-recipients', 'failed'],
      default: 'sent',
    },
    sentCount: {
      type: Number,
      default: 0, // how many phones it was delivered to
    },
  },
  { timestamps: true } 
);

const Notification = models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;