import axios from 'axios';
const https = require('https')
import dotenv from 'dotenv';
dotenv.config(); 

const params = JSON.stringify({
    "email": "customer@email.com",
    "amount": "500000"
    })

    const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
        Authorization: 'Bearer ' + process.env.paystacktestsecretkey,
        'Content-Type': 'application/json'
    }
    }

    const req = https.request(options, res => {
    let data = ''

    res.on('data', (chunk) => {
        data += chunk
    });

    res.on('end', () => {
        console.log(JSON.parse(data))
    })
    }).on('error', error => {
    console.error(error)
    })

    req.write(params)
    req.end()