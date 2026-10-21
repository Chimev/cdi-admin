import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName  : { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  slug: { type: String, default: null },
  role: { 
    type: String, 
    enum: ['user', 'admin'],
    default: 'user'
  },
  prayerSlotId: { type: String, default: null }, // e.g. "6-0" = 6:00–6:30 AM
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);