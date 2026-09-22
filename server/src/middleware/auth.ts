import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/auth/jwt";
import { prisma } from "../db/prisma";

export interface AuthedRequest extends Request {
  userId?: string;
  isGuest?: boolean;
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing auth token" });
  }
  try {
    const payload = verifyToken(header.slice("Bearer ".length));
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ error: "User not found" });
    req.userId = user.id;
    req.isGuest = user.isGuest;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Gates actions the spec treats as "durable ownership" (Section 2 auth
 * decision): saving/favoriting content, Family Cookbook writes, keeping
 * grocery lists/tasks long-term, notifications, and purchases. Guests get
 * a clear, actionable error the client turns into a sign-up prompt.
 */
export function requireFullAccount(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.isGuest) {
    return res.status(403).json({ error: "ACCOUNT_REQUIRED", message: "Create a free account to save this." });
  }
  next();
}
