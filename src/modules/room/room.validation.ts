import { z } from 'zod';

const roomTypes = [
    "Double Deluxe",
    "Royal Standard",
    "Royal Executive",
    "Executive Suite",
    "Luxury King",
    "Premium Suite"
] as const;
const room = z.object({
    roomType: z.enum(roomTypes),
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
        .nullable(),
    roomImage: z
        .string()
    })

export const roomDetails = {room}