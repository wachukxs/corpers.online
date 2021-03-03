const dotenv = require('dotenv'); // safe to call first, before using process.env.*
dotenv.config();

const helpers = require('../constants/helpers')

helpers.email('nwachukwuossai@gmail.com', 'Ykeshia', 'Abia').then(
    (good) => {
        console.log('yes');
    },
    (bad) => {
        console.error('bad');
    }
).catch((err) => {
    console.log('when do we come here?');
}).finally(() => {
    setTimeout(() => {
        process.exit(1)
    }, 10 * 1000)
})