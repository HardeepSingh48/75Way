import type { Request, Response } from "express";
import { signupService, loginService, changePasswordService, forgotPasswordService, resetPasswordService } from "./auth.service.js";
import {
  generateAccessToken,
  generateRefreshToken
} from "../../utils/jwt.js";

export const signup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    await signupService(email, password);
    return res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Signup failed", error: (error as Error).message });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await loginService(email, password);

    if ("mfaRequired" in result) {
      return res.json({ message: "OTP sent" });
    }

    const accessToken = generateAccessToken({ id: result.id });
    const refreshToken = generateRefreshToken({ id: result.id });

    return res
      .cookie("accessToken", accessToken, { httpOnly: true })
      .cookie("refreshToken", refreshToken, { httpOnly: true })
      .json({ message: "Login success" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed", error: (error as Error).message });
  }
};

export const logout = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ message: "Logged out" });
};

export const changePassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const { oldPassword, newPassword } = req.body as {
      oldPassword: string;
      newPassword: string;
    };

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new passwords are required" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await changePasswordService(req.user.id, oldPassword, newPassword);
    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Password change failed", error: (error as Error).message });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const { email } = req.body as { email: string };

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    await forgotPasswordService(email);

    // In production, send this via email. For now, return it in response
    return res.json({
      message: "OTP sent to your email"
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Failed to process request", error: (error as Error).message });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const { email, resetToken, newPassword } = req.body as {
      email: string;
      resetToken: string;
      newPassword: string;
    };

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ message: "Email, reset token, and new password are required" });
    }

    await resetPasswordService(email, resetToken, newPassword);
    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Password reset failed", error: (error as Error).message });
  }
};
