// Import necessary types and libraries
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

// Initializes payment on Paystack
const initializePay = Asyncly(async (req: Request, res: Response) => {
    const { reservationId } = req.body;

    if (!reservationId) {
        return res.status(400).json({ error: "Reservation ID is required" });
    }

    // STEP 1: Find the reservation in DB by ID
    const OrderedRoom = await db
        .select()
        .from(Reservation)
        .where(eq(Reservation.id, reservationId));
    
    if (!OrderedRoom[0]) {
        throw new ApiError(400, "Cannot cancel a paid reservation", false);
    }
    if(OrderedRoom[0].paymentStatus =="paid"){
       throw new ApiError(400, "Cannot cancel a paid reservation", false);
    }
    if(OrderedRoom[0].paymentStatus == "cancelled"){
        throw new ApiError(400, "Cannot cancel a paid reservation", false);
    }

    const reservation = OrderedRoom[0];

    // STEP 2: Build the Paystack postData using our database details
    const postData = JSON.stringify({
        email: reservation.emailAddress,
        amount: reservation.totalPrice * 100, // in Kobo
        callback_url: 'http://localhost:4000/api/v1/hotel/payment/verify/',
        metadata: {
            reservationId: reservation.id,
            name: reservation.name,
            phoneNumber: reservation.phoneNumber,
            specialRequest: reservation.specialRequest,
            checkInDate: reservation.checkInDate,
            checkOutDate: reservation.checkOutDate,
            noOfAdult: reservation.noOfAdult,
            noOfChildren: reservation.noOfChildren,
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

        paystackRes.on('data', chunk => { data += chunk; });

        paystackRes.on('end', async () => {
            try {
                const response = JSON.parse(data);
                const reference = response.data.reference;

                //STEP 3: Save the reference to reservation in DB
                await db.update(Reservation)
                    .set({ paymentRefrence: reference })
                    .where(eq(Reservation.id, reservationId));

                res.status(200).json({
                    authorization_url: response.data.authorization_url,
                    reference,
                });
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Error processing Paystack response' });
            }
        });
    });

    paystackReq.on('error', () => {
        res.status(500).json({ error: 'Payment initialization failed' });
    });

    paystackReq.write(postData);
    paystackReq.end();
});


// Verifies a payment using the Paystack reference
const verifyPayment = Asyncly(async (req: Request, res: Response) => {
    // Extract payment reference from query string
    const reference = req.query.reference as string || req.query.trxref as string;

    // Validate reference exists
    if (!reference) {
        return res.status(400).json({ error: 'Missing payment reference' });
    }

    try {
        // Call Paystack API to verify transaction
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${config.paystacktestsecretkey}`, // Auth header
                },
            }
        );

        const data = response.data.data; // Transaction data from Paystack

        if (data.status === 'success') {
            // If successful, mark the reservation as 'paid' in the database
            await db.update(Reservation)
                .set({ paymentStatus: 'paid' })
                .where(eq(Reservation.paymentRefrence, reference));

            // Retrieve the paid reservation for confirmation
            const [roomOrdered] = await db
                .select()
                .from(Reservation)
                .where(eq(Reservation.paymentRefrence, reference));

            // Respond to client that payment was successful with reservation details
            return res.status(200).json({
                message: 'Payment successful',
                reservation: roomOrdered
            });
            //later when the front end url is ready
            // return res.redirect(
            //     `https://yourfrontend.com/payment-success?reference=${reference}&amount=${roomOrdered.totalPrice}&name=${encodeURIComponent(roomOrdered.name)}`
            // );
        } else {
            return res.status(400).json({ error: 'Payment failed or not completed' });
        }
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

const requestRefund = Asyncly(async (req: Request, res: Response) => {
    const { reservationId } = req.params;
    const { reason } = req.body;

    // Ensure reservation exists
    const [reservation] = await db
        .select()
        .from(Reservation)
        .where(eq(Reservation.id, reservationId));

    if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
    }

    // Save the refund request
    const [createdRequest] = await db
        .insert(refundTable)
        .values({ reservationId, reason, status: "pending" })
        .returning();

    res.status(201).json({
        message: "Refund request submitted",
        data: createdRequest,
    });
});


const getInvoice = Asyncly(async (req: Request, res: Response) => {
    const { reservationId } = req.params;

    const [reservation] = await db
        .select()
        .from(Reservation)
        .where(eq(Reservation.id, reservationId));

    if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
    }

    res.status(200).json({
        invoice: {
            reservationId: reservation.id,
            amount: reservation.totalPrice,
            paymentStatus: reservation.paymentStatus,
            customer: {
                name: reservation.name,
                email: reservation.emailAddress,
                phone: reservation.phoneNumber
            },
            dates: {
                checkIn: reservation.checkInDate,
                checkOut: reservation.checkOutDate
            }
        }
    });
});
const getPaymentMethods = Asyncly(async (req: Request, res: Response) => {
    res.status(200).json({
        methods: [
            {
                name: "Paystack",
                type: "online",
                supportedCurrencies: ["NGN"],
                instructions: "Secure online payment using debit cards, bank transfers, etc."
            },
            {
                name:"Flutter Wave",
                type:"online",
                supportedCurrencies: ["NGN"],
                instructions: "Secure online payment using debit cards, bank transfers, etc."
            }
        ]
    });
});

const approveRefund = Asyncly(async (req: Request, res: Response) => {
    const { refundRequestId } = req.params;

    // Fetch refund request
    const [refund] = await db
        .select()
        .from(refundTable)
        .where(eq(refundTable.id, parseInt(refundRequestId)));

    if (!refund) {
        return res.status(404).json({ error: "Refund request not found" });
    }

    if (refund.status !== "pending") {
        return res.status(400).json({ error: "Refund has already been processed or rejected" });
    }

    // Fetch reservation to get payment reference
    const [reservation] = await db
        .select()
        .from(Reservation)
        .where(eq(Reservation.id, refund.reservationId));

    if (!reservation) {
        return res.status(404).json({ error: "Associated reservation not found" });
    }

    // Call Paystack refund API
    const paystackResponse = await axios.post(
        `https://api.paystack.co/refund`,
        { transaction: reservation.paymentRefrence },
        {
            headers: {
                Authorization: `Bearer ${config.paystacktestsecretkey}`,
                'Content-Type': 'application/json',
            },
        }
    );

    // Update refund request status
    await db
        .update(refundTable)
        .set({ status: "refunded" })
        .where(eq(refundTable.id, parseInt(refundRequestId)));

    // Also update reservation if needed
    await db
        .update(Reservation)
        .set({ paymentStatus: "refunded" })
        .where(eq(Reservation.id, refund.reservationId));

    res.status(200).json({
        message: "Refund processed successfully",
        paystackResponse: paystackResponse.data,
    });
});



// Export the two controller functions
export const paystackController = { initializePay,getPaymentMethods, verifyPayment, requestRefund , getInvoice};



