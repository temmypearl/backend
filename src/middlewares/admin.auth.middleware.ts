import { Request, Response, NextFunction } from "express";
import { TokenService } from "../utils/tokens";
import { ITokenPayload } from "../modules/users/user.interface";
import { logger } from "../config";
import httpStatus from "http-status";
import { TokenExpiredError } from "jsonwebtoken";
import { ApiError } from "./apiError";
import {Admin}  from "../modules/admin/admin.model";
import { db } from "../drizzle/db";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  token: string | ITokenPayload;
  admin?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Extract token from Authorization header
const extractToken = (req: Request): string => {
  const authHeader = req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid authorization header format");
  }
  return authHeader.split(" ")[1];
};

// Verify token and decode payload
const verifyAndDecodeToken = async (token: string): Promise<ITokenPayload> => {
  try {
    const payload = TokenService.verifyAccessToken(token) as ITokenPayload;
    if (!payload.id || !payload.role) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token payload");
    }
    return payload;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token expired. Please log in again");
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
  }
};

// Find admin in DB by ID
const findUser = async (userId: string) => {
  const adminResult = await db.select().from(Admin).where(eq(Admin.id, userId));
  const user = adminResult[0];
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Admin not found");
  }
  return user;
};

// Require user to be ADMIN only
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    logger.info("Processing admin authentication token");

    const payload = await verifyAndDecodeToken(token);
    const Admin = await findUser(payload.id);

    if (payload.role !== 'admin') {
      throw new ApiError(httpStatus.FORBIDDEN, "Admin access required");
    }

    req.admin = {
      id: Admin.id,
      email: Admin.email,
      name: `${Admin.Name}`,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Authentication failed"));
  }
};

// ✅ Flexible role-based middleware
export const requireRole = (roles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = extractToken(req);
      const payload = await verifyAndDecodeToken(token);
      const Admin = await findUser(payload.id);

      if (!roles.includes(payload.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to access this resource");
      }

      req.admin = {
        id: Admin.id,
        email: Admin.email,
        name: `${Admin.Name}`,
        role: payload.role,
      };

      next();
    } catch (error) {
      next(error instanceof ApiError ? error : new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Authentication failed"));
    }
  };
};
