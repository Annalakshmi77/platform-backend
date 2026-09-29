import mongoose, { Schema } from 'mongoose';
import { AdditionalCharge } from '../types/index.js';

const AdditionalChargeSchema = new Schema<AdditionalCharge>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const AdditionalChargeModel =
  mongoose.models.AdditionalCharge ||
  mongoose.model<AdditionalCharge>('AdditionalCharge', AdditionalChargeSchema);
