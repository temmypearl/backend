import { z } from 'zod';

const registerSchema = z.object({
    name: z
        .string({ required_error: 'Name is required' })
        .nonempty({ message: 'Name is required' })
        .min(6, { message: 'Name must be at least 6 characters long' })
        .max(50, { message: 'Name must be less than 50 characters' }),

    emailAddress: z
        .string({ required_error: 'Email address is required' })
        .nonempty({ message: 'Email address is required' })
        .email({ message: 'Invalid email address' }),

    password: z
        .string({ required_error: 'Password is required' })
        .nonempty({ message: 'Password is required' })
        .min(6, { message: 'Password must be at least 6 characters long' }),

    phoneNumber: z
        .string({ required_error: 'Phone number is required' })
        .nonempty({ message: 'Phone number is required' })
        .max(11, { message: 'Phone number must be less than 11 characters' }),

    specialRequest: z
        .string()
        .max(200, { message: 'Special request must be less than 200 characters' })
        .optional(),

    checkInDate: z
        .preprocess((val) => new Date(val as string), z.date({ required_error: 'Check-in date is required' })),

    checkOutDate: z
        .preprocess((val) => new Date(val as string), z.date({ required_error: 'Check-out date is required' })),

    noOfAdult: z
        .number({ required_error: 'Number of adults is required' }),

    noOfChildren: z
        .number({ required_error: 'Number of children is required' }),

    // paymentRefrence: z
    //     .string()
    //     .max(50, { message: 'Payment reference must be less than 50 characters' })
    //     .optional(),
    // code: z
    //     .string({ required_error: 'Code is required' })
    //     .nullable()
    //     .or(z.literal(''))  // allow empty string if needed
    });

export const registerValidation = { registerSchema };
