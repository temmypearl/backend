import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import https from 'https';

export const initializePay = (req: Request, res: Response) => {
    const userdetail = JSON.stringify({
        email: req.query.email, 
        amount: req.query.amount             
    });

    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + process.env.paystacktestsecretkey,
            'Content-Type': 'application/json'
        }
    };

    const paystackReq = https.request(options, paystackRes => {
        let data = '';

        paystackRes.on('data', (chunk) => {
            data += chunk;
        });

        paystackRes.on('end', () => {
            const response = JSON.parse(data);
            console.log(response);
            res.status(200).json(response);
        });
    });

    paystackReq.on('error', error => {
        console.error(error);
        res.status(500).json({ error: 'Payment initialization failed' });
    });

    paystackReq.write(userdetail);
    paystackReq.end();
};
