import { Request, Response } from 'express';
import { config } from './../../config';
import https from 'https';
import { Asyncly } from '../../extension';
import axios from 'axios';

export const initializePay = (req: Request, res: Response) => {
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
    } = req.body;

    const postData = JSON.stringify({
        email: emailAddress,
        amount: totalAmount * 100, // Paystack uses kobo (smallest unit)
        callback_url: 'http://localhost:4000/api/v1/hotel/payment/verify/', // Replace with your actual callback
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

        paystackRes.on('end', () => {
            try {
                const response = JSON.parse(data);
                console.log(response);
                res.status(200).json(response);
            } catch (err) {
                console.error('Error parsing Paystack response:', err);
                res.status(500).json({ error: 'Error parsing Paystack response' });
            }
        });
    });

    paystackReq.on('error', error => {
        console.error('Paystack Error:', error);
        res.status(500).json({ error: 'Payment initialization failed' });
    });

    paystackReq.write(postData);
    paystackReq.end();
};
const verifyPayment = Asyncly(async (req: Request, res: Response) => {
    // Get reference from query params (or trxref if you want)
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
        console.log(data);

        if (data.status === 'success') {
            return res.status(200).send('Payment successful. Thank you!');
        } else {
            return res.status(400).send('Payment failed or was not completed.');
        }
    } catch (error: any) {
        console.error('Error verifying payment:', error.message || error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

export const paystackController = { initializePay, verifyPayment };
