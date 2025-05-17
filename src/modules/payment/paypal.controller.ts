import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config(); 

const generateAccessToken = async () => {
    const rep = await axios(
      {
        url: process.env.paypalurl + '/v1/oauth2/token',
        method: 'post',
        data: 'grant_type=client_credentials',
        auth: {
            username: process.env.paypalClientId,
            password: process.env.paypalsecret,
        }

      }
    );

return rep.data.access_token;
}

const creareOrder = async()=>{
    const accessToken = await generateAccessToken();
    const response = await axios({
        url: process.env.paypalurl + '/v2/checkout/orders',
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ` + accessToken,
        },
        data: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    items:[
                        {
                            name: 'room name',
                            discription: 'room description',
                            quantity: '1',
                            unit_amount: {
                                currency_code: 'USD',
                                value: '100.00'
                            }

                        }
                    ],

                    amount:{
                        currency_code: 'USD',
                        value: '100.00', // Must equal sum of item amounts
                        breakdown: {
                            item_total: {
                            currency_code: 'USD',
                            value: '100.00'
                    }
                    }
                },
                application_context: {
                    return_url: 'https',
                    cancel_url: 'https'
                }

        }],
            
        })
    })

    console.log(response.data);
}

export default creareOrder;