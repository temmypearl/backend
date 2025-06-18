import { Response, Request, NextFunction } from "express";
import { Asyncly } from "./../../extension/asyncly";
import { registerValidation } from "./reservation.validation";
import { ApiError } from "../../middlewares";
import { ITokenPayload } from "../users/user.interface";
import { Reservation } from "./reservation.model";
import { db } from "./../../drizzle/db";
import { roomModel } from "./../room/room.model";
import { eq, and } from "drizzle-orm";

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

// GET /reservations/history
const getReservationHistory = Asyncly(async (req: Request, res: Response) => {
    const user = (req as any).user as ITokenPayload;

    const reservations = await db
        .select()
        .from(Reservation)
        .where(eq(Reservation.emailAddress, user.email));

    res.status(200).json({ reservations });
});

// GET /reservations/:id
const getReservationById = Asyncly(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = (req as any).user as ITokenPayload;

    const [reservation] = await db
        .select()
        .from(Reservation)
        .where(and(eq(Reservation.id, id), eq(Reservation.emailAddress, user.email)));

    if (!reservation) return next(new ApiError(404, "Reservation not found", false));

    res.status(200).json({ reservation });
});

// PATCH /reservations/:id/cancel
const cancelReservation = Asyncly(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = (req as any).user as ITokenPayload;

    const [existingReservation] = await db
        .select()
        .from(Reservation)
        .where(and(eq(Reservation.id, id), eq(Reservation.emailAddress, user.email)));

    if (!existingReservation) return next(new ApiError(404, "Reservation not found", false));

    if (existingReservation.paymentStatus === 'paid') {
        return next(new ApiError(400, "Cannot cancel a paid reservation", false));
    }

    await db.update(Reservation)
        .set({ paymentStatus: 'cancelled' })
        .where(eq(Reservation.id, id));

    res.status(200).json({ message: "Reservation cancelled successfully" });
});

// PATCH /reservations/:id/modify
const modifyReservation = Asyncly(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if(!req.body) return next(new ApiError(400, "cannot modify empty request"))
    const user = (req as any).user as ITokenPayload;
    const { checkInDate, checkOutDate, noOfAdult, noOfChildren, specialRequest } = req.body;

    const [existingReservation] = await db
        .select()
        .from(Reservation)
        .where(and(eq(Reservation.id, id), eq(Reservation.emailAddress, user.email)));

    if (!existingReservation) return next(new ApiError(404, "Reservation not found", false));

    if (existingReservation.paymentStatus === 'paid') {
        return next(new ApiError(400, "Cannot modify a paid reservation", false));
    }

    // Convert string dates to Date objects
    const updateData: any = {
        noOfAdult: noOfAdult || existingReservation.noOfAdult,
        noOfChildren: noOfChildren || existingReservation.noOfChildren,
        specialRequest: specialRequest || existingReservation.specialRequest
    };

    // Only add dates if they're provided and valid
    if (checkInDate) {
        updateData.checkInDate = new Date(checkInDate);
    }
    if (checkOutDate) {
        updateData.checkOutDate = new Date(checkOutDate);
    }

    const [updatedReservation] = await db.update(Reservation)
        .set(updateData)
        .where(eq(Reservation.id, id)).returning();

    res.status(200).json({ message: "Reservation updated successfully", reservation: updatedReservation });
});
// POST /reservations/multiple-booking
const multipleBooking = Asyncly(async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as ITokenPayload;
    const { bookings } = req.body; // Expecting [{ checkInDate, checkOutDate, noOfAdult, noOfChildren, specialRequest }, ...]

    if (!Array.isArray(bookings) || bookings.length === 0) {
        return next(new ApiError(400, "No bookings provided", false));
    }

    const results = [];
    for (const booking of bookings) {
        const availableRoom = await db
            .select()
            .from(roomModel)
            .where(eq(roomModel.roomAvailability, true))
            .limit(1);

        if (!availableRoom.length) {
            continue; // skip this booking
        }

        const roomToReserve = availableRoom[0];
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const totalAmount = roomToReserve.roomPrice * numberOfNights;

        const [newReservation] = await db
            .insert(Reservation)
            .values({
                name: user.name,
                emailAddress: user.email,
                phoneNumber: "Not provided", // or attach from profile later
                specialRequest: booking.specialRequest,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                noOfAdult: booking.noOfAdult,
                noOfChildren: booking.noOfChildren,
                roomNumber: roomToReserve.roomNo,
                roomAmanities: roomToReserve.roomAmenities,
                roomDetails: roomToReserve.roomType,
                totalPrice: totalAmount,
                paymentStatus: "Pending"
            })
            .returning();

        await db
            .update(roomModel)
            .set({ roomAvailability: false })
            .where(eq(roomModel.roomNo, roomToReserve.roomNo));

        results.push({ newReservation, room: roomToReserve });
    }

    res.status(201).json({
        message: "Multiple booking completed",
        results
    });
});


export const reservatons = { Register,   getReservationHistory,
    getReservationById,
    cancelReservation,
    modifyReservation,
    multipleBooking }

