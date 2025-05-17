import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config(); 

const generateAccessToken = async () => {
    const rep = await axios(
      {
        url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
        method: 'post',
        data: 'grant_type=client_credentials',
        auth: {
            username: process.env.paypalClientId,
            password: process.env.paypalsecret,
        }

      }
    );

    console.log(rep.data);
}

export default generateAccessToken;