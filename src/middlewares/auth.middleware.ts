// import { Request, Response, NextFunction } from "express";
// import { TokenService } from "../utils/tokens";
// import { ITokenPayload } from "../modules/user/user-interface";
// import { logger } from "../config";
// import httpStatus from "http-status";
// // import { PrismaClient } from "@prisma/client";
// import { TokenExpiredError } from "jsonwebtoken";
// import { ApiError } from "./apiError";
// // const prisma = new PrismaClient();

// export interface AuthenticatedRequest extends Request {
//   token: string | ITokenPayload;
// }

// // const isTokenBlacklisted = async (token: string): Promise<boolean> => {
// //   const blacklistedToken = await prisma.refreshToken.findFirst({
// //     where: { token },
// //   });
// //   return !!blacklistedToken;
// // };

// export const requireAuth = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction,
// ): Promise<void> => {
//   try {
//     const token = req.header("Authorization")?.split(" ")[1];

//     if (!token) {
//       logger.warn("No token provided for authentication");
//       throw new ApiError(httpStatus.UNAUTHORIZED, "No token provided");
//     }
//     logger.info(`Received token: ${token}`);

//     if (await isTokenBlacklisted(token)) {
//       logger.warn("Token is blacklisted");
//       throw new ApiError(
//         httpStatus.UNAUTHORIZED,
//         "Unauthorized: Token has been revoked",
//       );
//       return;
//     }

//     let payload: ITokenPayload;

//     try {
//       payload = TokenService.verifyAccessToken(token) as ITokenPayload;
//       logger.info(`Decoded Token Payload: ${JSON.stringify(payload)}`);
//     } catch (err) {
//       logger.error("Token verification failed:", err);
//       if (err instanceof TokenExpiredError) {
//         throw new ApiError(
//           httpStatus.UNAUTHORIZED,
//           "Token expired. Please log in again",
//         );
//       }
//       logger.error("Invalid token", err);
//       throw new ApiError(
//         httpStatus.UNAUTHORIZED,
//         "Unauthorized: Invalid token",
//       );
//     }

//     if (!payload.id) {
//       logger.warn("Invalid token payload");
//       throw new ApiError(
//         httpStatus.UNAUTHORIZED,
//         "Unauthorized: Invalid token",
//       );
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: payload.id },
//     });

//     if (!user) {
//       logger.warn("User not found");
//       throw new ApiError(
//         httpStatus.UNAUTHORIZED,
//         "Unauthorized: User not found",
//       );
//     }

//     req.user = {
//       id: user.id,
//       email: user.email,
//       name: `${user.first_name} ${user.last_name}`,
//     };

//     logger.info(`✅ Token verified successfully for user ${user.id}`);
//     next();
//   } catch (error) {
//     logger.error("Authentication failed", error);
//     next(error);
//   } finally {
//     await `prisma.$disconnect()`;
//   }
// };