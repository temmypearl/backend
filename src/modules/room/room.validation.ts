import { z } from "zod";

export const roomTypes = [
    "Double Deluxe",
    "Royal Standard",
    "Royal Executive",
    "Executive Suite",
    "Luxury King",
    "Premium Suite"
] as const;

export const createRoomSchema = z.object({
    roomType: z.enum(roomTypes, { required_error: "Room type is required" }),
    roomNo: z.number({ required_error: "Room number is required" }),
    roomPrice: z.number({ required_error: "Room price is required" }),
    roomAmenities: z.string().min(3, "Room amenities is too short"),
    roomAvailability: z.boolean().optional().default(true),
    roomImage: z.string().url("Room image must be a valid URL"),
    code: z.string().nullable().optional()
});

export const editRoomSchema = z.object({
    roomType: z.enum(roomTypes).optional(),
    roomPrice: z.number().optional(),
    roomAmenities: z.string().optional(),
    roomAvailability: z.boolean().optional(),
    roomImage: z.string().url().optional(),
});

export const deleteRoomSchema = z.object({
    roomNo: z.string().regex(/^\d+$/, "Room number must be a number"),
});
