// models/User.ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName  : { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  slug: { type: String, default: null },
  role: { 
    type: String, 
    enum: ['user', 'admin'], // Prevents accidental roles like 'superadmin' or typos
    default: 'user'          // Every new registration defaults to a normal user
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
