import { Request, Response, NextFunction } from "express";
import { TokenService } from "../utils/tokens";
import { ITokenPayload } from "../modules/users/user.interface";
import { logger } from "../config";
import httpStatus from "http-status";
import { TokenExpiredError } from "jsonwebtoken";
import { ApiError } from "./apiError";
import { User } from "../modules/users/user.model";
import { db } from "src/drizzle/db";
import { eq } from "drizzle-orm"; 

export interface AuthenticatedRequest extends Request {
    token: string | ITokenPayload;
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

// const isTokenBlacklisted = async (token: string): Promise<boolean> => {
//   const blacklistedToken = await prisma.refreshToken.findFirst({
//     where: { token },
//   });
//   return !!blacklistedToken;
// };

export const requireAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) {
            logger.warn("No token provided for authentication");
            throw new ApiError(httpStatus.UNAUTHORIZED, "No token provided");
        }
        logger.info(`Received token: ${token}`);

        // if (await isTokenBlacklisted(token)) {
        //   logger.warn("Token is blacklisted");
        //   throw new ApiError(
        //     httpStatus.UNAUTHORIZED,
        //     "Unauthorized: Token has been revoked",
        //   );
        //   return;
        // }

        let payload: ITokenPayload;

        try {
            payload = TokenService.verifyAccessToken(token) as ITokenPayload;
            logger.info(`Decoded Token Payload: ${JSON.stringify(payload)}`);
        } catch (err) {
            logger.error("Token verification failed:", err);
            if (err instanceof TokenExpiredError) {
                throw new ApiError(
                    httpStatus.UNAUTHORIZED,
                    "Token expired. Please log in again",
                );
            }
            logger.error("Invalid token", err);
            throw new ApiError(
                httpStatus.UNAUTHORIZED,
                "Unauthorized: Invalid token",
            );
        }

        if (!payload.id) {
            logger.warn("Invalid token payload");
            throw new ApiError(
                httpStatus.UNAUTHORIZED,
                "Unauthorized: Invalid token",
            );
        }
        

        const userResult = await db
            .select()
            .from(User)
            .where(eq(User.id, payload.id));

        const user = userResult[0];

        if (!user) {
            logger.warn("User not found");
            throw new ApiError(
                httpStatus.UNAUTHORIZED,
                "Unauthorized: User not found",
            );
        }

        req.user = {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
        };
        next();
    } catch (error) {
        logger.error("Authentication failed", error);
        next(error);
    }
};