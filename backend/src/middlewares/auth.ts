import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  playerId?: number;
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    res.status(500).json({ error: "JWT secret not configured" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as { playerId: number };
    req.playerId = payload.playerId;
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}
