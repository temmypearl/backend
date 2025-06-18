import { Request, Response } from 'express';
import { config } from './../../config'; // configuration (e.g., secret keys)
import https from 'https'; // Node.js HTTPS module to make API calls
import { Asyncly } from '../../extension'; // custom wrapper for async functions
import axios from 'axios'; // HTTP client for simpler API requests
import { db } from '../../drizzle/db'; // your Drizzle ORM database instance
import { Reservation } from './../reservation/reservation.model'; // Reservation schema/model
import { roomModel } from './../room/room.model'; // Room schema/model (unused in this file)
import { eq } from "drizzle-orm"; // helper function to build SQL queries
import { error } from 'console'; // (unused here)
import { refundTable } from './payment.model';
import { ApiError } from './../../middlewares';

const initializeFlutterwavePayment = Asyncly(async (req: Request, res: Response) => {
    const { reservationId } = req.body;

    if (!reservationId) {
        return res.status(400).json({ error: "Reservation ID is required" });
    }

    const OrderedRoom = await db
        .select()
        .from(Reservation)
        .where(eq(Reservation.id, reservationId));

    if (!OrderedRoom[0]) {
        return res.status(404).json({ error: "Reservation not found" });
    }

    const reservation = OrderedRoom[0];

    const paymentData = {
        tx_ref: `resv_${reservation.id}_${Date.now()}`,
        amount: reservation.totalPrice,
        currency: 'NGN',
        redirect_url: `https://your-frontend.com/payment/callback`,
        customer: {
            email: reservation.emailAddress,
            phonenumber: reservation.phoneNumber,
            name: reservation.name,
        },
        customizations: {
            title: "Hotel Booking Payment",
            description: `Payment for reservation ${reservation.id}`,
        }
    };

    const flutterResponse = await axios.post('https://api.flutterwave.com/v3/payments', paymentData, {
        headers: {
            Authorization: `Bearer ${config.flutterwaveSecretKey}`,
            'Content-Type': 'application/json'
        }
    });

    const { link } = flutterResponse.data.data;

    await db.update(Reservation)
        .set({ paymentRefrence: paymentData.tx_ref })
        .where(eq(Reservation.id, reservationId));

    res.status(200).json({
        paymentLink: link,
        reference: paymentData.tx_ref
    });
});

const verifyFlutterwavePayment = Asyncly(async (req: Request, res: Response) => {
    const { transaction_id } = req.query;

    if (!transaction_id) {
        return res.status(400).json({ error: "Missing transaction ID" });
    }

    const verifyUrl = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;

    const response = await axios.get(verifyUrl, {
        headers: {
            Authorization: `Bearer ${config.flutterwaveSecretKey}`
        }
    });

    const data = response.data.data;

    if (data.status === "successful") {
        await db.update(Reservation)
            .set({ paymentStatus: 'paid' })
            .where(eq(Reservation.paymentRefrence, data.tx_ref));

        const [reservation] = await db
            .select()
            .from(Reservation)
            .where(eq(Reservation.paymentRefrence, data.tx_ref));

        return res.status(200).json({
            message: "Payment successful",
            reservation
        });
    } else {
        return res.status(400).json({ error: "Payment not successful" });
    }
});
