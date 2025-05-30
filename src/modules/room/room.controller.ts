import { Express, Request, Response } from "express";
import { eq, sql } from 'drizzle-orm';
import { roomModel } from "./room.model";
import { roomDetails } from "./room.validation";
import { Asyncly } from "src/extension";
import { db } from "src/drizzle/db";

const getRooms = Asyncly(async (req, res): Promise<any> => {

    const roomsGrouped = await db
        .select({
            roomType: roomModel.roomType,
            availableCount: sql<number>`count(*)`
        })
        .from(roomModel)
        .where(eq(roomModel.roomAvailability, true))
        .groupBy(roomModel.roomType);

    res.status(200).json({
        roomsGrouped
    })
})

export const roomController = {getRooms}