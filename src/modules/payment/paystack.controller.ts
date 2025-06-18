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

// ===========================
// FUNCTION 1: initializePay
// ===========================

// Initializes payment on Paystack
const initializePay = Asyncly(async (req: Request, res: Response) => {
    // Extract payment and reservation data from request body
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
        reservationId 
    } = req.body;

    // Ensure reservation ID is provided
    if (!reservationId) {
        return res.status(400).json({ error: "Reservation ID is required" });
    }

    // Prepare data to send to Paystack
    const postData = JSON.stringify({
        email: emailAddress,
        amount: totalAmount * 100, // Paystack accepts amounts in Kobo (₦1000 = 100000)
        callback_url: 'http://localhost:4000/api/v1/hotel/payment/verify/', // Paystack will call this URL after payment
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

    // Configure HTTPS request to Paystack
    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + config.paystacktestsecretkey, // Secret key for authentication
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    // Send HTTPS POST request to Paystack to initialize payment
    const paystackReq = https.request(options, paystackRes => {
        let data = '';

        // Collect data as it streams in
        paystackRes.on('data', chunk => {
            data += chunk;
        });

        // Once all response data is received
        paystackRes.on('end', async () => {
            try {
                const response = JSON.parse(data); // Parse Paystack's response

                // Save the Paystack transaction reference to the reservation in the database
                await db.update(Reservation)
                    .set({ paymentRefrence: response.data.reference })
                    .where(eq(Reservation.id, reservationId))
                    .returning();

                // Retrieve updated reservation for confirmation
                const OrderedRoom = await db
                    .select()
                    .from(Reservation)
                    .where(eq(Reservation.id, reservationId));

                // Respond with Paystack response and reservation info
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

    // Handle any errors during the HTTPS request
    paystackReq.on('error', error => {
        res.status(500).json({ error: 'Payment initialization failed' });
    });

    // Send the request data to Paystack and end the request
    paystackReq.write(postData);
    paystackReq.end();
});


// ===========================
// FUNCTION 2: verifyPayment
// ===========================

// Verifies a payment using the Paystack reference
const verifyPayment = Asyncly(async (req: Request, res: Response) => {
    // Extract payment reference from query string (?reference=xxxx)
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

        } else {
            return res.status(400).json({ error: 'Payment failed or not completed' });
        }
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Export the two controller functions
export const paystackController = { initializePay, verifyPayment };



