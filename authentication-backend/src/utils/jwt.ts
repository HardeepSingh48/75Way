import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { JwtPayload } from "../types/auth.types.js";

export const generateAccessToken = (payload: JwtPayload) =>
    jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });

export const generateRefreshToken = (payload: JwtPayload) =>
    jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

export const verifyAccessToken = (token: string) =>
    jwt.verify(token, env.JWT_SECRET) as JwtPayload;