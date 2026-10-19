import mongoose, { Schema, models } from 'mongoose';

const appSettingSchema = new Schema({
  churchName: { type: String, default: 'Chapel of Divine Inspiration' },
  supportEmail: { type: String, default: 'support@cdi.org' },
  defaultSfdPrice: { type: Number, default: 2000 },
  bankName: { type: String, default: '' },
  accountName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  paymentWhatsApp: { type: String, default: '' }
}, { timestamps: true });

export default models.AppSetting || mongoose.model('AppSetting', appSettingSchema);