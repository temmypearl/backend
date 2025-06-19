import { Request, Response, NextFunction } from "express";
import { TokenService } from "../utils/tokens";
import { ITokenPayload } from "../modules/users/user.interface";
import { logger } from "../config";
import httpStatus from "http-status";
import { TokenExpiredError } from "jsonwebtoken";
import { ApiError } from "./apiError";
import { User } from "../modules/users/user.model";
import { db } from "../drizzle/db";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  token: string | ITokenPayload;
  user?: {
    id: string;
    email: string;
    name: string;
    
  };
}

const extractToken = (req: Request): string => {
  const authHeader = req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid authorization header format");
  }
  return authHeader.split(" ")[1];
};

const verifyAndDecodeToken = async (token: string): Promise<ITokenPayload> => {
  try {
    const payload = TokenService.verifyAccessToken(token) as ITokenPayload;
    if (!payload.id) {
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

const findUser = async (userId: string) => {
  const userResult = await db
    .select()
    .from(User)
    .where(eq(User.id, userId));

  const user = userResult[0];
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
  }
  return user;
};

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    logger.info("Processing authentication token");

    const payload = await verifyAndDecodeToken(token);
    const user = await findUser(payload.id);

    req.user = {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      logger.error("Authentication failed:", error);
      next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Authentication failed"));
    }
  }
};