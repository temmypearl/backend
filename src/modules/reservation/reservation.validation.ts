import { z } from 'zod';

const registerSchema = z.object({
    name: z
        .string()
        .min(6, { message: 'Last name must be at least 6 characters long' })
        .max(50, { message: 'Last name must be less than 50 characters' }),
    emailAddress: z
        .string()
        .email({ message: 'Invalid email address' }),
    password: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters long' }),
    phoneNumber: z
        .string()
        .max(11, { message: 'Phone number must be less than 11 characters' }),
    specialRequest: z
        .string()
        .max(200, { message: 'Field must be less than 200 characters '}),
    checkInDate : z
        .date(),
    checkOutDate : z
        .date(),
    noOfAdult : z
        .number(),
    noOfChildren : z
        .number() ,
    code : z
       .string()   
       .nullable()
    })


export const registerValidation = {registerSchema}