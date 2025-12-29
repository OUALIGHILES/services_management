import { Request, Response, NextFunction } from "express";
import { User } from "@shared/schema";

import { storage } from "../storage";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}

export function isAdminOrSubAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "admin" && req.user.role !== "subadmin") {
    return res.status(403).json({ message: "Admin or Sub-Admin access required" });
  }

  next();
}

export async function canImpersonateUsers(userId: string): Promise<boolean> {
  // Super admins can always impersonate
  const user = await storage.getUser(userId);
  if (user?.role === "admin") {
    return true;
  }

  // Check if subadmin has impersonation permission
  if (user?.role === "subadmin") {
    return await storage.hasSubAdminPermission(userId, "user_impersonation");
  }

  return false;
}

export function requireImpersonationPermission(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  canImpersonateUsers(req.user.id).then(canImpersonate => {
    if (!canImpersonate) {
      return res.status(403).json({ message: "Insufficient permissions to impersonate users" });
    }
    next();
  }).catch(err => {
    console.error("Error checking impersonation permission:", err);
    return res.status(500).json({ message: "Error checking permissions" });
  });
}