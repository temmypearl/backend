export interface UserActivityProperties {
    token: string;
    refreshToken: string;
    payload:object
    ipaddress:string
}
// customRequest.ts
import { Request } from 'express';

export interface CustomRequest extends Request {
    validatedData?: {
        lastName: string;
        firstName: string;
        email: string;
        password: string;
        phonenumber: string;
    };
}
export interface otpRequest extends Request {
    validatedOtpData?: {
        email: string;
        otp:string
    };
}
export interface resendotpRequest extends Request {
    validatedresendOtpData?: {
        email: string;
    };
}
export interface resetpasswordRequest extends Request {
    validatedresetpaaswordData?: {
        email: string;
        password: string;
        token: string;
    };
}
export interface loginRequest extends Request {
    validatedloginData?: {
        email: string;
        password:string
    };}




import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string; // Add your custom properties here
    // Add other properties as needed
  }
}