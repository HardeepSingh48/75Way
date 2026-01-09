import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { User } from "../models/user.model.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const token = req.cookies?.accessToken as string | undefined;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.activeSessionId !== payload.sessionId) {
      return res.status(401).json({
        message: "Session expired. Please login again."
      });
    }

    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
