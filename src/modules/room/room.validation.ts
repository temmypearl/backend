import { z } from 'zod';

const room = z.object({
    roomType: z
        .string(),
    roomNo: z
        .number(),
    roomPrice: z
        .number(),
    roomAmenities: z
        .string(),
    roomAvailability: z
        .boolean(),
    code : z
       .string()   
       .nullable()
    })


export const roomDetails = {room}