import mongoose, { Schema, models } from 'mongoose';

const prayerSlotSchema = new Schema({
  slotId: { type: String, required: true, unique: true }, 
  label: { type: String, required: true },
  link: { type: String, default: '' }
});

export default models.PrayerSlot || mongoose.model('PrayerSlot', prayerSlotSchema);