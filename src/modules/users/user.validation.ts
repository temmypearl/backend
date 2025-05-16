import { z } from 'zod';

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
    password: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters long' }),
    phoneNumber: z
        .string()
        .max(11, { message: 'Phone number must be less than 11 characters' }),
    confirmPassword: z
        .string()
        
    }).refine((data)=> data.password === data.confirmPassword,{
        message:"Passwords don't Match",
        path:["confirmPassword"]
    });


const LoginSchema = z.object({
    email: z
        .string()
        .email({message:'Invalid email adress'}),
    password: z
        .string()
        .min(6,{message:"invalid Email or Password "})

})

export const authValidation = {registerSchema, LoginSchema}