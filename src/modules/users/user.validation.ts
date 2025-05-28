import { z } from 'zod';
const passwordValidation = z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
    );
    
    
const registerSchema = z.object({
    firstName: z
        .string()
        .min(6, { message: 'First name must be at least 6 characters long' })
        .max(50, { message: 'First name must be less than 50 characters' }),
    lastName: z
        .string()
        .min(2, { message: 'Last name must be at least 2 characters long' })
        .max(50, { message: 'Last name must be less than 50 characters' }),
    email: z
        .string()
        .email({ message: 'Invalid email address' }),

    password: passwordValidation,
    
    phoneNumber: z
        .string()
        .max(11, { message: 'Phone number must be less than 11 characters' }),
    confirmPassword: passwordValidation
    }).refine((data)=> data.password === data.confirmPassword,{
        message:"Passwords don't Match",
        path:["confirmPassword"]
    });

const verifySchema = z.object({
    verificationCode: z
    .string()
    .min(6, { message: 'Verification code must be at least 6 characters long' }),
})
const LoginSchema = z.object({
    email: z
        .string()
        .email({message:'Invalid email adress'}),
    password: z
        .string()
        .min(6,{message:"invalid Email or Password "})

})

const resetpasswordRequest = z.object({
    email: z
        .string()
        .email({message:'Invalid email adress'}),
})
const resendVerficationCode = z.object({
    email: z
        .string()
        .email({message:'Invalid email adress'}).toLowerCase(),
})
export const authValidation = {registerSchema, LoginSchema,verifySchema, resetpasswordRequest, resendVerficationCode};