import { Response, Request, NextFunction } from "express";
import { Asyncly } from "./../../extension/asyncly";
import { registerValidation } from "./reservation.validation";
import { ApiError } from "../../middlewares";
import { Reservation } from "./reservation.model";
import { db } from "./../../drizzle/db";
import { roomModel } from "./../room/room.model";
import { eq } from "drizzle-orm";

const Register = Asyncly(async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    // Step 1: Create reservation
    const { name, emailAddress, phoneNumber, specialRequest, checkInDate, checkOutDate, noOfAdult, noOfChildren } = req.body;


    const reservation = await db.insert(Reservation).values({
        name,
        emailAddress,
        phoneNumber,
        specialRequest,
        checkInDate,
        checkOutDate,
        noOfAdult,
        noOfChildren,

    });
    const reservationDetails = await db
        .select()
        .from(Reservation)
        .where(eq(Reservation.emailAddress, emailAddress));
    // Step 2: Find available room of preferred type (optional: filter by roomType, etc.)
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
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const numberOfNights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    const roomPrice = roomToReserve.roomPrice;

    const totalAmount = roomPrice * numberOfNights;
    // Step 3: Update room availability to false
    await db
        .update(roomModel)
        .set({ roomAvailability: false })
        .where(eq(roomModel.roomNo, roomToReserve.roomNo));

    // chedule room availability reset after 15 minutes (900000 ms)
    setTimeout(async () => {
        try {
            // Re-fetch the reservation or check payment status
            const currentReservation = await db
                .select()
                .from(Reservation)
                .where(eq(Reservation.emailAddress, emailAddress));

            if (currentReservation.length > 0) {
                // Suppose you have a field 'paymentStatus' to check if paid or not
                const paymentStatus = currentReservation[0].paymentStatus;

                // If still unpaid or status pending, free the room
                if (paymentStatus !== 'paid') {
                    await db
                        .update(roomModel)
                        .set({ roomAvailability: true })
                        .where(eq(roomModel.roomNo, roomToReserve.roomNo));

                    console.log(`Room ${roomToReserve.roomNo} availability reset after timeout`);
                }
            }
        } catch (error) {
            console.error('Error resetting room availability:', error);
        }
    }, 15 * 60 * 1000);

    res.status(201).json({
        message: "Reservation successful, now pay",
        totalAmount: totalAmount,
        reservationData: reservationDetails
    });

});

export const reservatons = { Register }

