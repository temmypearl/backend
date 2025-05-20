import jwt, { SignOptions } from "jsonwebtoken";
import { Request } from "express";

import dotenv from "dotenv"
import path from "path"


dotenv.config({
    path: path.join(__dirname, '../../.env')
});

export const generateAccessToken = (userId: string): string => {
    const secret: string | undefined = process.env.SECRET_STR;
    const expiresIn: any | undefined = process.env.EXPIRES_IN;

    if (!secret || !expiresIn) {
        throw new Error("SECRET_STR or EXPIRES_IN environment variable is not defined");
    }

    const options: SignOptions = { expiresIn };

    return jwt.sign({ userId }, secret, options);
};

export const generateRefreshToken = (userId: string): string => {
    const refreshSecret: string | undefined = process.env.REFRESH_SECRET;
    const refreshTokenExpiry: any | undefined = process.env.refreshTokenExpiry;

    if (!refreshSecret || !refreshTokenExpiry) {
        throw new Error("REFRESH_SECRET or refreshTokenExpiry environment variable is not defined");
    }

    const options: SignOptions = { expiresIn: refreshTokenExpiry };

    return jwt.sign({ userId }, refreshSecret, options);
};

export const verifyToken = (token: string, secret: string) => {
    try {
            return jwt.verify(token, secret);
        } catch (err) {
            return null;
    }
};

// Function to extract IP Address
export const getIpAddress = (req: Request): string => {
    return (
        (req.headers['x-forwarded-for'] as string | string[] || '').toString() || 

        req.socket.remoteAddress || 

        req.ip || 
        
        "Unknown"
    );
};