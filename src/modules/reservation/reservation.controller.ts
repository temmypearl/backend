import { Response, Request, NextFunction } from "express";
import { Asyncly } from "./../../extension/asyncly";
import { registerValidation } from "./reservation.validation";
import { ApiError } from "../../middlewares";
import { Reservation } from "./reservation.model";
import { db } from "./../../drizzle/db";
import { roomModel } from "./../room/room.model";
import { eq } from "drizzle-orm";

const Register = Asyncly(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { name, emailAddress, phoneNumber, specialRequest, checkInDate, checkOutDate, noOfAdult, noOfChildren } = req.body;

    // Step 1: Check available room
    const availableRoom = await db
        .select()
        .from(roomModel)
        .where(eq(roomModel.roomAvailability, true))
        .limit(1);

    if (!availableRoom.length) {
        return next(new ApiError(404, "No available rooms", false));
    }

    const roomToReserve = availableRoom[0];
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = roomToReserve.roomPrice * numberOfNights;

    // Step 2: Create reservation
    const [newReservation] = await db
        .insert(Reservation)
        .values({
            name,
            emailAddress,
            phoneNumber,
            specialRequest,
            checkInDate,
            checkOutDate,
            noOfAdult,
            noOfChildren,
            roomNumber: roomToReserve.roomNo,
            roomAmanities: roomToReserve.roomAmenities,
            roomDetails: roomToReserve.roomType,
            totalPrice: totalAmount,
            paymentStatus: "Pending"
        })
        .returning();

    // Step 3: Update room availability
    await db
        .update(roomModel)
        .set({ roomAvailability: false })
        .where(eq(roomModel.roomNo, roomToReserve.roomNo));

    // Step 4: Timeout to reset room
    setTimeout(async () => {
        try {
            const [currentReservation] = await db
                .select()
                .from(Reservation)
                .where(eq(Reservation.id, newReservation.id));

            if (currentReservation?.paymentStatus !== 'paid') {
                await db
                    .update(roomModel)
                    .set({ roomAvailability: true })
                    .where(eq(roomModel.roomNo, roomToReserve.roomNo));

                console.log(`Room ${roomToReserve.roomNo} availability reset after timeout`);
            }
        } catch (error) {
            console.error('Error resetting room availability:', error);
        }
    }, 15 * 60 * 1000); // 15 minutes

    res.status(201).json({
        message: "Reservation successful, now pay",
        totalAmount,
        reservationData: newReservation,
        roomToReserve
    });
});


export const reservatons = { Register }

