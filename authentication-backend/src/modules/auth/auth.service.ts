import { User } from "../../models/user.model.js";
import { hashPassword, comparePassword, hashOtp } from "../../utils/hash.js";
import { generateOtp } from "../../utils/otp.js";
import type { LoginServiceResponse } from "../../types/auth.types.js";
import { sendResetOtpEmail } from "../../utils/email.js";

export const signupService = async (
  email: string,
  password: string
): Promise<void> => {
  const hashed = await hashPassword(password);
  await User.create({ email, password: hashed });
};

export const loginService = async (
  email: string,
  password: string
): Promise<LoginServiceResponse> => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new Error("Account locked");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    user.failedAttempts += 1;

    if (user.failedAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await user.save();
    throw new Error("Invalid credentials");
  }

  user.failedAttempts = 0;

  if (user.isMFAEnabled) {
    user.mfaOtp = generateOtp();
    user.mfaExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    return { mfaRequired: true };
  }

  await user.save();

  return {
    id: user.id,
    email: user.email
  };
};

export const changePasswordService = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const isMatch = await comparePassword(oldPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  const hashed = await hashPassword(newPassword);
  user.password = hashed;
  await user.save();
};

export const forgotPasswordService = async (
  email: string
): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const otp = generateOtp();
  const hashedOtp = hashOtp(otp);

  user.mfaOtp = hashedOtp;
  user.mfaExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  await user.save();

  try {
    await sendResetOtpEmail(email, otp);
  } catch (err) {
    console.error("Email failed:", err);
  }
};

export const resetPasswordService = async (
  email: string,
  resetToken: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (!user.mfaOtp || !user.mfaExpiry) {
    throw new Error("Reset process not initiated");
  }

  if (user.mfaExpiry < new Date()) {
    throw new Error("Reset token expired");
  }
  const hashedOtp = hashOtp(resetToken);

  if (hashedOtp !== user.mfaOtp) {
    throw new Error("Invalid reset token");
  }
  user.password = await hashPassword(newPassword);
  user.mfaOtp = null;
  user.mfaExpiry = null;
  await user.save();
};
