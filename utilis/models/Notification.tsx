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
      default: 'sent', // You can expand this to 'pending' or 'failed' when Expo is integrated
    }
  },
  { timestamps: true } 
);

const Notification = models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;