import { Request, Response } from 'express';
import { config } from './../../config';
import https from 'https';
import { Asyncly } from '../../extension';
import axios from 'axios';
import { db } from '../../drizzle/db';
import { Reservation } from './../reservation/reservation.model';
import { roomModel } from './../room/room.model';
import { eq} from "drizzle-orm"
import { error } from 'console';


const initializePay = Asyncly(async(req: Request, res: Response) => {
    const {
        emailAddress,
        totalAmount,
        name,
        phoneNumber,
        specialRequest,
        checkInDate,
        checkOutDate,
        noOfAdult,
        noOfChildren,
        reservationId // 👈 Required!
    } = req.body;

    if (!reservationId) {
        return res.status(400).json({ error: "Reservation ID is required" });
    }

    const postData = JSON.stringify({
        email: emailAddress,
        amount: totalAmount * 100, // Paystack uses kobo
        callback_url: 'http://localhost:4000/api/v1/hotel/payment/verify/',
        metadata: {
            name,
            phoneNumber,
            specialRequest,
            checkInDate,
            checkOutDate,
            noOfAdult,
            noOfChildren,
        },
    });

    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + config.paystacktestsecretkey,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    const paystackReq = https.request(options, paystackRes => {
        let data = '';

        paystackRes.on('data', chunk => {
            data += chunk;
        });

        paystackRes.on('end', async () => {
            try {
                const response = JSON.parse(data)

                await db.update(Reservation)
                    .set({ paymentRefrence: response.data.reference })
                    .where(eq(Reservation.id, reservationId)).returning(); 
                
                const OrderedRoom = await db
                    .select()
                    .from(Reservation)
                    .where(eq(Reservation.id, reservationId));
                console.log(OrderedRoom[0])
                res.status(200).json({
                    response,
                    OrderedRoom: OrderedRoom[0],
                });
            } catch (err) {
                console.error('Error parsing Paystack response:', err);
                res.status(500).json({ error: 'Error parsing Paystack response' });
            }
        });
    });

    paystackReq.on('error', error => {
        res.status(500).json({ error: 'Payment initialization failed' });
    });

    paystackReq.write(postData);
    paystackReq.end();
});

const verifyPayment = Asyncly(async (req: Request, res: Response) => {
    const reference = req.query.reference as string || req.query.trxref as string;

    if (!reference) {
        return res.status(400).json({ error: 'Missing payment reference' });
    }

    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${config.paystacktestsecretkey}`,
                },
            }
        );

        const data = response.data.data;

        if (data.status === 'success') {
            await db.update(Reservation)
                .set({ paymentStatus: 'paid' })
                .where(eq(Reservation.paymentRefrence, reference));
// console.log("Saved Reference:", response.data.reference); // in initializePay
// console.log("Received Reference for Verification:", reference); 
            const [roomOrdered] = await db
                .select()
                .from(Reservation)
                .where(eq(Reservation.paymentRefrence, reference));
            console.log(roomOrdered)
            // Send JSON if it's API access
            return res.status(200).json({
                message: 'Payment successful',
                reservation: roomOrdered
            });

        } else {
            return res.status(400).json({ error: 'Payment failed or not completed' });
        }
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

export const paystackController = { initializePay, verifyPayment };
