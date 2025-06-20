import { Request, Response, NextFunction } from "express";
import { eq, sql } from 'drizzle-orm';
import { roomModel } from "./room.model";
import { createRoomSchema } from "./room.validation"; // Assuming you have a Zod schema here
import { Asyncly } from "./../../extension";
import { db } from "../../drizzle/connection";
import { ApiError } from "../../middlewares"; // For error handling

// GET /hotel/getRooms
const getRooms = Asyncly(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { roomNo } = req.query;

    if (roomNo) {
        const [room] = await db
            .select()
            .from(roomModel)
            .where(eq(roomModel.roomNo, parseInt(roomNo as string)));

        if (!room) {
            return next(new ApiError(404, "Room not found", false));
        }

        return res.status(200).json({ room });
    }

    const roomsGrouped = await db
        .select({
            roomType: roomModel.roomType,
            roomPrice: roomModel.roomPrice,
            roomAmenities: roomModel.roomAmenities,
            availableCount: sql<number>`count(*)`
        })
        .from(roomModel)
        .where(eq(roomModel.roomAvailability, true))
        .groupBy(
            roomModel.roomType,
            roomModel.roomPrice,
            roomModel.roomAmenities
        );

    res.status(200).json({ roomsGrouped });
});


// POST /hotel/create
const createRoom = Asyncly(async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = createRoomSchema.parse(req.body);

    const [createdRoom] = await db
        .insert(roomModel)
        .values({
            roomType: validatedData.roomType,
            roomPrice: validatedData.roomPrice,
            roomAmenities: validatedData.roomAmenities,
            roomNo: validatedData.roomNo,
            roomAvailability: true,
            roomImage: validatedData.roomImage, 
        })
        .returning();

    res.status(201).json({
        message: "Room created successfully",
        data: createdRoom
    });
});

// PATCH /hotel/:roomNo
const editRoom = Asyncly(async (req: Request, res: Response, next: NextFunction) => {
    const { roomNo } = req.params;
    const updates = req.body;

    const [existingRoom] = await db
        .select()
        .from(roomModel)
        .where(eq(roomModel.roomNo, parseInt(roomNo)));

    if (!existingRoom) {
        return next(new ApiError(404, "Room not found", false));
    }

    const [updatedRoom] = await db
        .update(roomModel)
        .set({
            roomType: updates.roomType || existingRoom.roomType,
            roomPrice: updates.roomPrice || existingRoom.roomPrice,
            roomAmenities: updates.roomAmenities || existingRoom.roomAmenities,
            roomAvailability: updates.roomAvailability ?? existingRoom.roomAvailability,
            roomImage: updates.roomImage ?? existingRoom.roomImage
        })
        .where(eq(roomModel.roomNo, parseInt(roomNo)))
        .returning();

    res.status(200).json({
        message: "Room updated successfully",
        data: updatedRoom
    });
});

// DELETE /hotel/:roomNo
const deleteRoom = Asyncly(async (req: Request, res: Response, next: NextFunction) => {
    const { roomNo } = req.params;

    const [existingRoom] = await db
        .select()
        .from(roomModel)
        .where(eq(roomModel.roomNo, parseInt(roomNo)));

    if (!existingRoom) {
        return next(new ApiError(404, "Room not found", false));
    }

    await db.delete(roomModel).where(eq(roomModel.roomNo, parseInt(roomNo)));

    res.status(200).json({
        message: `Room ${roomNo} deleted successfully`
    });
});

export const roomController = { getRooms, createRoom, editRoom, deleteRoom };
