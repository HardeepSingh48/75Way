import type { Request, Response } from "express";
import { signupService, loginService, changePasswordService, forgotPasswordService, resetPasswordService, logoutService } from "./auth.service.js";
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

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    await signupService(email, password);
    return res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("Signup error:", errorMessage);

    // Return 409 for duplicate email
    const statusCode = errorMessage.includes("duplicate") || errorMessage.includes("E11000") ? 409 : 500;

    return res.status(statusCode).json({
      message: statusCode === 409 ? "Email already exists" : "Signup failed. Please try again."
    });
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
      return res.json({ message: "OTP sent to your email" });
    }

    const accessToken = generateAccessToken({ id: result.id, sessionId: result.sessionId! });
    const refreshToken = generateRefreshToken({ id: result.id, sessionId: result.sessionId! });

    return res
      .cookie("accessToken", accessToken, { httpOnly: true })
      .cookie("refreshToken", refreshToken, { httpOnly: true })
      .json({ message: "Login successful" });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("Login error:", errorMessage);

    // Return 401 for authentication failures, 429 for locked accounts
    const statusCode = errorMessage.includes("locked") ? 429 : 401;

    return res.status(statusCode).json({
      message: errorMessage
    });
  }
};

export const logout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Clear active session in database
    if (req.user?.id) {
      await logoutService(req.user.id);
    }

    return res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json({ message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear cookies even if database update fails
    return res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json({ message: "Logged out" });
  }
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

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await changePasswordService(req.user.id, oldPassword, newPassword);
    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("Change password error:", errorMessage);

    // Return 401 if current password is incorrect
    const statusCode = errorMessage.includes("incorrect") ? 401 : 500;

    return res.status(statusCode).json({ message: errorMessage });
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

    return res.json({
      message: "OTP sent to your email"
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("Forgot password error:", errorMessage);

    const statusCode = errorMessage.includes("not found") ? 404 : 500;

    return res.status(statusCode).json({ message: errorMessage });
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

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }

    await resetPasswordService(email, resetToken, newPassword);
    return res.json({ message: "Password reset successful" });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("Reset password error:", errorMessage);

    // Return 400 for invalid/expired tokens, 404 for user not found
    let statusCode = 400;
    if (errorMessage.includes("not found")) {
      statusCode = 404;
    }

    return res.status(statusCode).json({ message: errorMessage });
  }
};
