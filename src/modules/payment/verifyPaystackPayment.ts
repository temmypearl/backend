// const https = require('https')
// const reference = 'refrence';
// const options = {
//     hostname: 'api.paystack.co',
//     port: 443,
//     path: `/transaction/verify/${reference}`,
//     method: 'GET',
//     headers: {
//         Authorization: 'Bearer SECRET_KEY'
//     }
// }

// https.request(options, res => {
//     let data = ''

//     res.on('data', (chunk) => {
//         data += chunk
//     });

//     res.on('end', () => {
//         console.log(JSON.parse(data))
//     })
// }).on('error', error => {
//     console.error(error)
// })
