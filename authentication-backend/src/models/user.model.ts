import { Schema, model } from 'mongoose';

const userSchema = new Schema(
    {
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        failedAttempts: { type: Number, default: 0 },
        lockUntil: Date,
        isMFAEnabled: { type: Boolean, default: false },
        mfaOtp: String,
        mfaExpiry: Date,
        activeSessionId: { type: String, default: null },
    }, { timestamps: true }
);

export const User = model("User", userSchema);
