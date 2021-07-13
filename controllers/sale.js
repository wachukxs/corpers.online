let express = require('express');
let router = express.Router();
const auth = require('../helpers/auth')

const saleService = require('../services').saleService

router.post('/deletesale', auth.verifyJWT, express.json(), saleService.deleteSale);

router.post('/posts', auth.verifyJWT, /* upload.array('see', 12), */ saleService.create);

router.post('/updatesale', auth.verifyJWT, saleService.update)

module.exports = router;